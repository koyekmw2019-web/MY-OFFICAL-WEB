import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { makeScheduledCleanup } from './_shared/student-rate-maintenance.mjs';
// QA only, disabled until separately approved Functions-scope runtime opt-in.
export const config: Config={schedule:'*/15 * * * *'};
export default makeScheduledCleanup({getDatabase,env:process.env});
