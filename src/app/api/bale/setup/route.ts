import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * One-time bootstrap for the Bale bot: registers the webhook from the
 * Cloudflare edge (the sandbox/dev machine may not be able to reach
 * tapi.bale.ai directly).
 *
 * POST /api/bale/setup  with header: x-admin-secret: <TELEGRAM_WEBHOOK_SECRET>
 */
export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-admin-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }

  const token = process.env.BALE_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: "BALE_BOT_TOKEN is not configured." }, { status: 503 });
  }

  const webhookUrl = new URL(request.url).origin + "/api/bale/webhook";

  const response = await fetch(`https://tapi.bale.ai/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] }),
  });

  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!response.ok || !data?.ok) {
    return Response.json(
      { ok: false, error: data?.description ?? "Bale API error", webhookUrl },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, webhookUrl, message: data.description });
}
