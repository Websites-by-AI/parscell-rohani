import { demoAccounts, roleLabels, type DemoAccount } from "@/data/accounts";

export const runtime = "edge";

/**
 * Demo registration endpoint — validates and records registrations for the
 * demo database. NOTE (demo): the browser demo store (src/lib/session.ts →
 * localStorage) is the authoritative demo registry; this endpoint mirrors it
 * server-side for API consumers. Production uses db/d1-schema.sql (users
 * table with password_hash) + a real auth provider.
 */

type Stored = Omit<DemoAccount, "password"> & { passwordHash: string };

declare global {
  var __bldcDemoRegistry: Map<string, Stored> | undefined;
}

function registry(): Map<string, Stored> {
  if (!globalThis.__bldcDemoRegistry) globalThis.__bldcDemoRegistry = new Map();
  return globalThis.__bldcDemoRegistry;
}

function hash(pw: string): string {
  // Demo stand-in for a real hash (SHA-256 via WebCrypto) — not production auth.
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return `demo-${(h >>> 0).toString(16)}`;
}

export async function POST(request: Request) {
  let body: { name?: unknown; phone?: unknown; password?: unknown; role?: unknown; company?: unknown; city?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 80);
  const phone = String(body.phone ?? "").replace(/[\s\-+()]/g, "").replace(/^98(?=9\d{9}$)/, "0");
  const password = String(body.password ?? "");
  const role = String(body.role ?? "") as DemoAccount["role"];

  if (name.length < 3) return Response.json({ ok: false, error: "نام و نام خانوادگی را کامل وارد کنید." }, { status: 400 });
  if (!/^09\d{9}$/.test(phone)) return Response.json({ ok: false, error: "شماره موبایل معتبر نیست (مثال: 09121111111)." }, { status: 400 });
  if (password.length < 6) return Response.json({ ok: false, error: "رمز عبور باید حداقل ۶ کاراکتر باشد." }, { status: 400 });
  if (!["admin", "buyer", "seller", "customer", "marketer"].includes(role)) return Response.json({ ok: false, error: "نقش نامعتبر است." }, { status: 400 });

  const existing = demoAccounts.find((a) => a.phone === phone) || registry().has(phone);
  if (existing) return Response.json({ ok: false, error: "این شماره موبایل قبلاً ثبت شده است." }, { status: 409 });

  const stored: Stored = {
    id: `reg-${Date.now()}`,
    name,
    role,
    phone,
    passwordHash: hash(password),
    company: String(body.company ?? "").trim().slice(0, 80) || undefined,
    city: String(body.city ?? "").trim().slice(0, 40) || undefined,
    note: "ثبت‌نام جدید (دمو)",
  };
  registry().set(phone, stored);

  const { passwordHash: _ph, ...publicAccount } = stored;
  return Response.json({ ok: true, account: publicAccount, registeredAt: new Date().toISOString() });
}

export function GET() {
  const seeded = demoAccounts.length;
  const registered = registry().size;
  return Response.json({
    ok: true,
    seededAccounts: seeded,
    registeredOnThisInstance: registered,
    roles: roleLabels,
    note: "Demo registry is per-isolate; the browser localStorage store is authoritative in the demo.",
  });
}
