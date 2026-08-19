"use client";

import {
  FileText, KeyRound, Lock, Map, Radar, Send, ShieldCheck, Sparkles,
  User, UserPlus, Zap,
} from "lucide-react";

/**
 * Main page — module hub. Shown on "/" for visitors who are not logged in.
 * Every module card is locked until the user logs in (demo accounts or
 * /register). After login the full dashboard replaces this page.
 */

const modules = [
  { icon: Map, title: "نقشه فروشندگان", desc: "۲۳ شرکت ایرانی + ۱۰۰ شرکت بین‌المللی (چین و جهان) با تحلیل هزینه و قیمت نمونه", badge: "زنده" },
  { icon: FileText, title: "کاتالوگ محصولات", desc: "تجمیع مشخصات BLDC خانگی و صنعتی — خروجی CSV و HTML آماده چاپ", badge: "PDF/CSV" },
  { icon: Sparkles, title: "RAG آنالیز کاتالوگ", desc: "پردازش سمانتیک کاتالوگ‌های PDF (نیان موتور و HTI) با ایندکس برداری", badge: "RAG" },
  { icon: Send, title: "مرکز پیام‌رسانی", desc: "اعلان‌ها از طریق ربات تلگرام با تأیید انسانی، Dry Run و انطباق", badge: "TG" },
  { icon: User, title: "حساب کاربری", desc: "داشبورد نقش‌محور: ادمین، خریدار، فروشنده و مشتری با ماژول‌های اختصاصی", badge: "نقش‌ها" },
  { icon: Zap, title: "HTI Snap Model", desc: "نمای یک‌صفحه‌ای ممیزی صنعتی، پکیج پیشنهادی و برنامه ۳۰/۶۰/۹۰ روزه", badge: "AI" },
];

export default function ModuleHub() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#182230]" dir="rtl">
      {/* Hero */}
      <header className="relative overflow-hidden bg-[#153e35] text-white">
        <div className="absolute -left-20 -top-24 size-72 rounded-full border-[46px] border-white/[.04]" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:py-20">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,.25)]"><Radar size={30}/></div>
          <div className="flex-1">
            <div className="mb-2 text-[10px] font-black tracking-[.18em] text-[#8dd0b9]">BLDC MAP SIGNAL · MOTORLEAD OS</div>
            <h1 className="text-2xl font-black leading-snug md:text-[34px]">مرکز عملیات بازار موتورهای BLDC</h1>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-white/65">فروشندگان و سازندگان موتور BLDC ایران و جهان را کشف، تحلیل هزینه و اولویت‌بندی کنید؛ سپس با تأیید انسانی از طریق ربات تلگرام پیگیری کنید. دسترسی به ماژول‌ها نیازمند ورود به حساب است.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#153e35] shadow-[0_10px_26px_rgba(0,0,0,.25)]"><KeyRound size={15}/> ورود به حساب</a>
              <a href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-black text-white"><UserPlus size={15}/> ثبت‌نام رایگان</a>
              <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-black text-white"><Send size={15}/> ربات تلگرام</a>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 md:grid-cols-1">
            {[["۱۲۳", "شرکت روی نقشه"], ["۴", "نقش کاربری"], ["۱۰۰٪", "تأیید انسانی"], ["۰", "ادعای تضمین"]].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center">
                <div className="text-xl font-black text-[#8dd0b9]">{v}</div>
                <div className="mt-0.5 text-[9px] text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Modules */}
      <section className="mx-auto max-w-[1100px] px-5 py-10">
        <div className="mb-6 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> ماژول‌های سامانه — ورود لازم است</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Demo accounts strip */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5">
          <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><ShieldCheck size={16}/></span><h3 className="text-sm font-black">حساب‌های دمو — رمز همه: <span dir="ltr" className="text-[#1f7ba6]">demo123</span></h3></div>
          <p className="mt-2 text-[10px] leading-5 text-[#6b767e]">ادمین 09120000001 · خریدار 09121111111 · فروشندگان 09123333333 و 09124444444 · مشتریان 09125555555 و 09126666666 — یا از طریق ربات تلگرام با <b dir="ltr">/register</b> و شماره موبایل ثبت‌نام کنید.</p>
        </section>
      </section>

      <footer className="border-t border-[#e4e8eb] bg-white py-6 text-center text-[9px] text-[#9aa2a8]">
        BLDC Map Signal · نسخه دمو — اطلاعات عمومی است و قبل از هر سفارش باید با فروشنده تأیید شود.
      </footer>
    </main>
  );
}
