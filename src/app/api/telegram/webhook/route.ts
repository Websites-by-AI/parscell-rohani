import type { NextRequest } from "next/server";
import { demoAccounts, clinicDemoUsers, findByPhone, roleLabels } from "@/data/accounts";
import { sellers, catalogRows, type Seller } from "@/app/data";
import { globalSellers } from "@/app/data-global";
import { priceInfo } from "@/app/pricing";
import { migrationAgents } from "@/data/immigration";

export const runtime = "edge";

/**
 * Telegram bot webhook — answers commands sent to @Pars_sell_bot.
 *
 * Registered via setWebhook (see README). Incoming updates are validated with
 * the TELEGRAM_WEBHOOK_SECRET header (X-Telegram-Bot-Api-Secret-Token) when
 * the secret env var is configured on Cloudflare Pages.
 *
 * User registration: /register + phone number. Demo accounts (BLDC) are
 * matched from the demo database; clinic demo users are listed via /clinic.
 */

const SITE_URL = "https://parscell.exhibition2world.ir";
const BOT_URL = "https://t.me/Pars_sell_bot";

/** In-memory registry (per-isolate, demo only — production uses D1 telegram_users). */
interface RegisteredUser { phone: string; name: string; role: string; company?: string; registeredAt: string; }
const registry = new Map<number, RegisteredUser>();

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
      { label: "👤 داشبورد کاربری", url: `${SITE_URL}/login` },
      { label: "🤖 RAG آنالیز", url: SITE_URL },
    ],
  ]);
}

function looksLikePhone(text: string): string | null {
  const t = text.replace(/[\s\-+()]/g, "").replace(/^98(?=9\d{9}$)/, "0");
  if (/^09\d{9}$/.test(t)) return t;
  if (/^0\d{10}$/.test(t)) return t;
  return null;
}

