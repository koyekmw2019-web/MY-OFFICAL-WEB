import { getConnectionString, getDatabase } from '@netlify/database';
import type { Context } from '@netlify/functions';
import { requireAdmin } from './_shared/auth.mts';
import { makeRuntimePreflight } from './_shared/qa-db-runtime-preflight.mjs';
import { makeQaPreflightAdmin } from './_shared/qa-db-runtime-auth01.mjs';

// Temporary QA-only endpoint. Do not deploy automatically or include in production.
// No global context mutation: the fallback receives only this invocation's request.
const authorize = makeQaPreflightAdmin({requireAdmin, env:process.env});
export default async (req: Request, context: Context) => {
  const handler = makeRuntimePreflight({
    getConnectionString, getDatabase, env:process.env,
    requireAdmin:()=>authorize(req,context)
  });
  return handler(req,context);
};
