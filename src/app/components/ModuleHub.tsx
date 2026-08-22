"use client";

import {
  BadgeCheck, BarChart3, Bot, CheckCircle2, FileText, Globe2, KeyRound, Lock,
  Map, Megaphone, MessageCircle, Radar, Send, ShieldCheck, Sparkles, Target,
  User, UserPlus, Users, Wallet, Zap,
} from "lucide-react";

/**
 * Main page — module hub (standard landing structure).
 * Shown on "/" for visitors who are not logged in:
 *   hero → trust bar → modules (login-gated) → how it works →
 *   marketer membership → dual-source data (site + Telegram) → FAQ → footer.
 */

const modules = [
  { icon: Map, title: "نقشه فروشندگان", desc: "۲۳ شرکت ایرانی + ۱۰۰ شرکت بین‌المللی (چین و جهان) با تحلیل هزینه و قیمت نمونه", badge: "زنده" },
  { icon: FileText, title: "کاتالوگ محصولات", desc: "تجمیع مشخصات BLDC خانگی و صنعتی — خروجی CSV و HTML آماده چاپ", badge: "PDF/CSV" },
  { icon: Sparkles, title: "RAG آنالیز کاتالوگ", desc: "پردازش سمانتیک کاتالوگ‌های PDF (نیان موتور و HTI) با ایندکس برداری", badge: "RAG" },
  { icon: Send, title: "مرکز پیام‌رسانی", desc: "اعلان‌ها از طریق ربات تلگرام با تأیید انسانی، Dry Run و انطباق", badge: "TG" },
  { icon: User, title: "حساب کاربری", desc: "داشبورد نقش‌محور: ادمین، خریدار، فروشنده، مشتری و بازاریاب با ماژول‌های اختصاصی", badge: "۵ نقش" },
  { icon: Zap, title: "HTI Snap Model", desc: "نمای یک‌صفحه‌ای ممیزی صنعتی، پکیج پیشنهادی و برنامه ۳۰/۶۰/۹۰ روزه", badge: "AI" },
];

const trustItems = [
  { icon: Globe2, title: "داده دومنبعه", desc: "همان داده‌ها هم در سایت و هم داخل ربات تلگرام — بدون رفت‌وبرگشت" },
  { icon: ShieldCheck, title: "تأیید انسانی", desc: "هیچ پیامی بدون تأیید اپراتور ارسال نمی‌شود" },
  { icon: Wallet, title: "قیمت‌گذاری شفاف", desc: "نمونه قیمت هر وات و برآورد کاهش هزینه برای هر شرکت" },
  { icon: BadgeCheck, title: "بدون ادعای تضمین", desc: "اطلاعات عمومی با منبع — نه وعده رتبه و فروش" },
];

const steps = [
  { n: "۱", title: "ثبت‌نام", desc: "با شماره موبایل در سایت یا مستقیماً داخل ربات تلگرام (/register)" },
  { n: "۲", title: "کشف شرکت‌ها", desc: "جست‌وجو در ۱۲۳ شرکت ایرانی و جهانی روی نقشه تعاملی" },
  { n: "۳", title: "تحلیل هزینه", desc: "نمونه قیمت، توان، ولتاژ و درصد صرفه‌جویی عمده" },
  { n: "۴", title: "پیگیری در تلگرام", desc: "استعلام و اعلان با تأیید انسانی — همان داده‌ها در چت" },
];

const marketerBenefits = [
  "پنل اختصاصی بازاریاب با ماژول لید و کمیسیون",
  "ثبت معرفی مشتری و پیگیری کمیسیون در داشبورد",
  "همان داده‌های سایت مستقیماً داخل ربات تلگرام",
  "گزارش عملکرد: کلیک، ثبت‌نام و معرفی‌های موفق",
  "ابزار ارسال با تأیید انسانی و فهرست عدم تماس",
];

const faqs = [
  { q: "ورود چطور انجام می‌شود؟", a: "با شماره موبایل و رمز عبور در صفحه ورود؛ حساب‌های دمو با رمز demo123 آماده‌اند. در ربات تلگرام هم /register بزنید." },
  { q: "بازاریاب‌ها چطور عضو می‌شوند؟", a: "از صفحه ثبت‌نام، نقش «بازاریاب» را انتخاب کنید؛ پنل معرفی و کمیسیون فعال می‌شود. حساب دمو: 09128888888." },
  { q: "داده‌ها از کجا می‌آیند؟", a: "از دو منبع یکسان: سایت (نقشه، کاتالوگ، RAG) و ربات تلگرام — نمونه قیمت‌ها تخمینی دمو هستند و باید با فروشنده تأیید شوند." },
];

