import { findByPhone, findById, maskPassword } from "@/data/accounts";

export const runtime = "edge";

/**
 * Demo authentication against the demo database (src/data/accounts.ts).
 * DEMO ONLY — the token is not cryptographically signed; production should
 * use the D1 schema in db/d1-schema.sql with hashed passwords + a real JWT.
 */

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function encodeToken(payload: unknown): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export async function POST(request: Request) {
  let body: { phone?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const phone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  const account = findByPhone(phone);
  if (!account || account.password !== password) {
    return Response.json(
      { ok: false, error: "شماره یا رمز عبور صحیح نیست (دمو: demo123)" },
      { status: 401 }
    );
  }

  const token = encodeToken({ id: account.id, exp: Date.now() + TOKEN_TTL_MS });
  return Response.json({ ok: true, token, account: maskPassword(account) });
}

export async function GET(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");

  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString()) as { id?: string; exp?: number };
    if (!payload.id || !payload.exp || payload.exp < Date.now()) throw new Error("expired");
    const account = findById(payload.id);
    if (!account) throw new Error("not found");
    return Response.json({ ok: true, account: maskPassword(account) });
  } catch {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
}
