import type { Context } from '@netlify/functions';
import { getDatabase, getConnectionString } from '@netlify/database';
import { runDiagnostic } from './_shared/qa-db-fingerprint-v7902.mjs';

/** Temporary QA-only diagnostic. Remove before any production release review. */
export default async (req: Request, context: Context) =>
  runDiagnostic(req, context, { getDatabase, getConnectionString });
