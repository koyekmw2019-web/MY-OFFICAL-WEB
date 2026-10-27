import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const EXAM_TYPES = new Set(["truck","taxi","bus","maintenance","car","motorcycle","moped"]);
export const PLAN_DAYS: Record<string, number> = { week: 7, month: 30, "3months": 90, year: 365 };
export const PLAN_PRICE: Record<string, number> = { week: 1000, month: 2000, "3months": 3000, year: 5000 };

export function hashVerificationCode(code: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = createHash("sha256").update(`${salt}:${code}`).digest("hex");
  return `${salt}:${digest}`;
}

export function verifyCode(code: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = createHash("sha256").update(`${salt}:${code}`).digest("hex");
  const a = Buffer.from(actual, "hex"), b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a,b);
}

export function normalizeDate(value: unknown) {
  const s = String(value ?? "").trim().replaceAll("/","-");
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) throw new Error(`Invalid date: ${s}`);
  const [y,m,d] = s.split("-").map(Number);
  return `${String(y).padStart(4,"0")}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export function generatedCode(prefix="YK") {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
