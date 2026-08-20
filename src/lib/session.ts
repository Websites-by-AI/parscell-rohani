import {
  demoAccounts,
  maskPassword,
  type DemoAccount,
  type Role,
} from "@/data/accounts";

/**
 * Client-side demo database & session layer.
 *
 * The seeded demo accounts live in src/data/accounts.ts; newly registered
 * users are persisted in this browser's localStorage ("demo database").
 * In production this layer is replaced by the D1 schema in db/d1-schema.sql
 * (users + telegram_users tables) with hashed passwords and a real JWT.
 */

export type Session = { token: string; account: Omit<DemoAccount, "password"> };

const SESSION_KEY = "bldc_session";
const REGISTRY_KEY = "bldc_registered_users";

export function normalizePhone(input: string): string {
  return input
    .replace(/[\s\-+()]/g, "")
    .replace(/^0098(?=9\d{9}$)/, "0")
    .replace(/^98(?=9\d{9}$)/, "0");
}

export function getRegisteredUsers(): DemoAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DemoAccount[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: DemoAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
  } catch {
    /* storage full / private mode — demo continues in memory */
  }
}

export function findAccountByPhone(phone: string): DemoAccount | undefined {
  const norm = normalizePhone(phone);
  return (
    demoAccounts.find((a) => a.phone === norm) ??
    getRegisteredUsers().find((a) => a.phone === norm)
  );
}

function encodeToken(payload: unknown): string {
  const json = JSON.stringify(payload);
  if (typeof window === "undefined") return Buffer.from(json).toString("base64url");
  return btoa(unescape(encodeURIComponent(json)));
}

function writeSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.token || !parsed.account) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function login(phone: string, password: string): { session: Session } | { error: string } {
  const account = findAccountByPhone(phone);
  if (!account) {
    return { error: "شماره یافت نشد — ابتدا ثبت‌نام کنید یا از حساب‌های دمو استفاده کنید." };
  }
  if (account.password !== password) {
    return { error: "رمز عبور صحیح نیست (دمو: demo123)." };
  }
  const token = encodeToken({ id: account.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const session: Session = { token, account: maskPassword(account) };
  writeSession(session);
  return { session };
}

export type RegisterInput = {
  name: string;
  phone: string;
  password: string;
  role: Role;
  company?: string;
  city?: string;
};

export function registerUser(input: RegisterInput): { session: Session } | { error: string } {
  const name = input.name.trim().slice(0, 80);
  const phone = normalizePhone(input.phone);
  const role = input.role;

  if (name.length < 3) return { error: "نام و نام خانوادگی را کامل وارد کنید." };
  if (!/^09\d{9}$/.test(phone)) return { error: "شماره موبایل معتبر نیست (مثال: 09121111111)." };
  if ((input.password ?? "").length < 6) return { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." };
  if (!["admin", "buyer", "seller", "customer", "marketer"].includes(role)) return { error: "نقش نامعتبر است." };
  if (findAccountByPhone(phone)) return { error: "این شماره موبایل قبلاً ثبت شده است — وارد شوید." };

  const account: DemoAccount = {
    id: `reg-${Date.now()}`,
    name,
    role,
    phone,
    password: input.password,
    company: input.company?.trim() || undefined,
    city: input.city?.trim() || undefined,
    note: "ثبت‌نام جدید (دمو)",
  };

  saveRegisteredUsers([...getRegisteredUsers(), account]);
  return login(phone, account.password);
}
