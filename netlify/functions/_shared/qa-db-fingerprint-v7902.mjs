import { createHash, timingSafeEqual } from 'node:crypto';

export const QA = Object.freeze({
  origin: 'https://yekun-ordinary-second-qa.netlify.app',
  site: '56d19e67-cc2c-4bfe-802e-ce3c198494a3',
  team: '6b00669b8ca1a2a210030417',
  path: '/.netlify/functions/qa-db-fingerprint-v7902'
});
const ALLOWED_OPTIONS = new Set(['sslmode', 'channel_binding', 'connect_timeout', 'application_name']);
// Netlify Support case #1208802: only the first DNS label's trailing -pooler is an alias.
function normalizeHost(host) {
  const labels = host.toLowerCase().split('.');
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) throw Error('Invalid hostname');
  labels[0] = labels[0].replace(/-pooler$/, '');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(labels[0])) throw Error('Invalid normalized hostname');
  return labels.join('.');
}
export function endpointParts(raw) {
  if (typeof raw !== 'string' || raw.length > 8192) throw Error('Invalid connection');
  const u = new URL(raw.trim());
  if (!['postgres:', 'postgresql:'].includes(u.protocol) || !/^[a-z0-9.-]+$/i.test(u.hostname) || u.hash || !/^\/[^/]+$/.test(u.pathname)) throw Error('Unsupported endpoint');
  for (const key of u.searchParams.keys()) if (!ALLOWED_OPTIONS.has(key)) throw Error('Unsupported connection option');
  const database = decodeURIComponent(u.pathname.slice(1));
  if (!database || /[\x00-\x1f\x7f/]/.test(database)) throw Error('Invalid database');
  const host = u.hostname.toLowerCase();
  return { host: normalizeHost(host), port: u.port || '5432', database, runtimeUsesPooler: host.split('.')[0].endsWith('-pooler') };
}
export function endpointFingerprint(parts) {
  return createHash('sha256').update(JSON.stringify(['YKOC-QA-DB-ENDPOINT-v2', parts.host, parts.port, parts.database]), 'utf8').digest('hex');
}
const HEADERS = Object.freeze({ 'Cache-Control': 'private, no-store, max-age=0', 'Pragma': 'no-cache', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'" });
const reply = (status, result) => Response.json(result, { status, headers: HEADERS });
const FORM = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>YKOC private QA database check</title><h1>QA database endpoint verification</h1><p>Team login only. FIX04: Paste a NEW 64-character SHA-256 fingerprint from the FIX04 offline helper using the QA dashboard connection. Old fingerprints are not accepted. Never paste the connection URL or password here.</p><form method="post" autocomplete="off"><label>Expected QA fingerprint <input name="fingerprint" type="password" required minlength="64" maxlength="64" pattern="[a-f0-9]{64}" autocomplete="off" spellcheck="false"></label><button type="submit">Run read-only verification</button></form><p>This checks only the normalized endpoint. No database client or SQL query is used.</p></html>`;
async function readExpected(req) {
  if (req.headers.get('content-type')?.split(';')[0].trim() !== 'application/x-www-form-urlencoded') return null;
  const reader = req.body?.getReader(); if (!reader) return null;
  let bytes = 0; const chunks = [];
  try {
    while (true) { const {done, value} = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 100) { await reader.cancel(); return null; } chunks.push(value); }
    const values = [...new URLSearchParams(Buffer.concat(chunks).toString('utf8'))];
    return values.length === 1 && values[0][0] === 'fingerprint' && /^[a-f0-9]{64}$/.test(values[0][1]) ? values[0][1] : null;
  } finally { reader.releaseLock(); }
}
export async function runDiagnostic(req, context, dependencies) {
  try {
    // Trusted platform metadata: headers from a visitor cannot grant access.
    const url = new URL(req.url);
    if (url.origin !== QA.origin || url.pathname !== QA.path || url.search || url.hash || context?.site?.id !== QA.site || context?.account?.id !== QA.team || context?.deploy?.context !== 'production' || context?.deploy?.published !== true) return reply(404, {status:'blocked'});
    if (!context?.user?.id) return reply(403, {status:'blocked'});
    // Same-origin referrers are safe here: the exact GET URL has no query or secret.
    // no-referrer on a native POST form can turn Origin into null in Chromium.
    // Only the form document changes policy; every JSON response stays no-referrer.
    if (req.method === 'GET') return new Response(FORM, {headers:{...HEADERS,'Referrer-Policy':'same-origin','Content-Type':'text/html; charset=utf-8'}});
    if (req.method !== 'POST') return reply(405, {status:'blocked'});
    if (req.headers.get('origin') !== QA.origin) return reply(403, {status:'blocked'});
    const expected = await readExpected(req);
    if (!expected) return reply(400, {status:'invalid_fingerprint'});
    // Read only the runtime URL from the SDK. No database client, connection or SQL.
    // Do not log or return the raw URL, its parts, or either fingerprint.
    const parts = endpointParts(await dependencies.getConnectionString());
    const actual = endpointFingerprint(parts);
    if (!timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex'))) return reply(409, {status:'endpoint_mismatch', endpointMatch:false, selectExecuted:false, runtimeUsesPooler:parts.runtimeUsesPooler});
    return reply(200, {status:'verified_normalized_endpoint', endpointMatch:true, selectExecuted:false, runtimeUsesPooler:parts.runtimeUsesPooler});
  } catch { return reply(503, {status:'unverified'}); } // No raw error or credentials in logs/response.
}
