import type { NextRequest } from "next/server";
import { migrationAgents } from "@/data/immigration";
import { agentLine, b, c, li } from "@/lib/botFormat";

export const runtime = "edge";

/**
 * Webhook for @shahrokh_imigration_bot (گروه مهاجرتی شاهرخ).
 * Clean, short replies. Validated with the shared TELEGRAM_WEBHOOK_SECRET.
 */

const BOT_URL = "https://t.me/shahrokh_imigration_bot";

type Update = { message?: { chat?: { id: number }; text?: string } };

function keyboard(rows: { label: string; url: string }[][]) {
  return { inline_keyboard: rows.map((row) => row.map((k) => ({ text: k.label, url: k.url }))) };
}

function menuKeyboard() {
  return keyboard([
    [{ label: "🏢 شاهان (Shaahan)", url: "https://apply.shaahan.com/" }],
    [{ label: "🗺 داشبورد BLDC", url: "https://parscell.exhibition2world.ir" }],
  ]);
}

const TURKEY_ROUTES = [
  li("اکسپرس ملکی ۴۰۰K$", "شهروندی + پاسپورت · ۳–۶ ماه"),
  li("اقامت ملکی ۲۰۰K$", "کیملیک ۱ ساله · تمدیدشدنی"),
  li("تحصیلی", "پذیرش دانشگاه · کار ۲۰ ساعت/هفته"),
  li("کاری / ثبت شرکت", "Çalışma İzni · دائم پس از ۵ سال"),
];

const TURKEY_COSTS = [
  li("ثبت تاپو", "۴٪ ارزش ملک"),
  li("تمبر تاپو", "۰.۹۴۸٪"),
  li("بسته Lite شاهرخ", "ارزیابی + توریستی ۹۰ روزه + مشاوره اجاره · ۳۵۰$"),
];

export async function GET() {
  return Response.json({
    ok: true,
    bot: "@shahrokh_imigration_bot",
    commands: ["start", "help", "turkey", "agents", "agents2", "consultants", "contact"],
    agents: migrationAgents.length,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) return new Response("unauthorized", { status: 401 });
  }

  const token = process.env.IMMIGRATION_BOT_TOKEN;
  if (!token) return Response.json({ ok: false, error: "IMMIGRATION_BOT_TOKEN is not configured." }, { status: 503 });

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
        "سلام! به ربات گروه مهاجرتی شاهرخ خوش آمدید 🌍",
        "",
        b("مسیرهای ترکیه"),
        "/turkey — ۴ مسیر + هزینه‌ها",
        "",
        b("ایجنت‌ها"),
        "/agents · /agents2 — ۲۰ ایجنت مهاجرت",
        "/consultants — مشاوران رسمی",
        "",
        "⚠️ مشاوره عمومی است، جایگزین وکیل نیست.",
      ].join("\n");
      break;
    case "/help":
      text = [
        b("راهنما"),
        "/turkey — مسیرها و هزینه‌های ترکیه",
        "/agents · /agents2 — ایجنت‌های مهاجرت",
        "/consultants — مشاوران رسمی",
        "/contact — ارتباط",
      ].join("\n");
      break;
    case "/turkey":
      text = [
        `🇹🇷 ${b("مسیرهای ۴گانه ترکیه")}`,
        ...TURKEY_ROUTES,
        "",
        `💶 ${b("هزینه‌های ۲۰۲۶")}`,
        ...TURKEY_COSTS,
      ].join("\n");
      replyMarkup = keyboard([[{ label: "درخواست از شاهان", url: "https://apply.shaahan.com/" }]]);
      break;
    case "/agents": {
      const companies = migrationAgents.filter((a) => a.kind === "company");
      const humans = migrationAgents.filter((a) => a.kind === "human");
      const ais = migrationAgents.filter((a) => a.kind === "ai");
      text = [
        `🌍 ${b("ایجنت‌های مهاجرت — ۱")}`,
        ...companies.map((a) => agentLine(a)),
        "",
        ...humans.map((a) => agentLine(a)),
        "",
        ...ais.slice(0, 5).map((a, i) => agentLine(a, i + 1)),
        "",
        `ادامه: /agents2`,
      ].join("\n");
      break;
    }
    case "/agents2": {
      const ais = migrationAgents.filter((a) => a.kind === "ai");
      text = [
        `🌍 ${b("ایجنت‌های مهاجرت — ۲")}`,
        ...ais.slice(5).map((a, i) => agentLine(a, i + 6)),
        "",
        `مجموع: ${migrationAgents.length} ایجنت`,
      ].join("\n");
      replyMarkup = keyboard([[{ label: "ربات BLDC", url: "https://t.me/Pars_sell_bot" }]]);
      break;
    }
    case "/consultants":
      text = [
        `👤 ${b("مشاوران رسمی")}`,
        ...migrationAgents.filter((a) => a.kind === "human").map((a) => agentLine(a)),
      ].join("\n");
      break;
    case "/contact":
      text = [
        "📞 ارتباط",
        `🏢 شاهان: apply.shaahan.com`,
        `📱 ترکیه: ${c("+90 542 177 2753")}`,
        `🇮🇷 ایران: ${c("+98 921 774 ...")}`,
        `🤖 ربات: ${BOT_URL.replace("https://", "")}`,
      ].join("\n");
      break;
    default:
      text = "یک دستور از منو انتخاب کنید (/help).";
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || !data?.ok) return Response.json({ ok: false }, { status: 502 });
  return Response.json({ ok: true, replied: cmd });
}
