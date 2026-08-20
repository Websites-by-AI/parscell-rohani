import type { NextRequest } from "next/server";
import { demoAccounts, clinicDemoUsers, findByPhone, roleLabels } from "@/data/accounts";
import { sellers, catalogRows, type Seller } from "@/app/data";
import { globalSellers } from "@/app/data-global";
import { priceInfo } from "@/app/pricing";

export const runtime = "edge";

/**
 * Bale bot webhook — answers commands sent to @power_sell_bot (ble.ir).
 * Telegram-compatible Bot API; registered by /api/bale/setup from the
 * Cloudflare edge (see README).
 *
 * On /start (or any message) the chat id is remembered, so the operator chat
 * can receive dashboard notifications without extra configuration.
 */

const SITE_URL = "https://parscell.exhibition2world.ir";
const BALE_URL = "https://ble.ir/power_sell_bot";

declare global {
  var __baleLastChatId: number | undefined;
}

interface RegisteredUser { phone: string; name: string; role: string; registeredAt: string; }
const baleRegistry = new Map<number, RegisteredUser>();

type Update = { message?: { chat?: { id: number }; text?: string } };

function keyboard(rows: { label: string; url: string }[][]) {
  return { inline_keyboard: rows.map((row) => row.map((b) => ({ text: b.label, url: b.url }))) };
}

function menuKeyboard() {
  return keyboard([
    [{ label: "🗺 نقشه فروشندگان", url: SITE_URL }, { label: "📄 کاتالوگ", url: `${SITE_URL}/api/catalog/html` }],
    [{ label: "👤 داشبورد کاربری", url: `${SITE_URL}/login` }, { label: "📣 عضویت بازاریاب", url: `${SITE_URL}/register` }],
  ]);
}

function looksLikePhone(text: string): string | null {
  const t = text.replace(/[\s\-+()]/g, "").replace(/^98(?=9\d{9}$)/, "0");
  return /^09\d{9}$/.test(t) || /^0\d{10}$/.test(t) ? t : null;
}

