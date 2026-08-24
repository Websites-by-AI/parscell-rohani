import type { NextRequest } from "next/server";
import { demoAccounts, clinicDemoUsers, findByPhone, roleLabels } from "@/data/accounts";
import { sellers, catalogRows, type Seller } from "@/app/data";
import { globalSellers } from "@/app/data-global";
import { priceInfo } from "@/app/pricing";
import { migrationAgents, type MigrationAgent } from "@/data/immigration";
import { agentLine, b, c, esc, li } from "@/lib/botFormat";

export const runtime = "edge";

/**
 * Telegram bot webhook — @Pars_sell_bot.
 * Clean, short replies; every string HTML-escaped. Validated with the shared
 * TELEGRAM_WEBHOOK_SECRET (secret_token).
 */

const SITE_URL = "https://parscell.exhibition2world.ir";

interface RegisteredUser { phone: string; name: string; role: string; registeredAt: string; }
const registry = new Map<number, RegisteredUser>();

type Update = { message?: { chat?: { id: number }; text?: string } };

function keyboard(rows: { label: string; url: string }[][]) {
  return { inline_keyboard: rows.map((row) => row.map((k) => ({ text: k.label, url: k.url }))) };
}

function menuKeyboard() {
  return keyboard([
    [{ label: "🗺 نقشه", url: SITE_URL }, { label: "📄 کاتالوگ", url: `${SITE_URL}/api/catalog/html` }],
    [{ label: "👤 داشبورد من", url: `${SITE_URL}/login` }],
  ]);
}

function looksLikePhone(text: string): string | null {
  const t = text.replace(/[\s\-+()]/g, "").replace(/^98(?=9\d{9}$)/, "0");
  return /^09\d{9}$/.test(t) || /^0\d{10}$/.test(t) ? t : null;
}

const companyLine = (s: Seller) => {
  const p = priceInfo(s);
  return li(s.name, `${s.score}/100 · ${s.power} · ${p.perWatt}`);
};

