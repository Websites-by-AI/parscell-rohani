import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * One-time bootstrap & maintenance for the Bale bot, run from the Cloudflare
 * edge (the sandbox/dev machine may not be able to reach tapi.bale.ai).
 *
 * POST /api/bale/setup  header: x-admin-secret: <TELEGRAM_WEBHOOK_SECRET>
 *   body: {"action":"register"}       → setWebhook (default)
 *   body: {"action":"capture_chat"}   → temporarily deleteWebhook, read the
 *        latest chat id via getUpdates (from the operator's /start), then
 *        re-register the webhook. Use the returned chatId as BALE_CHAT_ID.
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

  let body: { action?: unknown };
  try {
    body = (await request.json().catch(() => ({}))) as { action?: unknown };
  } catch {
    body = {};
  }
  const action = String(body.action ?? "register");
  const webhookUrl = new URL(request.url).origin + "/api/bale/webhook";

  if (action === "capture_chat") {
    // 1. Pause the webhook so getUpdates is allowed.
    await fetch(`https://tapi.bale.ai/bot${token}/deleteWebhook`, { method: "POST" }).catch(() => null);

    // 2. Read recent updates to find the operator chat.
    const updatesRes = await fetch(`https://tapi.bale.ai/bot${token}/getUpdates?limit=20&timeout=0`);
    const updates = (await updatesRes.json().catch(() => ({}))) as {
      ok?: boolean;
      result?: { message?: { chat?: { id: number; first_name?: string; username?: string }; text?: string } }[];
    };

    let chatId: number | null = null;
    let chatName = "";
    if (updates.ok && Array.isArray(updates.result)) {
      for (const u of updates.result) {
        const chat = u.message?.chat;
        if (chat?.id) {
          chatId = chat.id;
          chatName = `${chat.first_name ?? ""}${chat.username ? ` @${chat.username}` : ""}`.trim();
        }
      }
    }

    // 3. Re-register the webhook.
    await fetch(`https://tapi.bale.ai/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] }),
    }).catch(() => null);

    return Response.json({ ok: true, chatId, chatName, webhookUrl });
  }

  if (action === "commands") {
    const res = await fetch(`https://tapi.bale.ai/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "start", description: "شروع و راهنمای سریع" },
          { command: "help", description: "راهنمای کامل ربات" },
          { command: "map", description: "نقشه فروشندگان ایران و جهانی" },
          { command: "catalog", description: "کاتالوگ محصولات BLDC" },
          { command: "leads", description: "بانک لیدها و آمار" },
          { command: "register", description: "ثبت‌نام با شماره موبایل" },
          { command: "users", description: "کاربران دموی سامانه" },
          { command: "clinic", description: "کاربران دموی کلینیک" },
          { command: "migration", description: "ایجنت‌های مهاجرت — بخش ۱" },
          { command: "migration2", description: "ایجنت‌های مهاجرت — بخش ۲" },
          { command: "contact", description: "راه‌های ارتباط" },
        ],
      }),
    });
    const cmdData = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!res.ok || !cmdData?.ok) {
      return Response.json({ ok: false, error: cmdData?.description ?? "Bale API error" }, { status: 502 });
    }
    return Response.json({ ok: true, message: "Bale command menu set (11 commands)" });
  }

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
