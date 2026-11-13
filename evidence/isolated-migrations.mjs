import {PGlite} from '@electric-sql/pglite';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const root=resolve(process.argv[2]||'.','netlify/database/migrations')+'/';
const db=new PGlite();let checks=[];
const files=readdirSync(root).filter(x=>x.endsWith('.sql')).sort();
try {
 for(const f of files){await db.exec(readFileSync(root+f,'utf8'));checks.push({name:f,status:'PASS'});}
 const types=['truck','taxi','bus','maintenance','car','motorcycle','moped','jlpt_n1','jlpt_n2','jlpt_n3','jlpt_n4','jlpt_n5','nishu'];
 for(const t of types)await db.query("INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES('qa-only',$1,'free')",[t]);
 await assert.rejects(db.query("INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES('qa-only','nishu','free')"),e=>e.code==='23505');
 await assert.rejects(db.query("INSERT INTO exam_attempts(user_id,exam_type,access_mode) VALUES('qa-invalid','invalid','free')"),e=>e.code==='23514');
 const before=(await db.query('SELECT * FROM exam_attempts ORDER BY id')).rows;
 for(const f of files.filter(x=>/20261112|20261113/.test(x)))await db.exec(readFileSync(root+f,'utf8'));
 assert.deepEqual((await db.query('SELECT * FROM exam_attempts ORDER BY id')).rows,before);
 checks.push({name:'13 exam types; duplicate free attempt denied; unknown type denied; 3 migrations replay without row changes',status:'PASS'});
}catch(e){checks.push({name:'migration execution',status:'FAIL',error:String(e)});process.exitCode=1;}
finally{await db.close();writeFileSync('isolated-db-result.json',JSON.stringify({engine:'PGlite embedded PostgreSQL; disposable in-memory DB, NOT Netlify Neon',checks},null,2));console.log(JSON.stringify(checks,null,2));}
