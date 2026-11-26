// Local/CI only. Execute actual auth and exam-health source with synthetic SDKs.
// No network, real Identity, PostgreSQL, payment or YKCR calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const roleSource = stripTypeScriptTypes(read('netlify/functions/_shared/admin-role.mts'),{mode:'strip'}).replace(/^export /gm,'');
const auth = read('netlify/functions/_shared/auth.mts');
const health = read('netlify/functions/exam-health.mts');
const authSource = stripTypeScriptTypes(auth,{mode:'strip'})
  .replace(/^import .*;$/gm,'')
  .replace(/^export /gm,'');
const healthSource = stripTypeScriptTypes(health,{mode:'strip'})
  .replace(/^import .*;$/gm,'')
  .replace('export default async','const healthHandler = async');
assert.ok(!/^import |^export /m.test(authSource+'\n'+healthSource));
function fixture(user, {schemaReady=true}={}) {
  const calls={identity:0,db:0,sql:[],errors:0};
  const ctx=vm.createContext({Response,Request,URL,
    getUser:async()=>{calls.identity++;return user;},
    getDatabase:()=>{calls.db++;return {sql:async(parts,...params)=>{
      const query=parts.join('?');calls.sql.push({query,params});
      assert.match(query.trim(),/^SELECT\b/i);
      return [{exists:schemaReady,absent:schemaReady}];
    }};},
    console:{error:()=>{calls.errors++;}}
  });
  vm.runInContext(roleSource+'\n'+authSource+'\n'+healthSource+'\nglobalThis.api={requireUser,requireAdmin,asResponse,healthHandler};',ctx);
  return {api:ctx.api,calls};
}
const req=method=>new Request('https://qa.example.test/.netlify/functions/exam-health',{method});
const user=roles=>({id:'synthetic-member',roles});
const cases=[
  ['unauthenticated null',null,401],
  ['unauthenticated undefined',undefined,401],
  ['missing roles',{id:'synthetic-member'},403],
  ['undefined roles',user(undefined),403],
  ['null roles',user(null),403],
  ['empty roles',user([]),403],
  ['normal member',user(['member']),403],
  ['string admin',user('admin'),403],
  ['string contains admin',user('notadmin'),403],
  ['object with includes',user({includes:()=>true}),403],
  ['array-like object',user({0:'admin',length:1}),403],
  ['numeric roles',user(123),403],
  ['mixed malformed array',user(['admin',null]),403],
  ['nested role array',user([['admin']]),403],
  ['sparse array',user([,'admin']),403],
  ['case variant',user(['Admin']),403],
  ['substring role',user(['superadmin']),403],
  ['whitespace variant',user([' admin ']),403],
  ['client metadata is not authorization',{id:'synthetic-member',roles:[],user_metadata:{roles:['admin']},app_metadata:{roles:['admin']}},403],
];
for(const [label,identity,status] of cases) test(label+' — deny before DB and no internal error',async()=>{
  const {api,calls}=fixture(identity);
  const r=await api.healthHandler(req('GET'));
  assert.equal(r.status,status);
  assert.equal(await r.text(),status===401?'Unauthorized':'Forbidden');
  assert.equal(calls.identity,1);assert.equal(calls.db,0);assert.equal(calls.sql.length,0);assert.equal(calls.errors,0);
});
for(const roles of [['admin'],['member','admin']])test('valid admin: '+roles.join(',')+' — unchanged SELECT-only health',async()=>{
  const identity=user(roles);const {api,calls}=fixture(identity);
  assert.equal(await api.requireAdmin(),identity);
  const r=await api.healthHandler(req('GET'));assert.equal(r.status,200);
  const body=await r.json();assert.equal(body.ready,true);assert.equal(Object.keys(body.checks).length,12);
  assert.equal(calls.db,1);assert.equal(calls.sql.length,12);assert.equal(calls.errors,0);
});
test('authenticated normal member still allowed by requireUser',async()=>{
  const identity={id:'synthetic-member'};const {api,calls}=fixture(identity);
  assert.equal(await api.requireUser(),identity);assert.equal(calls.db,0);
});
test('wrong method blocks identity and DB',async()=>{
  const {api,calls}=fixture(user(['admin']));const r=await api.healthHandler(req('POST'));
  assert.equal(r.status,405);assert.equal(calls.identity,0);assert.equal(calls.db,0);
});
test('admin schema not ready retains 503',async()=>{
  const {api,calls}=fixture(user(['admin']),{schemaReady:false});const r=await api.healthHandler(req('GET'));
  assert.equal(r.status,503);assert.equal((await r.json()).ready,false);assert.equal(calls.sql.length,12);
});