export async function GET(request: NextRequest) {
  // State endpoint — gated by the shared admin secret.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-admin-secret") !== secret) {
    return new Response("unauthorized", { status: 401 });
  }
  const token = process.env.BALE_BOT_TOKEN;
  let webhookInfo: unknown = null;
  if (token) {
    try {
      const res = await fetch(`https://tapi.bale.ai/bot${token}/getWebhookInfo`);
      webhookInfo = await res.json().catch(() => null);
    } catch {
      webhookInfo = { error: "bale api unreachable" };
    }
  }
  return Response.json({
    ok: true,
    lastChatId: globalThis.__baleLastChatId ?? null,
    registeredCount: baleRegistry.size,
    webhookInfo,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token") ?? request.headers.get("x-admin-secret");
    if (header !== secret) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  const token = process.env.BALE_BOT_TOKEN;
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
  globalThis.__baleLastChatId = chatId;

  // Relay the captured chat id to the operator's Telegram chat so it can be
  // stored as the persistent BALE_CHAT_ID env var (isolates are stateless).
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: tgChat,
        text: `🔔 پیام در ربات بله دریافت شد\nchat_id برای BALE_CHAT_ID: <code>${chatId}</code>`,
        parse_mode: "HTML",
      }),
    }).catch(() => { /* relay best-effort */ });
  }

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
      "یا از سایت: /register 👇",
      "",
      "حساب‌های دمو:",
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
      baleRegistry.set(chatId, { phone: account.phone, name: account.name, role: roleLabels[account.role], registeredAt: new Date().toISOString() });
      text = [
        "✅ <b>ثبت‌نام انجام شد</b>",
        "",
        `👤 ${account.name}`,
        `🎭 نقش: ${roleLabels[account.role]}`,
        `📱 موبایل: <code>${account.phone}</code>`,
        "",
        "این گفتگو به‌عنوان دریافت‌کننده اعلان‌های سامانه ثبت شد.",
      ].join("\n");
    } else {
      const clinic = clinicDemoUsers.find((c) => c.phone.replace(/[\s\-]/g, "") === phone);
      if (clinic) {
        baleRegistry.set(chatId, { phone, name: clinic.name, role: "مشتری کلینیک", registeredAt: new Date().toISOString() });
        text = `✅ ثبت شد — ${clinic.name} (${clinic.note})\nاین گفتگو به اعلان‌ها متصل شد.`;
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
          "سلام! به ربات <b>BLDC Map Signal</b> در پیام‌رسان بله خوش آمدید 👋",
          "",
          "✅ این گفتگو به‌عنوان دریافت‌کننده اعلان‌های سامانه ثبت شد.",
          "",
          "داده‌ها همین‌جا داخل چت در دسترس‌اند:",
          "/map — شرکت‌های برتر + قیمت نمونه",
          "/catalog — جدول مدل‌های کاتالوگ",
          "/leads — آمار لیدها و صرفه‌جویی",
          "",
          "📱 ثبت‌نام: /register · 📣 عضویت بازاریاب با کمیسیون معرفی",
        ].join("\n");
        break;
      case "/help":
        text = [
          "<b>راهنمای ربات بله</b>",
          "",
          "/map — نقشه فروشندگان ایران و جهانی",
          "/catalog — کاتالوگ تجمیع‌شده محصولات",
          "/leads — آمار بانک لیدها",
          "/register — ثبت‌نام با شماره موبایل",
          "/users — کاربران دموی سامانه",
          "/clinic — کاربران دموی کلینیک",
          "/contact — راه‌های ارتباط",
        ].join("\n");
        break;
      case "/map": {
        const iranTop = [...sellers].sort((a, b) => b.score - a.score).slice(0, 3);
        const chinaTop = globalSellers.filter((s) => (s.country ?? "").includes("چین")).sort((a, b) => b.score - a.score).slice(0, 3);
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
          "برای نقشه تعاملی کامل و تحلیل هزینه:",
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
        const avg = (arr: Seller[]) => Math.round(arr.reduce((acc, s) => acc + priceInfo(s).savingPct, 0) / Math.max(1, arr.length));
        text = [
          "📊 <b>بانک لیدها — آمار زنده سامانه</b>",
          "",
          `👥 کل شرکت‌ها: ${all.length} (ایران ${sellers.length} + جهانی ${globalSellers.length})`,
          `🔴 اولویت P1 (امتیاز +85): ${p1}`,
          `🟡 اولویت P2 (امتیاز 70–84): ${p2}`,
          `📄 دارای کاتالوگ: ${catalogs}`,
          "",
          `💰 میانگین صرفه‌جویی عمده — ایران: ${avg(sellers)}٪ · چین: ${avg(globalSellers.filter((s) => (s.country ?? "").includes("چین")))}٪`,
          "",
          "اعلان هر لید جدید از همین ربات ارسال می‌شود.",
        ].join("\n");
        break;
      }
      case "/users": {
        const registered = [...baleRegistry.values()];
        text = [
          "👥 <b>کاربران دموی سامانه</b> (BLDC Map Signal)",
          "",
          ...demoAccounts.map((a) => `• ${a.name} — ${roleLabels[a.role]} — <code>${a.phone}</code>`),
          "",
          `📥 ثبت‌نام‌شده در بله: ${registered.length} نفر`,
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
      case "/contact":
        text = `📞 <b>ارتباط</b>\nTelegram: @Pars_sell_bot\nBale: @power_sell_bot\nInstagram: @yasinrou\nسایت: ${SITE_URL.replace("https://", "")}`;
        break;
      default:
        text = "برای استفاده از ربات، یک دستور از منو انتخاب کنید، یا برای ثبت‌نام شماره موبایل خود را بفرستید (/register).";
    }
  }

  const response = await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || !data?.ok) {
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true, replied: cmd === "text" ? (phone ? "phone_registered" : "text") : cmd });
}
