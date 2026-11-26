// Shared fail-closed role validation for Identity claims.
export function isRoleArray(roles: unknown): roles is string[] {
  return Array.isArray(roles) && Array.from(roles).every(role => typeof role === 'string');
}
export function hasAdminRole(roles: unknown): boolean {
  return isRoleArray(roles) && roles.includes('admin');
}
