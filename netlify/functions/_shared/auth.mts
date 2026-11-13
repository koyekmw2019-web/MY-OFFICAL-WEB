import { getUser } from "@netlify/identity";

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  // Netlify Identity may omit roles for ordinary users. Treat absent/malformed
  // roles as zero privileges, not a TypeError that leaks as HTTP 500.
  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (!roles.includes("admin")) throw new Response("Forbidden", { status: 403 });
  return user;
}

export function asResponse(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
}
