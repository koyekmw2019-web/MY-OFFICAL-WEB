// AUTH01: QA-only fallback for a missing Identity SDK request context.
// The platform Netlify Team principal is NOT an application Identity user.
import { QA } from './qa-db-fingerprint-v7902.mjs';
import { PATH } from './qa-db-runtime-preflight.mjs';

const IDENTITY_USER_URL = QA.origin + '/.netlify/identity/user';
const TOKEN_COOKIE = 'nf_jwt'; // pinned @netlify/identity 2.0.0 access cookie
const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_TOKEN = 8192;
const MAX_REPLY = 64 * 1024;
const deny = status => new Response(null, {status});
const validId = id => typeof id === 'string' && id.length > 0 && id.length <= 128 && !/[\s\x00-\x1f\x7f]/u.test(id);
const validRoles = roles => Array.isArray(roles) && Array.from(roles).every(role => typeof role === 'string') && roles.includes('admin');

function checkScope(req, context, env) {
  const url = new URL(req.url);
  if (url.origin !== QA.origin || url.pathname !== PATH || url.search || url.hash ||
      env?.SITE_ID !== QA.site || context?.site?.id !== QA.site || context?.account?.id !== QA.team ||
      context?.deploy?.context !== 'production' || context?.deploy?.published !== true) throw deny(404);
  if (!validId(context?.user?.id)) throw deny(403);
  if (!['GET', 'POST'].includes(req.method)) throw deny(405);
  if (req.method === 'POST' && req.headers.get('origin') !== QA.origin) throw deny(403);
}

// Read only the recognized application access cookie via the per-request
// platform adapter. Do not forward the full cookie header, refresh token,
// team token, visitor-supplied Authorization/role headers or any request URL.
function readAccessCookie(req, context) {
  const raw = req.headers.get('cookie');
  // If present, reject ambiguous duplicate Identity cookies, including casing
  // tricks. The platform's per-request cookie parser is the source of value.
  if (raw !== null) {
    if (raw.length > 32768) return null;
    const candidates = raw.split(';').map(part => part.trim()).filter(part =>
      part.split('=', 1)[0].trim().toLowerCase() === TOKEN_COOKIE);
    if (candidates.length !== 1 || !candidates[0].startsWith(TOKEN_COOKIE + '=')) return null;
  }
  const token = context?.cookies?.get?.(TOKEN_COOKIE);
  if (typeof token !== 'string' || token.length > MAX_TOKEN || !JWT_SHAPE.test(token)) return null;
  if (raw !== null) {
    const candidate = raw.split(';').map(part=>part.trim()).find(part=>part.startsWith(TOKEN_COOKIE + '='));
    // A present raw cookie must agree with the platform parser.
    if (candidate !== undefined && candidate.slice(TOKEN_COOKIE.length+1) !== token) return null;
  }
  return token;
}

async function readVerifiedUser(response) {
  if (response.status === 401 || response.status === 403) throw deny(response.status);
  if (response.status !== 200 || response.redirected || (response.url && response.url !== IDENTITY_USER_URL) ||
      response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw deny(503);
  const declared = response.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_REPLY)) throw deny(503);
  const reader = response.body?.getReader();
  if (!reader) throw deny(503);
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REPLY) { await reader.cancel(); throw deny(503); }
      chunks.push(value);
    }
    let user;
    try { user = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { throw deny(503); }
    if (!user || typeof user !== 'object' || Array.isArray(user) || !validId(user.id)) throw deny(401);
    // Same role source as the pinned SDK's toUser(), from the authenticated
    // provider response, never user_metadata or decoded/unverified JWT claims.
    if (!validRoles(user.app_metadata?.roles)) throw deny(403);
    return {id:user.id};
  } finally { reader.releaseLock(); }
}

export function makeQaPreflightAdmin({requireAdmin, fetchIdentity = fetch, env}) {
  return async (req, context) => {
    checkScope(req, context, env);
    try {
      const admin = await requireAdmin();
      if (validId(admin?.id)) return {id:admin.id};
      // The old outer guard also treats missing identity ID as unauthorized.
    } catch (error) {
      // Never override an explicit denial from the existing application guard.
      if (!(error instanceof Response) || error.status !== 401) throw error;
    }
    const token = readAccessCookie(req, context);
    if (!token) throw deny(401);
    // A live provider validates the signature, expiry, and site-local identity.
    // The JWT is not decoded locally, stored, logged, or returned.
    let response;
    try {
      response = await fetchIdentity(IDENTITY_USER_URL, {
        method:'GET', headers:{Authorization:'Bearer ' + token, Accept:'application/json'},
        redirect:'error', cache:'no-store', credentials:'omit', signal:AbortSignal.timeout(5000)
      });
      return await readVerifiedUser(response);
    } catch (error) {
      if (error instanceof Response && [401,403].includes(error.status)) throw deny(error.status);
      throw deny(503);
    }
  };
}
