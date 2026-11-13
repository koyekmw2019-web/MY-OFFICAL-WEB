/** Run with node (no Netlify/DB dependencies). */
import assert from 'node:assert/strict';
import {validateLead,dateOk,validId} from '../netlify/functions/_shared/yk-crm-validation-v7878.mjs';
const ok={name:'Aye Aye',contact:'messenger-display-name',channel:'messenger',course:'truck',source:'facebook',status:'new',
 followUpDate:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\//g,'-'),notes:'Asked about course schedule',studentCode:null};
assert(validateLead(ok).ok);
assert.equal(validateLead({...ok,followUpDate:'2026-02-30'}).ok,false);
assert.equal(validateLead({...ok,course:'jlpt_n1'}).ok,false);
assert.equal(validateLead({...ok,status:'hacked'}).ok,false);
assert.equal(validateLead({...ok,contact:'x'.repeat(181)}).ok,false);
assert.equal(validateLead({...ok,studentCode:'x" OR 1=1'}).ok,false);
assert.equal(validateLead({...ok,name:'\u0000wrong'}).ok,false);
assert.equal(validateLead({...ok,notes:'a'.repeat(1001)}).ok,false);
assert.equal(validateLead({...ok,followUpDate:null}).ok,true);
assert.equal(validateLead({...ok,status:'enrolled',studentCode:'YKCR_101'}).ok,true);
assert.equal(validId('42'),42);assert.equal(validId('0'),null);assert.equal(validId('2.1'),null);
assert(!dateOk('2026-99-99'));
console.log('PASS v7878-crm: validation, status, optional YKCR reference, dates and length limits');
