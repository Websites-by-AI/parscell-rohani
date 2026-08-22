import type { NextRequest } from "next/server";
import { migrationAgents, type MigrationAgent } from "@/data/immigration";

export const runtime = "edge";

/**
 * Webhook for @shahrokh_imigration_bot (گروه مهاجرتی شاهرخ).
 * Serves the migration-agent knowledge compiled from the immigration repos
 * (SBZ-EDU/shahrokh-immigration-turkey, Websites-by-AI/AI-Iimmigration-visa-
 * assistant-, Websites-by-AI/Soh_visa_by_xprize).
 *
 * Validated with the shared TELEGRAM_WEBHOOK_SECRET (secret_token).
 */

const BOT_URL = "https://t.me/shahrokh_imigration_bot";

type Update = { message?: { chat?: { id: number }; text?: string } };

function keyboard(rows: { label: string; url: string }[][]) {
  return { inline_keyboard: rows.map((row) => row.map((b) => ({ text: b.label, url: b.url }))) };
}

function menuKeyboard() {
  return keyboard([
    [{ label: "🏢 شاهان (Shaahan)", url: "https://apply.shaahan.com/" }],
    [{ label: "🗺 داشبورد BLDC", url: "https://parscell.exhibition2world.ir" }],
  ]);
}

const TURKEY_ROUTES = [
  "⚡ <b>اکسپرس ملکی ۴۰۰K$</b> — شهروندی مستقیم + پاسپورت ترکیه، ۳–۶ ماه",
  "🏠 <b>اقامت ملکی ۲۰۰K$</b> — کیملیک ۱ ساله (بدون اجازه کار)، تمدیدشدنی",
  "🎓 <b>تحصیلی</b> — پذیرش دانشگاه + کار ۲۰ ساعت/هفته پس از ۱ ترم",
  "💼 <b>کاری / ثبت شرکت</b> — Çalışma İzni، اقامت دائم پس از ۵ سال",
];

const TURKEY_COSTS = [
  "ثبت تاپو: ۴٪ ارزش ملک (معمولاً ۵۰/۵۰)",
  "تمبر تاپو: ۰.۹۴۸٪",
  "بسته Lite شاهرخ: ارزیابی + توریستی ۹۰ روزه + مشاوره اجاره — ۳۵۰$",
];

const agentLine = (a: MigrationAgent) =>
  `• <b>${a.name}</b> — ${a.country}${a.credentials ? ` (${a.credentials})` : ""}\n  ${a.note}${a.phone ? `\n  📞 <code>${a.phone}</code>` : ""}`;

export async function GET() {
  return Response.json({
    ok: true,
    bot: "@shahrokh_imigration_bot",
    commands: ["/start", "/help", "/agents", "/agents2", "/turkey", "/consultants", "/contact"],
    agents: migrationAgents.length,
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

  const token = process.env.IMMIGRATION_BOT_TOKEN;
  if (!token) {
    return Response.json({ ok: false, error: "IMMIGRATION_BOT_TOKEN is not configured." }, { status: 503 });
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
        "سلام! به ربات <b>گروه مهاجرتی شاهرخ</b> خوش آمدید 🌍",
        "",
        "مسیرهای مهاجرت به ترکیه و ایجنت‌های تخصصی سامانه:",
        "/turkey — مسیرهای ۴گانه ترکیه + هزینه‌ها",
        "/agents — ایجنت‌ها، بخش ۱ (شرکت‌ها و مشاوران)",
        "/agents2 — ایجنت‌های هوشمند، بخش ۲",
        "/consultants — مشاوران رسمی",
        "/contact — تماس و لینک‌ها",
        "",
        "⚠️ مشاوره عمومی است و جایگزین وکیل رسمی نیست.",
      ].join("\n");
      break;
    case "/help":
      text = [
        "<b>راهنمای ربات</b>",
        "",
        "/turkey — مسیرها و هزینه‌های ترکیه",
        "/agents — ایجنت‌های مهاجرت، بخش ۱",
        "/agents2 — ایجنت‌های مهاجرت، بخش ۲",
        "/consultants — مشاوران رسمی",
        "/contact — راه‌های ارتباط",
      ].join("\n");
      break;
    case "/turkey":
      text = [
        "🇹🇷 <b>مسیرهای ۴گانه ترکیه</b> — ۴ سرعت برای ۴ بودجه",
        "",
        ...TURKEY_ROUTES,
        "",
        "💶 <b>هزینه‌های واقعی ۲۰۲۶:</b>",
        ...TURKEY_COSTS,
        "",
        "📌 نکته: حداقل اقامت ملکی کلان‌شهرها ۲۰۰K$ و شهروندی ۴۰۰K$ است.",
      ].join("\n");
      replyMarkup = keyboard([[{ label: "درخواست از شاهان", url: "https://apply.shaahan.com/" }]]);
      break;
    case "/agents": {
      const companies = migrationAgents.filter((a) => a.kind === "company");
      const humans = migrationAgents.filter((a) => a.kind === "human");
      const ais = migrationAgents.filter((a) => a.kind === "ai");
      text = [
        "🌍 <b>ایجنت‌های مهاجرت — بخش ۱</b>",
        "",
        "🏢 <b>شرکت‌ها:</b>",
        ...companies.map(agentLine),
        "",
        "👤 <b>مشاوران رسمی:</b>",
        ...humans.map(agentLine),
        "",
        "🤖 <b>ایجنت‌های هوشمند (۱–۵):</b>",
        ...ais.slice(0, 5).map(agentLine),
        "",
        `ادامه: /agents2 (مجموع ${migrationAgents.length} ایجنت)`,
      ].join("\n");
      break;
    }
    case "/agents2": {
      const ais = migrationAgents.filter((a) => a.kind === "ai");
      text = [
        "🌍 <b>ایجنت‌های مهاجرت — بخش ۲</b> (هوش مصنوعی)",
        "",
        ...ais.slice(5).map((a, i) => `${i + 6}. <b>${a.name}</b> — ${a.country}\n  ${a.note}`),
        "",
        "بخش ۱: /agents",
      ].join("\n");
      replyMarkup = keyboard([[{ label: "ربات تلگرام BLDC", url: "https://t.me/Pars_sell_bot" }]]);
      break;
    }
    case "/consultants":
      text = [
        "👤 <b>مشاوران رسمی مهاجرت</b>",
        "",
        ...migrationAgents.filter((a) => a.kind === "human").map(agentLine),
        "",
        "اعتبارنامه‌ها: RCIC/OISC (کانادا/بریتانیا)، AILA (آمریکا)، IMC (سرمایه‌گذاری)",
      ].join("\n");
      break;
    case "/contact":
      text = [
        "📞 <b>ارتباط</b>",
        "",
        "🏢 شاهان: apply.shaahan.com",
        "📱 شاهرخ ترکیه: +90 542 177 2753 / +90 531 779 4462",
        "🇮🇷 ایران: +98 921 774 ...",
        `🤖 این ربات: ${BOT_URL}`,
        "🗺 داشبورد BLDC: parscell.exhibition2world.ir",
      ].join("\n");
      break;
    default:
      text = "یک دستور از منو انتخاب کنید (/help) یا از دکمه‌های زیر استفاده کنید:";
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || !data?.ok) {
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true, replied: cmd });
}
