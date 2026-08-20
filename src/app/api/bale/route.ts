import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Bale (بل) messaging channel — same flow as /api/telegram, over the
 * Telegram-compatible Bale Bot API (https://tapi.bale.ai).
 *
 * Env vars on Cloudflare Pages:
 *   - BALE_BOT_TOKEN  (bot @power_sell_bot)
 *   - BALE_CHAT_ID    (operator chat — captured automatically on /start,
 *                      see /api/bale/webhook)
 */

const ALLOWED_TOPICS = ["lead_added", "proposal_ready", "test"] as const;
type Topic = (typeof ALLOWED_TOPICS)[number];

const TOPIC_LABELS: Record<Topic, string> = {
  lead_added: "🆕 لید جدید به بانک اضافه شد",
  proposal_ready: "📄 پروپوزال برای پیام‌رسانی آماده شد",
  test: "📬 پیام آزمایشی از داشبورد",
};

const CHANNELS = [
  { id: "telegram", label: "تلگرام", status: "فعال" },
  { id: "bale", label: "بله (Bale)", status: "فعال" },
  { id: "whatsapp", label: "واتساپ", status: "به‌زودی" },
  { id: "email", label: "ایمیل", status: "به‌زودی" },
  { id: "sms", label: "پیامک", status: "به‌زودی" },
];

declare global {
  var __baleLastChatId: number | undefined;
}

function clean(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    .replace(/[<>&]/g, "")
    .trim()
    .slice(0, maxLength);
}

export async function GET() {
  const configured = Boolean(process.env.BALE_BOT_TOKEN && process.env.BALE_CHAT_ID);
  return Response.json({
    ok: true,
    configured,
    bot: "power_sell_bot",
    link: "ble.ir/power_sell_bot",
    chatId: process.env.BALE_CHAT_ID ?? null,
    channels: CHANNELS,
  });
}

export async function POST(request: NextRequest) {
  const token = process.env.BALE_BOT_TOKEN;
  const chatId = process.env.BALE_CHAT_ID ?? (globalThis.__baleLastChatId ? String(globalThis.__baleLastChatId) : undefined);

  if (!token) {
    return Response.json({ ok: false, error: "BALE_BOT_TOKEN is not configured on this deployment." }, { status: 503 });
  }
  if (!chatId) {
    return Response.json(
      {
        ok: false,
        error:
          "BALE_CHAT_ID is not configured yet — open ble.ir/power_sell_bot and press START once, then the operator chat can receive notifications.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = (body ?? {}) as { topic?: unknown; title?: unknown; details?: unknown; dryRun?: unknown };
  const topic = clean(payload.topic, 40) as Topic;
  const dryRun = payload.dryRun === true;

  if (!ALLOWED_TOPICS.includes(topic)) {
    return Response.json(
      { ok: false, error: `Unknown topic. Allowed: ${ALLOWED_TOPICS.join(", ")}` },
      { status: 400 }
    );
  }

  const title = clean(payload.title, 120) || "پیام از داشبورد BLDC Map Signal";
  const details = Array.isArray(payload.details)
    ? payload.details.slice(0, 5).map((d) => clean(d, 200)).filter(Boolean)
    : [];

  const text = [
    TOPIC_LABELS[topic],
    `<b>${title}</b>`,
    ...details.map((d) => `• ${d}`),
    "",
    "— BLDC Map Signal · Bale",
  ].join("\n");

  if (dryRun) {
    return Response.json({ ok: true, dryRun: true, topic, preview: text });
  }

  const response = await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!response.ok || !data?.ok) {
    return Response.json(
      { ok: false, error: data?.description ?? "Bale API error" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, sent: true, topic, channel: "bale" });
}
