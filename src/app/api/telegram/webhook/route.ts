import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Telegram bot webhook — answers commands sent to @Pars_sell_bot.
 *
 * Registered via setWebhook (see README). Incoming updates are validated with
 * the TELEGRAM_WEBHOOK_SECRET header (X-Telegram-Bot-Api-Secret-Token) when
 * the secret env var is configured on Cloudflare Pages.
 */

const SITE_URL = "https://parscell.exhibition2world.ir";
const BOT_URL = "https://t.me/Pars_sell_bot";

type Update = {
  message?: {
    chat?: { id: number };
    text?: string;
  };
};

function keyboard(rows: { label: string; url: string }[][]) {
  return {
    inline_keyboard: rows.map((row) =>
      row.map((b) => ({ text: b.label, url: b.url }))
    ),
  };
}

function menuKeyboard() {
  return keyboard([
    [
      { label: "🗺 نقشه فروشندگان", url: SITE_URL },
      { label: "📄 کاتالوگ محصولات", url: `${SITE_URL}/api/catalog/html` },
    ],
    [
      { label: "🤖 RAG آنالیز", url: SITE_URL },
      { label: "📞 تلگرام ادمین", url: BOT_URL },
    ],
  ]);
}

export async function GET() {
  return Response.json({
    ok: true,
    bot: "@Pars_sell_bot",
    commands: ["/start", "/help", "/map", "/catalog", "/leads", "/rag", "/contact"],
    note: "This route receives POST updates from Telegram when the webhook is registered.",
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: "bot token not configured" }, { status: 503 });
  }

  let update: Update;
  try {
    update = (await request.json()) as Update;
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const chatId = update.message?.chat?.id;
  const raw = (update.message?.text ?? "").trim();
  if (!chatId) return Response.json({ ok: true, ignored: true });
  const cmd = raw.toLowerCase().startsWith("/") ? raw.toLowerCase().split("@")[0] : "text";

  let text: string;
  let replyMarkup = menuKeyboard();

  switch (cmd) {
    case "/start":
      text = [
        "سلام! به ربات <b>BLDC Map Signal</b> خوش آمدید 👋",
        "",
        "من اعلان‌های مرکز عملیات موتورهای BLDC را برای شما ارسال می‌کنم و از طریق منوی زیر به بخش‌های مختلف سایت دسترسی دارید:",
      ].join("\n");
      break;
    case "/help":
      text = [
        "<b>راهنمای ربات</b>",
        "",
        "/map — نقشه فروشندگان ایران و جهانی",
        "/catalog — کاتالوگ تجمیع‌شده محصولات",
        "/leads — آمار بانک لیدها",
        "/rag — آنالیز RAG کاتالوگ‌ها",
        "/contact — راه‌های ارتباط",
        "",
        "برای خروج از دریافت اعلان‌ها کافی است بلاک کنید یا /start را در جای دیگری بزنید.",
      ].join("\n");
      break;
    case "/map":
      text = "🗺 <b>نقشه فروشندگان BLDC</b>\n۲۳ فروشنده و سازنده ایرانی + ۱۰۰ شرکت بین‌المللی (چین و سایر کشورها) روی نقشه تعاملی:";
      break;
    case "/catalog":
      text = "📄 <b>کاتالوگ محصولات</b>\nنسخه HTML آماده چاپ کاتالوگ تجمیع‌شده (خانگی و صنعتی) را باز کنید:";
      replyMarkup = keyboard([[{ label: "دانلود کاتالوگ HTML", url: `${SITE_URL}/api/catalog/html` }, { label: "CSV", url: `${SITE_URL}/api/catalog` }]]);
      break;
    case "/leads":
      text = "📊 <b>بانک لیدها</b>\nاعلان هر لید جدید از همین ربات ارسال می‌شود. برای مشاهده کامل داشبورد از دکمه زیر استفاده کنید:";
      break;
    case "/rag":
      text = "🤖 <b>RAG آنالیز کاتالوگ</b>\nآنالیز سمانتیک کاتالوگ‌های PDF (نیان موتور و HTI) در بخش RAG داشبورد:";
      break;
    case "/contact":
      text = "📞 <b>ارتباط</b>\nInstagram: @yasinrou\nTelegram: @Pars_sell_bot\nسایت: parscell.exhibition2world.ir";
      break;
    default:
      text = "برای استفاده از ربات، یک دستور از منو انتخاب کنید یا از دکمه‌های زیر استفاده کنید:";
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || !data?.ok) {
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true, replied: cmd });
}
