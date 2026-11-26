import { getDatabase } from '@netlify/database';
import { requireAdmin } from './_shared/auth.mts';
import { makeReadinessHandler } from './_shared/student-rate-maintenance.mjs';
export default makeReadinessHandler({getDatabase,requireAdmin,env:process.env});
