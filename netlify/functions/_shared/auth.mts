import { getUser } from "@netlify/identity";
import { hasAdminRole } from "./admin-role.mts";

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  // Missing or malformed role claims must fail closed before any admin operation.
  if (!hasAdminRole(user.roles)) throw new Response("Forbidden", { status: 403 });
  return user;
}

export function asResponse(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
}
