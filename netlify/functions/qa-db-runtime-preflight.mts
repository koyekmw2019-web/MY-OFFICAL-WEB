import { getConnectionString, getDatabase } from '@netlify/database';
import { requireAdmin } from './_shared/auth.mts';
import { makeRuntimePreflight } from './_shared/qa-db-runtime-preflight.mjs';

// Temporary QA-only endpoint. Do not deploy automatically or include in production.
export default makeRuntimePreflight({getConnectionString,getDatabase,requireAdmin,env:process.env});
