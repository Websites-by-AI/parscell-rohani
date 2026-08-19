import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Telegram integration for the "messaging center".
 *
 * Sends notifications from the dashboard to the operator's Telegram chat via
 * the Pars_sell_bot bot. Configuration comes from Cloudflare Pages
 * environment variables:
 *   - TELEGRAM_BOT_TOKEN  (set on the Pages project)
 *   - TELEGRAM_CHAT_ID    (the chat that receives notifications)
 *
 * Bot command menu + webhook: see /api/telegram/webhook.
 */

const ALLOWED_TOPICS = ["lead_added", "proposal_ready", "test"] as const;
type Topic = (typeof ALLOWED_TOPICS)[number];

const TOPIC_LABELS: Record<Topic, string> = {
  lead_added: "🆕 لید جدید به بانک اضافه شد",
  proposal_ready: "📄 پروپوزال برای مرکز پیام‌رسانی آماده شد",
  test: "📬 پیام آزمایشی از داشبورد",
};

const CHANNELS = [
  { id: "telegram", label: "تلگرام", status: "فعال" },
  { id: "whatsapp", label: "واتساپ", status: "به‌زودی" },
  { id: "email", label: "ایمیل", status: "به‌زودی" },
  { id: "sms", label: "پیامک", status: "به‌زودی" },
  { id: "iranian", label: "بله / روبیکا / ایتا", status: "به‌زودی" },
];

function clean(value: unknown, maxLength = 200): string {
  return String(value ?? "")
    .replace(/[<>&]/g, "")
    .trim()
    .slice(0, maxLength);
}

export async function GET() {
  const configured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return Response.json({
    ok: true,
    configured,
    bot: configured ? "Pars_sell_bot" : null,
    chatId: process.env.TELEGRAM_CHAT_ID ?? null,
    channels: CHANNELS,
    webhook: "active",
  });
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    return Response.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured on this deployment." },
      { status: 503 }
    );
  }
  if (!chatId) {
    return Response.json(
      {
        ok: false,
        error:
          "TELEGRAM_CHAT_ID is not configured yet — open t.me/Pars_sell_bot and press START once, then the operator chat can receive notifications.",
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
    "— BLDC Map Signal · MOTORLEAD OS",
  ].join("\n");

  if (dryRun) {
    return Response.json({ ok: true, dryRun: true, topic, preview: text });
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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
      { ok: false, error: data?.description ?? "Telegram API error" },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, sent: true, topic });
}
