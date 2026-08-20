"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Briefcase, Building2, CheckCircle2, FileText, KeyRound, ListChecks,
  LogIn, LogOut, PackageCheck, Phone, Send, ShieldCheck, ShoppingCart, Store,
  Target, User, Users, Wallet, Zap,
} from "lucide-react";
import { sellers, type Seller } from "../data";
import { priceInfo } from "../pricing";
import { demoAccounts, roleLabels, type DemoAccount, type Role } from "../../data/accounts";
import { getRegisteredUsers, login, logout, readSession, type Session } from "../../lib/session";

type SessionAccount = Omit<DemoAccount, "password">;

const MODULES: Record<Role, { icon: typeof Users; title: string; desc: string }[]> = {
  admin: [
    { icon: Users, title: "مدیریت کاربران", desc: "فهرست کاربران، فروشندگان و مشتریان ثبت‌شده" },
    { icon: Store, title: "تأیید فروشندگان", desc: "بازبینی پروفایل و کاتالوگ فروشندگان" },
    { icon: BarChart3, title: "گزارش و آمار", desc: "لیدها، استعلام‌ها و پیام‌های ارسال‌شده" },
    { icon: Send, title: "اتصال تلگرام", desc: "ربات @Pars_sell_bot و ثبت‌نام کاربران با شماره موبایل" },
  ],
  buyer: [
    { icon: Target, title: "بانک لیدهای من", desc: "شرکت‌های ذخیره‌شده با تحلیل هزینه" },
    { icon: ShoppingCart, title: "درخواست استعلام", desc: "استعلام قیمت و نمونه از فروشنده" },
    { icon: Send, title: "پیام‌رسانی", desc: "ارسال درخواست با تأیید انسانی به تلگرام" },
    { icon: Wallet, title: "مقایسه هزینه", desc: "کاهش هزینه با خرید عمده و تولید محلی" },
  ],
  seller: [
    { icon: Building2, title: "پروفایل شرکت", desc: "محصولات، توان و ولتاژ شرکت من" },
    { icon: PackageCheck, title: "قیمت‌گذاری", desc: "نمونه قیمت هر وات و تخفیف عمده" },
    { icon: ListChecks, title: "لیدهای ورودی", desc: "درخواست‌های استعلام از خریداران" },
    { icon: FileText, title: "کاتالوگ", desc: "نسخه HTML و CSV کاتالوگ محصولات" },
  ],
  customer: [
    { icon: Target, title: "علاقه‌مندی‌ها", desc: "شرکت‌های دنبال‌شده برای پروژه" },
    { icon: ShoppingCart, title: "سفارش نمونه", desc: "درخواست نمونه و استعلام مهندسی" },
    { icon: Send, title: "ارتباط با فروشنده", desc: "پیام تأییدشده به فروشنده" },
    { icon: Wallet, title: "پیش‌فاکتور", desc: "برآورد هزینه پروژه بر اساس نمونه قیمت" },
  ],
  marketer: [
    { icon: Target, title: "یافتن لید جدید", desc: "کشف شرکت‌های مناسب برای معرفی" },
    { icon: Wallet, title: "کمیسیون و معرفی", desc: "ثبت معرفی و پیگیری کمیسیون هر مشتری" },
    { icon: Send, title: "ارسال در تلگرام", desc: "معرفی با تأیید انسانی از طریق ربات" },
    { icon: BarChart3, title: "گزارش عملکرد", desc: "کلیک‌ها، ثبت‌نام‌ها و معرفی‌های موفق" },
  ],
};

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-[#efe6f7] text-[#6d4d92]",
  buyer: "bg-[#e8f1f8] text-[#346c9d]",
  seller: "bg-[#e9f4ef] text-[#21725d]",
  customer: "bg-[#f8eedb] text-[#a0792c]",
  marketer: "bg-[#fbe6ee] text-[#b0346a]",
};

