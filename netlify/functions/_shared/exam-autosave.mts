// An authoritative timer per section. Never accept client-supplied deadline timestamps.
export const sectionDurations: Record<string, number[]> = {
  jlpt_n1: [110, 55], jlpt_n2: [105, 50], jlpt_n3: [30, 70, 40],
  jlpt_n4: [25, 55, 35], jlpt_n5: [20, 40, 30],
  truck: [80], taxi: [80], bus: [80], maintenance: [80],
  car: [50], motorcycle: [50], moped: [30]
};
export const maxCheckpointBytes = 130_000;
export const initialDeadline = (examType: string, startedAt: string | Date) =>
  new Date(new Date(startedAt).getTime() + (sectionDurations[examType]?.[0] ?? 80) * 60000);
export function isValidSnapshot(v: unknown): v is Record<string, any> {
  if (!v || Array.isArray(v) || typeof v !== "object") return false;
  const s = v as Record<string, any>;
  return s.version === 1 && typeof s.type === "string" && typeof s.engine === "string" &&
    Number.isSafeInteger(s.index ?? 0) && (s.index ?? 0) >= 0 &&
    (Array.isArray(s.answers) || (s.engine === 'jlpt' && Array.isArray(s.responses) && Array.isArray(s.stages)));
}

/** v7.63: one free attempt for each exam type. Abandoning never restores its quota. */
export const EXAM_FREE_POLICY = 'ONE_PER_EXAM_TYPE' as const;
export const checkpointGraceSeconds = 60;
/** v7.87.11: The Netlify Database adapter may wrap a Neon/Postgres error in
 * WaddlerQueryError.cause. Check the *structured* code and constraint in each
 * cause instead of matching arbitrary message text. No change to free quotas.
 * Bound traversal protects against cycles and unexpected thrown values.
 */
function pgErrorChain(e:unknown): Record<string, any>[] {
  const chain:Record<string,any>[]=[];
  const seen=new Set<unknown>();
  let current:unknown=e;
  for(let n=0;n<6&&current&&typeof current==='object'&&!seen.has(current);n++){
    seen.add(current);
    chain.push(current as Record<string,any>);
    current=(current as Record<string,any>).cause;
  }
  return chain;
}
export const isMissingCheckpointTable = (e:unknown) => pgErrorChain(e).some(x=>
  x.code==='42P01' && /exam_attempt_checkpoints/.test(String(x.message??'')));
export const isFreeUniqueViolation = (e:unknown) => pgErrorChain(e).some(x=>
  x.code==='23505' && /^exam_one_free_attempt(?:_per_user_type|_per_user)?$/.test(String(x.constraint??'')));

/** Close any phase expired past grace, so abandoned attempts cannot block resuming
 * indefinitely. Free quota is retained per exam type. Preserves all rows. */
export async function abandonExpiredAttempts(db:any, userId:string) {
  const rows = await db.sql`UPDATE exam_attempts AS a SET status='abandoned'
    FROM exam_attempts AS owned LEFT JOIN exam_attempt_checkpoints AS c ON c.attempt_id=owned.id
    WHERE a.id=owned.id AND a.user_id=${userId} AND a.status='started'
      AND (
        (c.attempt_id IS NOT NULL AND NOW() > c.ends_at + INTERVAL '60 seconds')
        OR (c.attempt_id IS NULL AND NOW() > owned.started_at +
           (CASE owned.exam_type
            WHEN 'jlpt_n1' THEN 110 WHEN 'jlpt_n2' THEN 105 WHEN 'jlpt_n3' THEN 30
            WHEN 'jlpt_n4' THEN 25 WHEN 'jlpt_n5' THEN 20
            WHEN 'car' THEN 50 WHEN 'motorcycle' THEN 50 WHEN 'moped' THEN 30
            ELSE 80 END * INTERVAL '1 minute') + INTERVAL '60 seconds')
      ) RETURNING a.id`;
  return rows.length;
}

export const examScoreRules:Record<string,{max:number;pass:number;minimumElapsedSeconds:number}> = {
  truck:{max:50,pass:30,minimumElapsedSeconds:5},
  taxi:{max:50,pass:30,minimumElapsedSeconds:5},
  bus:{max:50,pass:30,minimumElapsedSeconds:5},
  maintenance:{max:45,pass:29,minimumElapsedSeconds:5},
  car:{max:95,pass:90,minimumElapsedSeconds:5},
  motorcycle:{max:95,pass:90,minimumElapsedSeconds:5},
  moped:{max:48,pass:45,minimumElapsedSeconds:5},
  jlpt_n1:{max:180,pass:100,minimumElapsedSeconds:5},
  jlpt_n2:{max:180,pass:90,minimumElapsedSeconds:5},
  jlpt_n3:{max:180,pass:95,minimumElapsedSeconds:5},
  jlpt_n4:{max:180,pass:90,minimumElapsedSeconds:5},
  jlpt_n5:{max:180,pass:80,minimumElapsedSeconds:5}
};
/** STAGE A only: these scores are unverified practice results. */
export function practicePassed(type:string, score:number, sections:any):boolean {
  const rule=examScoreRules[type]; if(!rule)throw Error('Unsupported exam');
  if(['truck','taxi','bus'].includes(type) && sections &&
     Number.isInteger(sections.theory) && Number.isInteger(sections.practical) &&
     sections.theory>=0 && sections.theory<=30 && sections.practical>=0 && sections.practical<=20 &&
     sections.theory+sections.practical===score) return sections.theory>=18 && sections.practical>=12;
  if(type==='maintenance' && sections &&
     Number.isInteger(sections.theory) && Number.isInteger(sections.practical) &&
     sections.theory>=0 && sections.theory<=30 && sections.practical>=0 && sections.practical<=15 &&
     sections.theory+sections.practical===score) return sections.theory>=20 && sections.practical>=9;
  if(type.startsWith('jlpt_') && Array.isArray(sections)) {
    const expected=type==='jlpt_n1'||type==='jlpt_n2'||type==='jlpt_n3'?[60,60,60]:[120,60];
    if(sections.length===expected.length && sections.every((s:any,i:number)=>Number.isInteger(s?.score) && s.score>=0 && s.score<=expected[i]) &&
       sections.reduce((n:number,s:any)=>n+s.score,0)===score) {
      return score>=rule.pass && sections.every((s:any,i:number)=>s.score>=(expected[i]===120?38:19));
    }
  }
  // When no section breakdown is provided, do not assert an uncheckable pass.
  if(['maintenance','truck','taxi','bus'].includes(type)||type.startsWith('jlpt_'))return false;
  return score>=rule.pass;
}
