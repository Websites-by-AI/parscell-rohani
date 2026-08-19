/**
 * Demo database — accounts & roles (public demo data, no real credentials).
 *
 * Roles: admin (مدیر سامانه), buyer (خریدار/کاربر), seller (فروشنده),
 * customer (مشتری). This module is the seed of the demo database; production
 * tables are defined in db/d1-schema.sql (Cloudflare D1).
 */

export type Role = "admin" | "buyer" | "seller" | "customer";

export interface DemoAccount {
  id: string;
  name: string;
  role: Role;
  phone: string;
  password: string;
  company?: string;
  city?: string;
  note: string;
}

export const roleLabels: Record<Role, string> = {
  admin: "مدیر سامانه",
  buyer: "خریدار (کاربر)",
  seller: "فروشنده",
  customer: "مشتری",
};

export const demoAccounts: DemoAccount[] = [
  { id: "adm-01", name: "مدیر سامانه", role: "admin", phone: "09120000001", password: "demo123", company: "BLDC Map Signal", city: "تهران", note: "مدیر کل پنل" },
  { id: "byr-01", name: "رضا کریمی", role: "buyer", phone: "09121111111", password: "demo123", company: "بازرگانی کریمی", city: "تهران", note: "خریدار تجهیزات تهویه" },
  { id: "slr-01", name: "نیان موتور (Nian Motor)", role: "seller", phone: "09123333333", password: "demo123", company: "نیان موتور", city: "مشهد", note: "فروشنده و سازنده BLDC خانگی" },
  { id: "slr-02", name: "توسعه حرکت HTI", role: "seller", phone: "09124444444", password: "demo123", company: "HTI", city: "تهران", note: "سازنده موتور صنعتی" },
  { id: "cst-01", name: "مهدی رضایی", role: "customer", phone: "09125555555", password: "demo123", company: "تهویه آسایش اصفهان", city: "اصفهان", note: "مشتری پروژه‌های HVAC" },
  { id: "cst-02", name: "سارا احمدی", role: "customer", phone: "09126666666", password: "demo123", company: "ساختمان سبز شیراز", city: "شیراز", note: "مشتری پمپ و فن کم‌مصرف" },
];

/** Demo users of the Clinic Signal project — shown in the Telegram bot too. */
export const clinicDemoUsers = [
  { name: "کلینیک آنیل", phone: "02144027589", note: "P1 · بحرانی — دامنه" },
  { name: "کلینیک آفتاب", phone: "02144216446", note: "P1 · پایه محلی" },
  { name: "کلینیک رویای آبی", phone: "02186080081", note: "P1 · Growth + Recovery" },
  { name: "کلینیک الیزه", phone: "02122874413", note: "P1 · Local + Recovery" },
  { name: "کلینیک گلبرگ", phone: "02177298888", note: "P1 · رشد منطقه‌ای" },
];

export function findByPhone(phone: string): DemoAccount | undefined {
  const p = phone.replace(/[\s\-+]/g, "").replace(/^98(?=9\d{9}$)/, "0");
  return demoAccounts.find((a) => a.phone === p);
}

export function findById(id: string): DemoAccount | undefined {
  return demoAccounts.find((a) => a.id === id);
}

export function maskPassword(account: DemoAccount): Omit<DemoAccount, "password"> {
  const { password: _pw, ...rest } = account;
  return rest;
}