const INBOUND_LEADS = [
  { from: "بازرگانی کریمی", city: "تهران", ask: "استعلام ۵۰۰ عدد فن سقفی 90W", when: "۲ ساعت پیش" },
  { from: "تهویه آسایش اصفهان", city: "اصفهان", ask: "پیش‌فاکتور موتور HVAC 5.5kW", when: "دیروز" },
  { from: "ساختمان سبز شیراز", city: "شیراز", ask: "نمونه پمپ خورشیدی 400W", when: "۳ روز پیش" },
];

function readLeadIds(): number[] {
  if (typeof window === "undefined") return [1, 7];
  try {
    const raw = window.localStorage.getItem("bldc_leads");
    if (raw) return JSON.parse(raw) as number[];
  } catch { /* ignore */ }
  return [1, 7];
}

export default function AccountView({ onSessionChange }: { onSessionChange?: (s: Session | null) => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState("");
  const [leadIds, setLeadIds] = useState<number[]>([]);

  const users = useMemo<SessionAccount[]>(
    () => [...demoAccounts, ...getRegisteredUsers()].map((a) => {
      const { password: _pw, ...rest } = a;
      return rest;
    }),
    []
  );
  const meta = useMemo(
    () => ({ total: users.length, sellers: users.filter((u) => u.role === "seller").length }),
    [users]
  );

  useEffect(() => {
    setSession(readSession());
    setLeadIds(readLeadIds());
  }, []);

  const mySellers = useMemo(
    () => leadIds.map((id) => sellers.find((s) => s.id === id)).filter((s): s is Seller => Boolean(s)),
    [leadIds]
  );
  const myCompany = useMemo(() => {
    if (!session) return undefined;
    const c = session.account.company ?? "";
    return sellers.find((s) => s.name.includes(c) || s.shortName === c) ?? sellers[0];
  }, [session]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function switchRole(account: DemoAccount) {
    setBusyId(account.id);
    try {
      const result = login(account.phone, account.password);
      if ("error" in result) throw new Error(result.error);
      setSession(result.session);
      onSessionChange?.(result.session);
      flash(`نقش به «${roleLabels[account.role]}» تغییر کرد`);
    } catch {
      flash("تغییر نقش ناموفق بود");
    } finally {
      setBusyId("");
    }
  }

  function doLogout() {
    logout();
    setSession(null);
    onSessionChange?.(null);
    flash("از حساب خارج شدید");
  }

  if (!session) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="w-full max-w-sm rounded-2xl border border-[#e1e5e7] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e9f2ee] text-[#256452]"><LogIn size={26}/></div>
          <h2 className="mt-4 text-base font-black">ابتدا وارد حساب شوید</h2>
          <p className="mt-2 text-[10px] leading-5 text-[#7c858d]">پنل نقش‌محور (ادمین، خریدار، فروشنده، مشتری) پس از ورود در دسترس است. حساب‌های دمو با رمز <b dir="ltr">demo123</b> آماده‌اند.</p>
          <a href="/login" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#183f36] px-6 py-3 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)]"><KeyRound size={15}/> ورود / حساب‌های دمو</a>
        </div>
      </div>
    );
  }

  const role = session.account.role;

  return (
    <div className="space-y-4">
      {/* Identity header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-xl bg-[#153e35] text-sm font-black text-white">{session.account.name.slice(0, 2)}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-[16px] font-black text-[#1b282f]">{session.account.name}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${ROLE_COLORS[role]}`}>{roleLabels[role]}</span></div>
            <p className="mt-1 flex items-center gap-2 text-[10px] text-[#7f8991]"><Phone size={12}/><span dir="ltr">{session.account.phone}</span>{session.account.company && <> · {session.account.company} · {session.account.city}</>}</p>
          </div>
        </div>
        <div className="md:mr-auto flex items-center gap-2">
          <span className="rounded-lg bg-[#f2f4f4] px-2.5 py-1.5 text-[9px] font-bold text-[#7c868d]">دمو — بدون رمز واقعی</span>
          <button onClick={doLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3e7e6] px-3 py-2 text-[10px] font-bold text-[#9a625b]"><LogOut size={14}/> خروج</button>
        </div>
      </section>

      {/* Role modules */}
      <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><Zap size={16}/></span><h3 className="text-sm font-black">ماژول‌های نقش {roleLabels[role]}</h3><span className="mr-auto text-[9px] text-[#929ba1]">ویژه این نقش</span></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODULES[role].map((m) => (
            <div key={m.title} className="rounded-xl border border-[#e5e9e8] p-3.5">
              <m.icon size={17} className="mb-3 text-[#34735f]"/>
              <div className="text-[11px] font-black">{m.title}</div>
              <div className="mt-1 text-[9px] leading-4 text-[#85908c]">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin: users table */}
      {role === "admin" && (
        <section className="overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e8ebed] px-5 py-4">
            <div><h3 className="text-sm font-black">کاربران دموی ثبت‌شده</h3><p className="mt-1 text-[10px] text-[#8b949b]">از پایگاه داده دمو (accounts) — {meta?.total ?? 0} کاربر · {meta?.sellers ?? 0} فروشنده</p></div>
            <span className="flex items-center gap-1.5 rounded-md bg-[#e9f4ef] px-2 py-1 text-[9px] font-black text-[#21725d]"><CheckCircle2 size={12}/> دیتابیس دمو فعال</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-[11px]">
              <thead className="bg-[#fafbfb] text-[9px] font-bold text-[#90999f]"><tr><th className="px-5 py-3">نام</th><th>نقش</th><th>موبایل</th><th>شرکت</th><th>شهر</th><th>وضعیت</th></tr></thead>
              <tbody>
                {(users).map((u) => (
                  <tr key={u.id} className="border-t border-[#edf0f2] hover:bg-[#f8faf9]">
                    <td className="px-5 py-3 font-black text-[#27343d]">{u.name}</td>
                    <td><span className={`rounded-md px-2 py-1 font-black ${ROLE_COLORS[u.role]}`}>{roleLabels[u.role]}</span></td>
                    <td dir="ltr" className="text-[#6f7a83]">{u.phone}</td>
                    <td className="text-[#6f7a83]">{u.company ?? "—"}</td>
                    <td className="text-[#6f7a83]">{u.city ?? "—"}</td>
                    <td><span className="text-[#28725f]">● فعال</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Seller: company + pricing + inbound leads */}
      {role === "seller" && myCompany && (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><Building2 size={16}/></span><h3 className="text-sm font-black">پروفایل شرکت من</h3></div>
            <div className="mt-4 flex items-start gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf3f1] text-sm font-black text-[#245f51]">{myCompany.shortName}</div>
              <div>
                <h4 className="text-[15px] font-black text-[#1b282f]">{myCompany.name}</h4>
                <p className="mt-1 text-[10px] text-[#7f8991]">{myCompany.city} · {myCompany.zone} · {myCompany.production}</p>
                <p className="mt-1 text-[10px] font-bold text-[#326252]">توان: {myCompany.power} · ولتاژ: {myCompany.voltage} · امتیاز: {myCompany.score}/100</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">{myCompany.products.map((p) => <span key={p} className="rounded-md bg-[#f1f3f4] px-2 py-1 text-[10px] font-bold text-[#58636c]">{p}</span>)}</div>
            <div className="mt-4 rounded-xl border border-[#e3e8e6] bg-[#f8faf9] p-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#65716d]"><span>نمونه قیمت (برآورد دمو)</span><Wallet size={14} className="text-[#34735f]"/></div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black">
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-[#225e4f]">{priceInfo(myCompany).perWatt}</span>
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-[#225e4f]">برآورد واحد: {priceInfo(myCompany).unitEstimate}</span>
                <span className="rounded-lg bg-[#e9f4ef] px-2.5 py-1.5 text-[#21725d]">تخفیف عمده: {priceInfo(myCompany).savingPct}٪</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><ListChecks size={16}/></span><h3 className="text-sm font-black">لیدهای ورودی (دمو)</h3></div>
            <div className="mt-4 space-y-2">
              {INBOUND_LEADS.map((l) => (
                <div key={l.ask} className="flex items-start justify-between gap-3 rounded-xl border border-[#edf0f1] p-3">
                  <div><div className="text-[11px] font-black text-[#27343d]">{l.from} <span className="text-[9px] font-bold text-[#8b949b]">· {l.city}</span></div><div className="mt-1 text-[10px] text-[#6f7a83]">{l.ask}</div></div>
                  <span className="shrink-0 text-[9px] text-[#9aa2a8]">{l.when}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Buyer / customer: saved leads with pricing */}
      {(role === "buyer" || role === "customer") && (
        <section className="overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e8ebed] px-5 py-4">
            <div><h3 className="text-sm font-black">{role === "buyer" ? "بانک لیدهای من" : "شرکت‌های دنبال‌شده"}</h3><p className="mt-1 text-[10px] text-[#8b949b]">نمونه قیمت و کاهش هزینه برای هر شرکت</p></div>
            <span className="rounded-md bg-[#f2f4f4] px-2 py-1 text-[10px] font-bold text-[#7c868d]">{mySellers.length} شرکت</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-[11px]">
              <thead className="bg-[#fafbfb] text-[9px] font-bold text-[#90999f]"><tr><th className="px-5 py-3">شرکت</th><th>توان</th><th>نمونه قیمت</th><th>برآورد واحد</th><th>کاهش هزینه</th><th>اقدام</th></tr></thead>
              <tbody>
                {mySellers.map((s) => {
                  const pi = priceInfo(s);
                  return (
                    <tr key={s.id} className="border-t border-[#edf0f2] hover:bg-[#f8faf9]">
                      <td className="px-5 py-3.5 font-black text-[#27343d]">{s.name}<div className="mt-0.5 text-[9px] font-bold text-[#8b949b]">{s.city}{s.country ? ` · ${s.country}` : ""}</div></td>
                      <td className="text-[#6f7a83]">{s.power}</td>
                      <td><span className="rounded-md bg-[#e9f4ef] px-2 py-1 font-black text-[#21725d]">{pi.perWatt}</span></td>
                      <td className="font-black text-[#225e4f]">{pi.unitEstimate}</td>
                      <td><span className="rounded-md bg-[#f8eedb] px-2 py-1 font-black text-[#a0792c]">تا {pi.savingPct}٪</span></td>
                      <td><button onClick={() => flash(`استعلام ${s.name} ثبت شد — اعلان به تلگرام ارسال می‌شود`)} className="rounded-lg border border-[#dce4e1] px-3 py-1.5 text-[10px] font-black text-[#276754]">درخواست استعلام</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[#e7eaec] bg-[#fafbfb] px-5 py-3 text-[9px] text-[#899299]">تحلیل بر اساس قیمت‌گذاری تخمینی دمو — قبل از خرید با فروشنده تأیید شود.</div>
        </section>
      )}

      {/* Demo role switcher */}
      <section className="rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5">
        <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><User size={16}/></span><h3 className="text-sm font-black">سوییچ نقش (دمو) — مشاهده داشبورد هر کاربر</h3></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {demoAccounts.map((a) => (
            <button key={a.id} onClick={() => void switchRole(a)} disabled={busyId === a.id} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-right transition disabled:opacity-50 ${session.account.id === a.id ? "border-[#79aa9d] bg-[#eaf4f0]" : "border-[#e0e5e3] bg-white hover:border-[#b9d3cb]"}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-[9px] font-black ${ROLE_COLORS[a.role]}`}>{roleLabels[a.role].slice(0, 2)}</span>
              <span className="flex-1"><span className="block text-[10px] font-black text-[#26333d]">{a.name}</span><span className="block text-[9px] text-[#8b949b]">{roleLabels[a.role]} · <span dir="ltr">{a.phone}</span></span></span>
              {session.account.id === a.id ? <CheckCircle2 size={15} className="text-[#2f866d]"/> : <LogIn size={14} className="text-[#a6adb2]"/>}
            </button>
          ))}
        </div>
      </section>

      {toast && <div className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#172d27] px-4 py-3 text-xs font-bold text-white shadow-2xl"><CheckCircle2 size={17} className="text-[#62d2a5]"/>{toast}</div>}
    </div>
  );
}
