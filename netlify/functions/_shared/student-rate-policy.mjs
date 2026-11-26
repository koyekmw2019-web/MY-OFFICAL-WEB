// FIX06-B rolling-window policy. Storage is injected; no process-local counter.
import { createHash } from 'node:crypto';
export const WINDOW_MS = 900_000;
export const PAIR_LIMIT = 5;
export const ACCOUNT_LIMIT = 20;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const accountKey = id => hash(['YKOC-FIX06B-account-v1',id]);
export const pairKey = (id,studentCode) => hash(['YKOC-FIX06B-pair-v1',id,studentCode]);
const validTime = n => Number.isSafeInteger(n) && n >= 0;
const hex = s => typeof s==='string' && /^[0-9a-f]{64}$/.test(s);
export function evaluateFailures(events, pair, now) {
  if (!validTime(now) || !hex(pair) || !Array.isArray(events)) throw Error('Invalid rate state');
  const active = [];
  for (const e of events) {
    if (!e || !hex(e.pair) || !validTime(e.at) || e.at > now) throw Error('Invalid rate event');
    if (e.at > now-WINDOW_MS) active.push(e);
  }
  const all = active.map(e=>e.at).sort((a,b)=>a-b);
  const matching = active.filter(e=>e.pair===pair).map(e=>e.at).sort((a,b)=>a-b);
  // When both limits hold, the later eligibility time wins. Correct even for
  // excess records from a previous policy version. Boundary is (now-15m, now].
  const wait = (xs,n) => xs.length>=n ? xs[xs.length-n]+WINDOW_MS-now : 0;
  const ms = Math.max(wait(all,ACCOUNT_LIMIT),wait(matching,PAIR_LIMIT));
  return {allowed:ms===0,retryAfter:ms>0?Math.max(1,Math.ceil(ms/1000)):0};
}
// Store contract: atomic(accountKey, callback) must hold a cross-instance account
// lock from before time/read until after durable commit. All tx operations use
// the same DB transaction, including student linking. Return only after commit.
export async function verifyWithLimit(store,user,studentCode,check) {
  if (typeof user?.id!=='string' || !user.id || user.id.length>512) throw Error('Invalid identity');
  const account=accountKey(user.id), pair=pairKey(user.id,studentCode);
  return store.atomic(account,async tx=>{
    const now=await tx.now();
    const events=await tx.readFailures(now-WINDOW_MS);
    const gate=evaluateFailures(events,pair,now);
    if(!gate.allowed) return {status:429,body:{error:'Too many verification attempts. Please retry later.'},retryAfter:gate.retryAfter};
    const result=await check(tx);
    if(!result || ![200,403,409].includes(result.status)) throw Error('Unexpected verification outcome');
    // Approved policy: any well-formed denied verification counts, including
    // unknown IDs, inactive students, and ownership conflicts. Success never clears.
    if(result.status===403||result.status===409){
      const recordedAt=await tx.now();
      if(!validTime(recordedAt)||recordedAt<now) throw Error('Invalid failure clock');
      await tx.recordFailure({pair,at:recordedAt});
    }
    return result;
  });
}
