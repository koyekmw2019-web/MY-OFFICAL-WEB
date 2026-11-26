// Student-only validation. Do not alter the shared YKCR date helper.
export function studentDate(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid class date');
  const s = value.trim().replaceAll('/', '-');
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) throw new Error('Invalid class date');
  const [y,m,d] = s.split('-').map(Number);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > days[m-1]) throw new Error('Invalid class date');
  return `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
export function studentDateRange(start: unknown, expiry: unknown) {
  const classStart = studentDate(start), expireDate = studentDate(expiry);
  if (classStart > expireDate) throw new Error('Class start must not be after expiry');
  return {classStart, expireDate};
}
// Keep existing case-sensitive IDs and code semantics. No format migration.
export function studentText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  return s.length > 0 && s.length <= max && !/[\x00-\x1f\x7f]/.test(s) ? s : null;
}