export async function GET() {
  return Response.json({
    ok: true,
    bot: "@Pars_sell_bot",
    commands: ["/start", "/help", "/map", "/catalog", "/leads", "/rag", "/contact", "/register", "/users", "/clinic"],
    registeredCount: registry.size,
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
  const lower = raw.toLowerCase();
  const cmd = lower.startsWith("/") ? lower.split("@")[0] : "text";
  const phone = looksLikePhone(raw);

  let text: string;
  let replyMarkup = menuKeyboard();

  if (cmd === "/register") {
    text = [
      "📱 <b>ثبت‌نام با شماره موبایل</b>",
      "",
      "شماره موبایل خود را ارسال کنید (مثال: 09121111111)",
      "یا از طریق سایت ثبت‌نام کنید: /register 👇",
      "",
      "حساب‌های دموی سامانه:",
      ...demoAccounts.map((a) => `• ${a.name} — <code>${a.phone}</code> (${roleLabels[a.role]})`),
      "",
      "رمز همه حساب‌های دمو: demo123",
    ].join("\n");
    replyMarkup = keyboard([
      [{ label: "ثبت‌نام در سایت", url: `${SITE_URL}/register` }],
      [{ label: "ورود به داشبورد", url: `${SITE_URL}/login` }],
    ]);
  } else if (phone) {
    const account = findByPhone(phone);
    if (account) {
      registry.set(chatId, {
        phone: account.phone,
        name: account.name,
        role: roleLabels[account.role],
        company: account.company,
        registeredAt: new Date().toISOString(),
      });
      text = [
        "✅ <b>ثبت‌نام انجام شد</b>",
        "",
        `👤 ${account.name}`,
        `🎭 نقش: ${roleLabels[account.role]}`,
        `📱 موبایل: <code>${account.phone}</code>`,
        account.company ? `🏢 شرکت: ${account.company}` : "",
        "",
        "از این پس اعلان‌های مرتبط با نقش شما از همین ربات ارسال می‌شود.",
      ].filter(Boolean).join("\n");
      replyMarkup = keyboard([
        [{ label: "ورود به داشبورد من", url: `${SITE_URL}/login` }],
        [{ label: "مشاهده نقشه", url: SITE_URL }],
      ]);
    } else {
      const clinic = clinicDemoUsers.find((c) => c.phone.replace(/[\s\-]/g, "") === phone);
      if (clinic) {
        registry.set(chatId, { phone, name: clinic.name, role: "مشتری کلینیک", registeredAt: new Date().toISOString() });
        text = `✅ ثبت‌نام شد — ${clinic.name} (${clinic.note})\nپروفایل کلینیک دمو به ربات متصل شد.`;
      } else {
        text = [
          "❌ شماره در پایگاه داده دمو یافت نشد.",
          "",
          "شماره‌های دموی BLDC:",
          ...demoAccounts.map((a) => `<code>${a.phone}</code> — ${a.name}`),
          "",
          "شماره‌های دموی کلینیک:",
          ...clinicDemoUsers.map((c) => `<code>${c.phone}</code> — ${c.name}`),
        ].join("\n");
      }
    }
  } else {
    switch (cmd) {
      case "/start":
        text = [
          "سلام! به ربات <b>BLDC Map Signal</b> خوش آمدید 👋",
          "",
          "من اعلان‌های مرکز عملیات موتورهای BLDC را ارسال می‌کنم و کاربران با شماره موبایل ثبت‌نام می‌شوند.",
          "",
          "📊 داده‌ها همین‌جا داخل چت هم در دسترس‌اند:",
          "/map — شرکت‌های برتر + قیمت نمونه",
          "/catalog — جدول مدل‌های کاتالوگ",
          "/leads — آمار لیدها و صرفه‌جویی",
          "",
          "📱 ثبت‌نام: /register",
          "📣 عضویت بازاریاب با کمیسیون معرفی — /register و نقش بازاریاب",
          "👥 کاربران دمو: /users",
          "🏥 کاربران دموی کلینیک: /clinic",
          "🌍 ایجنت‌های مهاجرت (از گیت‌هاب): /migration",
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
          "/register — ثبت‌نام با شماره موبایل",
          "/users — کاربران دموی سامانه",
          "/clinic — کاربران دموی کلینیک",
          "/migration — ایجنت‌های مهاجرت (از گیت‌هاب)",
          "/contact — راه‌های ارتباط",
        ].join("\n");
        break;
      case "/map": {
        const iranTop = [...sellers].sort((a, b) => b.score - a.score).slice(0, 3);
        const chinaTop = globalSellers
          .filter((s) => (s.country ?? "").includes("چین"))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        const line = (s: Seller) => {
          const p = priceInfo(s);
          return `• <b>${s.name}</b> — امتیاز ${s.score} — ${s.power} — <code>${p.perWatt}</code> (تا ${p.savingPct}٪ صرفه)`;
        };
        text = [
          "🗺 <b>نقشه فروشندگان BLDC</b>",
          `📊 مجموع: ${sellers.length} شرکت ایرانی + ${globalSellers.length} شرکت بین‌المللی`,
          "",
          "🇮🇷 برترین‌های ایران:",
          ...iranTop.map(line),
          "",
          "🇨🇳 برترین‌های چین:",
          ...chinaTop.map(line),
          "",
          "برای مشاهده کامل نقشه تعاملی و تحلیل هزینه:",
        ].join("\n");
        break;
      }
      case "/catalog":
        text = [
          "📄 <b>کاتالوگ محصولات BLDC</b> — نسخه داخل چت",
          "",
          ...catalogRows.map((r) => `• <b>${r.model}</b> — ${r.power} · ${r.voltage} · ${r.rpm} RPM · گشتاور ${r.torque}\n   کاربرد: ${r.app} · ${r.use} · منبع: ${r.source}`),
          "",
          "مشخصات قبل از سفارش باید با فروشنده تأیید شود. نسخه کامل چاپی:",
        ].join("\n");
        replyMarkup = keyboard([[{ label: "دانلود کاتالوگ HTML", url: `${SITE_URL}/api/catalog/html` }, { label: "CSV", url: `${SITE_URL}/api/catalog` }]]);
        break;
      case "/leads": {
        const all = [...sellers, ...globalSellers];
        const p1 = all.filter((s) => s.score >= 85).length;
        const p2 = all.filter((s) => s.score >= 70 && s.score < 85).length;
        const catalogs = all.filter((s) => s.catalog).length;
        const iranAvg = Math.round(sellers.reduce((acc, s) => acc + priceInfo(s).savingPct, 0) / sellers.length);
        const chinaAvg = Math.round(
          globalSellers.filter((s) => (s.country ?? "").includes("چین")).reduce((acc, s) => acc + priceInfo(s).savingPct, 0) /
          Math.max(1, globalSellers.filter((s) => (s.country ?? "").includes("چین")).length)
        );
        text = [
          "📊 <b>بانک لیدها — آمار زنده سامانه</b>",
          "",
          `👥 کل شرکت‌ها: ${all.length} (ایران ${sellers.length} + جهانی ${globalSellers.length})`,
          `🔴 اولویت P1 (امتیاز +85): ${p1}`,
          `🟡 اولویت P2 (امتیاز 70–84): ${p2}`,
          `📄 دارای کاتالوگ: ${catalogs}`,
          "",
          `💰 میانگین صرفه‌جویی عمده — ایران: ${iranAvg}٪ · چین: ${chinaAvg}٪`,
          "",
          "اعلان هر لید جدید از همین ربات ارسال می‌شود. برای جزئیات کامل:",
        ].join("\n");
        break;
      }
      case "/rag":
        text = "🤖 <b>RAG آنالیز کاتالوگ</b>\nآنالیز سمانتیک کاتالوگ‌های PDF (نیان موتور و HTI) در بخش RAG داشبورد:";
        break;
      case "/users": {
        const registered = [...registry.values()];
        text = [
          "👥 <b>کاربران دموی سامانه</b> (BLDC Map Signal)",
          "",
          ...demoAccounts.map((a) => `• ${a.name} — ${roleLabels[a.role]} — <code>${a.phone}</code>`),
          "",
          `📥 ثبت‌نام‌شده در ربات: ${registered.length} نفر`,
          ...registered.map((r) => `• ${r.name} (${r.role})`),
        ].join("\n");
        replyMarkup = keyboard([[{ label: "ورود به داشبورد", url: `${SITE_URL}/login` }]]);
        break;
      }
      case "/clinic":
        text = [
          "🏥 <b>کاربران دموی کلینیک</b> (Clinic Signal)",
          "",
          ...clinicDemoUsers.map((c) => `• ${c.name} — <code>${c.phone}</code> — ${c.note}`),
          "",
          "برای ثبت‌نام با شماره هر کلینیک، شماره را ارسال کنید.",
        ].join("\n");
        break;
      case "/migration":
        text = [
          "🌍 <b>ایجنت‌های مهاجرت</b> — از مخازن گیت‌هاب (شاهرخ، دستیار ویزا، Soh Visa)",
          "",
          ...migrationAgents.map((a) =>
            `• ${a.kind === "ai" ? "🤖" : a.kind === "company" ? "🏢" : "👤"} <b>${a.name}</b> — ${a.country}${a.credentials ? ` (${a.credentials})` : ""}\n  ${a.note}${a.phone ? `\n  📞 <code>${a.phone}</code>` : ""}`
          ),
          "",
          "⚠️ اطلاعات عمومی از ریپوهای دمو است — قبل از اقدام با ایجنت/وکیل تأیید کنید.",
        ].join("\n");
        replyMarkup = keyboard([
          [{ label: "شاهان (Shaahan)", url: "https://apply.shaahan.com/" }],
          [{ label: "ربات شاهرخ", url: "https://t.me/shahrokh_imigration_bot" }],
        ]);
        break;
      case "/contact":
        text = "📞 <b>ارتباط</b>\nInstagram: @yasinrou\nTelegram: @Pars_sell_bot\nسایت: parscell.exhibition2world.ir";
        break;
      default:
        text = "برای استفاده از ربات، یک دستور از منو انتخاب کنید، یا برای ثبت‌نام شماره موبایل خود را بفرستید (/register):";
    }
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
  return Response.json({ ok: true, replied: cmd === "text" ? (phone ? "phone_registered" : "text") : cmd });
}