export default function ModuleHub() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#182230]" dir="rtl">
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#153e35] text-white">
        <div className="absolute -left-20 -top-24 size-72 rounded-full border-[46px] border-white/[.04]" />
        <div className="absolute -bottom-32 -right-16 size-80 rounded-full border-[56px] border-white/[.03]" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col gap-8 px-5 py-14 md:flex-row md:items-center md:py-20">
          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black tracking-[.12em] text-[#8dd0b9]">
              <Radar size={13} /> BLDC MAP SIGNAL · MOTORLEAD OS
            </div>
            <h1 className="text-2xl font-black leading-snug md:text-[36px]">مرکز عملیات بازار موتورهای BLDC<span className="text-[#8dd0b9]"> — ایران و جهان</span></h1>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-white/65">فروشندگان و سازندگان موتور BLDC را کشف، تحلیل هزینه و اولویت‌بندی کنید؛ سپس با تأیید انسانی از طریق ربات تلگرام پیگیری کنید. داده‌ها در دو منبع — سایت و تلگرام — همزمان در دسترس‌اند.</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <a href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#153e35] shadow-[0_10px_26px_rgba(0,0,0,.25)] transition hover:-translate-y-0.5"><KeyRound size={15}/> ورود به حساب</a>
              <a href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-black text-white transition hover:bg-white/20"><UserPlus size={15}/> ثبت‌نام رایگان</a>
              <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-black text-white transition hover:bg-white/20"><Send size={15}/> ربات تلگرام</a>
              <a href="https://ble.ir/power_sell_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#0d8a5b] px-5 py-3 text-xs font-black text-white shadow-[0_10px_26px_rgba(13,138,91,.35)] transition hover:-translate-y-0.5"><MessageCircle size={15}/> ربات بله</a>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 md:w-[220px] md:grid-cols-1">
            {[["۱۲۳", "شرکت روی نقشه"], ["۵", "نقش کاربری"], ["۳", "مسیر داده"], ["۱۰۰٪", "تأیید انسانی"]].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center">
                <div className="text-xl font-black text-[#8dd0b9]">{v}</div>
                <div className="mt-0.5 text-[9px] text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Trust bar ────────────────────────────────────── */}
      <section className="border-b border-[#e4e8eb] bg-white">
        <div className="mx-auto grid max-w-[1100px] gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((t) => (
            <div key={t.title} className="flex items-start gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e9f2ee] text-[#256452]"><t.icon size={17}/></span>
              <div><div className="text-[11px] font-black text-[#26333d]">{t.title}</div><div className="mt-1 text-[9px] leading-4 text-[#7c858d]">{t.desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-5">
        {/* ── Modules ────────────────────────────────────── */}
        <section className="py-10">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> ماژول‌های سامانه</div>
          <h2 className="text-xl font-black text-[#14211e]">هر ماژول پس از ورود فعال می‌شود</h2>
          <p className="mt-1.5 text-[10px] text-[#78828b]">ورود با شماره موبایل الزامی است — حساب‌های دمو برای تست همه نقش‌ها آماده‌اند.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <a key={m.title} href="/login" className="group relative overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#a9c8be] hover:shadow-md">
                <div className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#e9f2ee] text-[#256452]"><m.icon size={19}/></span>
                  <span className="rounded-md bg-[#f2f4f4] px-2 py-1 text-[9px] font-bold text-[#7c868d]">{m.badge}</span>
                </div>
                <h3 className="mt-4 text-sm font-black text-[#1b282f]">{m.title}</h3>
                <p className="mt-1.5 text-[10px] leading-5 text-[#7c858d]">{m.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 border-t border-[#edf0f1] pt-3 text-[9px] font-black text-[#a17a38]">
                  <Lock size={12}/> برای دسترسی وارد شوید
                  <span className="mr-auto text-[#256452] opacity-0 transition group-hover:opacity-100">ورود ←</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── How it works ───────────────────────────────── */}
        <section className="rounded-3xl border border-[#dce5e1] bg-[#f7faf8] p-6 md:p-8">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> فرآیند</div>
          <h2 className="text-xl font-black text-[#14211e]">از ثبت‌نام تا پیگیری در ۴ گام</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-[#e3e9e6] bg-white p-4">
                <span className="absolute -left-2 -top-4 text-6xl font-black text-[#eef3f0]">{s.n}</span>
                <div className="relative">
                  <div className="text-[11px] font-black text-[#2c7a65]">گام {s.n}</div>
                  <h3 className="mt-1 text-[13px] font-black">{s.title}</h3>
                  <p className="mt-2 text-[10px] leading-5 text-[#66736e]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Marketer membership ────────────────────────── */}
        <section className="relative mt-8 overflow-hidden rounded-3xl bg-[#153e35] p-6 text-white shadow-[0_18px_45px_rgba(21,62,53,.16)] md:p-9">
          <div className="absolute -left-14 -top-20 size-64 rounded-full border-[44px] border-white/[.025]" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-[.08em] text-[#8dd0b9]"><Megaphone size={14}/> عضویت بازاریاب‌ها</div>
              <h2 className="text-xl font-black leading-snug md:text-2xl">بازاریاب شوید و از معرفی، کمیسیون بگیرید</h2>
              <p className="mt-3 max-w-2xl text-[11px] leading-6 text-white/65">در مدل همکاری بازاریابی، معرف هر مشتری یا فروشنده، سهم کمیسیون خود را در پنل اختصاصی دنبال می‌کند؛ داده‌های سامانه هم از سایت و هم از داخل ربات تلگرام در دسترس بازاریاب است تا بتواند بدون ابزار اضافه معرفی کند.</p>
              <ul className="mt-5 grid gap-2.5 text-[10px] leading-5 text-white/85 sm:grid-cols-2">
                {marketerBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#62d2a5]"/>{b}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#153e35]"><Megaphone size={15}/> ثبت‌نام به‌عنوان بازاریاب</a>
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-[10px] font-bold text-white/80"><KeyRound size={13}/> حساب دمو بازاریاب: <b dir="ltr">09128888888</b> · demo123</span>
              </div>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-[280px] lg:grid-cols-1">
              {[["کمیسیون معرفی", "پیگیری در پنل"], ["ربات تلگرام", "داده‌ها داخل چت"], ["گزارش عملکرد", "کلیک و ثبت‌نام"]].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="text-[11px] font-black text-[#8dd0b9]">{t}</div>
                  <div className="mt-1 text-[9px] text-white/55">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Multi-source data (site + Telegram + Bale) ──── */}
        <section className="py-10">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> داده در سه مسیر</div>
          <h2 className="text-xl font-black text-[#14211e]">همان داده‌ها — سایت، تلگرام و بله</h2>
          <p className="mt-1.5 max-w-2xl text-[10px] leading-5 text-[#78828b]">شرکت‌ها، قیمت نمونه و کاتالوگ در سایت نمایش داده می‌شوند و همان محتوا مستقیماً داخل چت هر دو ربات — تلگرام و بله — هم در دسترس است.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e9f2ee] text-[#256452]"><Globe2 size={19}/></span>
                <span className="rounded-md bg-[#e9f4ef] px-2 py-1 text-[9px] font-black text-[#21725d]">منبع ۱ · سایت</span>
              </div>
              <h3 className="mt-4 text-sm font-black">نقشه، کاتالوگ و RAG</h3>
              <p className="mt-2 text-[10px] leading-5 text-[#7c858d]">نقشه ۱۲۳ شرکت با فیلتر کشور و تحلیل هزینه، جدول کاتالوگ با خروجی CSV/HTML و آنالیز سمانتیک کاتالوگ‌های PDF.</p>
            </div>
            <div className="rounded-2xl border border-[#cfe3f1] bg-[#f2f9fd] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-[#dceef7] text-[#1e7ea8]"><Bot size={19}/></span>
                <span className="rounded-md bg-[#dceef7] px-2 py-1 text-[9px] font-black text-[#17688f]">منبع ۲ · تلگرام</span>
              </div>
              <h3 className="mt-4 text-sm font-black">@Pars_sell_bot — داده داخل چت</h3>
              <p className="mt-2 text-[10px] leading-5 text-[#7c858d]">لیست شرکت‌های برتر با قیمت نمونه، جدول کاتالوگ، آمار لیدها و ثبت‌نام کاربران — همه بدون خروج از تلگرام.</p>
              <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr">
                {["/map", "/catalog", "/leads", "/register"].map((c) => <code key={c} className="rounded-md bg-white px-2 py-1 text-[9px] font-bold text-[#1e7ea8]">{c}</code>)}
              </div>
            </div>
            <div className="rounded-2xl border border-[#c8ecd7] bg-[#eefaf3] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-[#d9f2e5] text-[#0d8a5b]"><MessageCircle size={19}/></span>
                <span className="rounded-md bg-[#d9f2e5] px-2 py-1 text-[9px] font-black text-[#0d7a50]">منبع ۳ · بله</span>
              </div>
              <h3 className="mt-4 text-sm font-black">@power_sell_bot — نسخه بله</h3>
              <p className="mt-2 text-[10px] leading-5 text-[#5f6b67]">همان دستورها و همان داده‌ها روی پیام‌رسان ایرانی بله — شرکت‌های برتر، کاتالوگ داخل چت، آمار لیدها و ثبت‌نام با شماره موبایل.</p>
              <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr">
                {["/map", "/leads", "/users", "/clinic"].map((c) => <code key={c} className="rounded-md bg-white px-2 py-1 text-[9px] font-bold text-[#0d8a5b]">{c}</code>)}
              </div>
            </div>
          </div>
        </section>

        {/* ── Bot network (all three bots) ────────────────── */}
        <section className="mt-8 rounded-3xl border border-[#dce5e1] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> شبکه ربات‌ها</div>
          <h2 className="text-xl font-black text-[#14211e]">سه ربات، سه کانال ارتباطی</h2>
          <p className="mt-1.5 max-w-2xl text-[10px] leading-5 text-[#78828b]">هر ربات منوی کامل فارسی و داده داخل چت دارد — داده‌های BLDC و ایجنت‌های مهاجرت در همه کانال‌ها یکسان است.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[#cfe3f1] bg-[#f2f9fd] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between"><Send size={19} className="text-[#1e7ea8]"/><span className="rounded-full bg-[#dceef7] px-2 py-0.5 text-[9px] font-black text-[#17688f]">تلگرام</span></div>
              <div className="mt-3 text-sm font-black text-[#26333d]">@Pars_sell_bot</div>
              <p className="mt-1.5 text-[9px] leading-4 text-[#6b767e]">مرکز عملیات BLDC — نقشه، کاتالوگ، لیدها و ثبت‌نام کاربران</p>
            </a>
            <a href="https://ble.ir/power_sell_bot" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[#c8ecd7] bg-[#eefaf3] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between"><MessageCircle size={19} className="text-[#0d8a5b]"/><span className="rounded-full bg-[#d9f2e5] px-2 py-0.5 text-[9px] font-black text-[#0d7a50]">بله</span></div>
              <div className="mt-3 text-sm font-black text-[#26333d]">@power_sell_bot</div>
              <p className="mt-1.5 text-[9px] leading-4 text-[#5f6b67]">نسخه بله سامانه BLDC — همان دستورها و داده‌ها روی پیام‌رسان ایرانی</p>
            </a>
            <a href="https://t.me/shahrokh_imigration_bot" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[#eee5d2] bg-[#fbf7ee] p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between"><Bot size={19} className="text-[#9a7521]"/><span className="rounded-full bg-[#f3ead5] px-2 py-0.5 text-[9px] font-black text-[#8a6a1f]">مهاجرت</span></div>
              <div className="mt-3 text-sm font-black text-[#26333d]">@shahrokh_imigration_bot</div>
              <p className="mt-1.5 text-[9px] leading-4 text-[#6b767e]">گروه مهاجرتی شاهرخ — مسیرهای ترکیه و ۲۰ ایجنت مهاجرت</p>
            </a>
          </div>
        </section>

        <section className="grid gap-4 pb-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><Users size={16}/></span><h3 className="text-sm font-black">حساب‌های دمو — رمز همه: <span dir="ltr" className="text-[#1f7ba6]">demo123</span></h3></div>
            <p className="mt-2 text-[10px] leading-5 text-[#6b767e]">ادمین 09120000001 · خریدار 09121111111 · فروشندگان 09123333333 و 09124444444 · مشتریان 09125555555 و 09126666666 · بازاریاب 09128888888 — یا در ربات تلگرام <b dir="ltr">/register</b> + شماره موبایل.</p>
          </div>
          <div className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black"><Target size={16} className="text-[#256452]"/> سؤالات پرتکرار</h3>
            <div className="mt-3 space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-xl bg-[#f8faf9] p-3">
                  <div className="text-[10px] font-black text-[#26333d]">{f.q}</div>
                  <div className="mt-1 text-[9px] leading-4 text-[#7c858d]">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-[#e4e8eb] bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#153e35] text-white"><Radar size={18}/></div>
            <div><div className="text-[12px] font-black">BLDC Map Signal</div><div className="text-[9px] text-[#9aa2a8]">MOTORLEAD OS · نسخه دمو</div></div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#6b767e]">
            <a href="/login" className="hover:text-[#256452]">ورود</a>
            <a href="/register" className="hover:text-[#256452]">ثبت‌نام</a>
            <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="hover:text-[#1e7ea8]">تلگرام</a>
            <a href="https://ble.ir/power_sell_bot" target="_blank" rel="noopener noreferrer" className="hover:text-[#0d8a5b]">بله</a>
            <a href="https://www.instagram.com/yasinrou/" target="_blank" rel="noopener noreferrer" className="hover:text-[#bd3564]">اینستاگرام</a>
          </div>
          <p className="max-w-xs text-center text-[9px] leading-4 text-[#9aa2a8] md:text-left">اطلاعات عمومی است و پیش از هر سفارش باید با فروشنده تأیید شود. بدون ادعای تضمین.</p>
        </div>
      </footer>
    </main>
  );
}