export async function GET() {
  return Response.json({
    ok: true,
    bot: "@Pars_sell_bot",
    commands: ["start", "help", "map", "catalog", "leads", "rag", "register", "users", "clinic", "migration", "migration2", "contact"],
    registeredCount: registry.size,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) return new Response("unauthorized", { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return Response.json({ ok: false, error: "bot token not configured" }, { status: 503 });

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
  const phone = looksLikePhone(raw);

  let text: string;
  let replyMarkup = menuKeyboard();

  if (cmd === "/register") {
    text = [
      b("ثبت‌نام با شماره موبایل"),
      "",
      "شماره موبایل خود را بفرستید، یا از سایت ثبت‌نام کنید:",
      ...demoAccounts.map((a) => li(a.name, `${roleLabels[a.role]} · ${c(a.phone)}`)),
      "",
      `رمز دمو: ${c("demo123")}`,
    ].join("\n");
    replyMarkup = keyboard([
      [{ label: "ثبت‌نام در سایت", url: `${SITE_URL}/register` }],
      [{ label: "ورود به داشبورد", url: `${SITE_URL}/login` }],
    ]);
  } else if (phone) {
    const account = findByPhone(phone);
    if (account) {
      registry.set(chatId, { phone: account.phone, name: account.name, role: roleLabels[account.role], registeredAt: new Date().toISOString() });
      text = [
        "✅ ثبت‌نام انجام شد",
        li(account.name, `${roleLabels[account.role]} · ${c(account.phone)}`),
        account.company ? esc(`🏢 ${account.company}`) : "",
        "اعلان‌های این نقش از همین ربات ارسال می‌شود.",
      ].filter(Boolean).join("\n");
      replyMarkup = keyboard([[{ label: "ورود به داشبورد", url: `${SITE_URL}/login` }]]);
    } else {
      const clinic = clinicDemoUsers.find((cu) => cu.phone.replace(/[\s\-]/g, "") === phone);
      if (clinic) {
        registry.set(chatId, { phone, name: clinic.name, role: "مشتری کلینیک", registeredAt: new Date().toISOString() });
        text = ["✅ ثبت شد", li(clinic.name, esc(clinic.note))].join("\n");
      } else {
        text = [
          "❌ شماره در دیتابیس دمو نیست.",
          "شماره‌های دمو: /users یا /clinic",
        ].join("\n");
      }
    }
  } else {
    switch (cmd) {
      case "/start":
        text = [
          "سلام! به ربات BLDC Map Signal خوش آمدید 👋",
          "",
          b("داده‌ها داخل چت"),
          "/map — شرکت‌های برتر + قیمت",
          "/catalog — مدل‌های کاتالوگ",
          "/leads — آمار لیدها",
          "",
          b("حساب کاربری"),
          "/register — ثبت‌نام با موبایل",
          "/users · /clinic — کاربران دمو",
          "",
          b("مهاجرت"),
          "/migration · /migration2 — ایجنت‌ها",
        ].join("\n");
        break;
      case "/help":
        text = [
          b("راهنما"),
          "/map /catalog /leads — داده بازار",
          "/rag — آنالیز کاتالوگ‌ها",
          "/register — ثبت‌نام",
          "/users /clinic — کاربران دمو",
          "/migration /migration2 — ایجنت‌های مهاجرت",
          "/contact — ارتباط",
        ].join("\n");
        break;
      case "/map": {
        const iranTop = [...sellers].sort((x, y) => y.score - x.score).slice(0, 3);
        const chinaTop = globalSellers.filter((s) => (s.country ?? "").includes("چین")).sort((x, y) => y.score - x.score).slice(0, 3);
        text = [
          `🗺 ${b("برترین‌های ایران")}`,
          ...iranTop.map(companyLine),
          "",
          `🇨🇳 ${b("برترین‌های چین")}`,
          ...chinaTop.map(companyLine),
          "",
          `📊 مجموع: ${sellers.length} ایران + ${globalSellers.length} جهانی`,
        ].join("\n");
        break;
      }
      case "/catalog":
        text = [
          `📄 ${b("کاتالوگ — داخل چت")}`,
          ...catalogRows.map((r) => li(r.model, `${r.power} · ${r.voltage} · ${r.use}`)),
          "",
          "نسخه کامل چاپی:",
        ].join("\n");
        replyMarkup = keyboard([[{ label: "دانلود HTML", url: `${SITE_URL}/api/catalog/html` }, { label: "CSV", url: `${SITE_URL}/api/catalog` }]]);
        break;
      case "/leads": {
        const all = [...sellers, ...globalSellers];
        const p1 = all.filter((s) => s.score >= 85).length;
        const p2 = all.filter((s) => s.score >= 70 && s.score < 85).length;
        const avg = (arr: Seller[]) => Math.round(arr.reduce((acc, s) => acc + priceInfo(s).savingPct, 0) / Math.max(1, arr.length));
        text = [
          `📊 ${b("آمار لیدها")}`,
          `👥 ${all.length} شرکت · ${sellers.length} ایران + ${globalSellers.length} جهانی`,
          `🔴 P1 (+85): ${p1} · 🟡 P2 (70–84): ${p2}`,
          `📄 کاتالوگ: ${all.filter((s) => s.catalog).length}`,
          `💰 صرفه عمده: ایران ${avg(sellers)}٪ · چین ${avg(globalSellers.filter((s) => (s.country ?? "").includes("چین")))}٪`,
        ].join("\n");
        break;
      }
      case "/rag":
        text = [
          "🤖 آنالیز RAG کاتالوگ‌ها (نیان موتور و HTI)",
          "در بخش RAG داشبورد:",
        ].join("\n");
        break;
      case "/users": {
        const registered = [...registry.values()];
        text = [
          `👥 ${b("کاربران دمو")}`,
          ...demoAccounts.map((a) => li(a.name, `${roleLabels[a.role]} · ${c(a.phone)}`)),
          registered.length ? esc(`📥 ثبت‌شده در ربات: ${registered.length}`) : "",
        ].filter(Boolean).join("\n");
        replyMarkup = keyboard([[{ label: "ورود به داشبورد", url: `${SITE_URL}/login` }]]);
        break;
      }
      case "/clinic":
        text = [
          `🏥 ${b("کاربران دموی کلینیک")}`,
          ...clinicDemoUsers.map((cu) => li(cu.name, `${c(cu.phone)} · ${cu.note}`)),
        ].join("\n");
        break;
      case "/migration": {
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
          `ادامه: /migration2`,
        ].join("\n");
        replyMarkup = keyboard([[{ label: "شاهان (Shaahan)", url: "https://apply.shaahan.com/" }]]);
        break;
      }
      case "/migration2": {
        const ais = migrationAgents.filter((a) => a.kind === "ai");
        text = [
          `🌍 ${b("ایجنت‌های مهاجرت — ۲")}`,
          ...ais.slice(5).map((a, i) => agentLine(a, i + 6)),
          "",
          `مجموع: ${migrationAgents.length} ایجنت`,
        ].join("\n");
        replyMarkup = keyboard([[{ label: "ربات شاهرخ", url: "https://t.me/shahrokh_imigration_bot" }]]);
        break;
      }
      case "/contact":
        text = [
          "📞 ارتباط",
          "تلگرام: @Pars_sell_bot",
          "بله: @power_sell_bot",
          "مهاجرت: @shahrokh_imigration_bot",
          `سایت: ${SITE_URL.replace("https://", "")}`,
        ].join("\n");
        break;
      default:
        text = "یک دستور از منو انتخاب کنید (/help).";
    }
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || !data?.ok) return Response.json({ ok: false }, { status: 502 });
  return Response.json({ ok: true, replied: cmd === "text" ? (phone ? "phone_registered" : "text") : cmd });
}
