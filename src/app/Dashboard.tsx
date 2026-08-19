"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, AtSign, BarChart3, Bell, BookOpen, Bot, Building2, Check,
  CheckCircle2, ChevronDown, ChevronLeft, CircleHelp, ClipboardCheck, Code2, Download,
  ExternalLink, Factory, FileDown, FileText, Filter, Gauge, Globe2, Home, Layers3,
  LayoutDashboard, ListFilter, Map, MapPin, Menu, MessageSquareText, MoreHorizontal,
  PackageCheck, PanelRightClose, Plus, Radar, Search, Send, Settings, ShieldCheck,
  SlidersHorizontal, Sparkles, Target, Upload, User, Users, Wallet, X, Zap,
} from "lucide-react";
import { catalogRows, sellers, type Seller, type SellerType } from "./data";
import { globalSellers } from "./data-global";
import MultiMapViewer from "./components/MultiMapViewer";
import RAGCatalogAnalyzer from "./components/RAGCatalogAnalyzer";
import MessagingView from "./components/MessagingView";
import AccountView from "./components/AccountView";
import ModuleHub from "./components/ModuleHub";
import { priceInfo, tierLabel } from "./pricing";
import { readSession, type Session } from "@/lib/session";

type View = "map" | "hti" | "catalog" | "rag" | "messages" | "account";

type NavItem = { label: string; icon: typeof Home; view?: View; badge?: string };

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: "مرکز عملیات", items: [
    { label: "نمای کلی", icon: LayoutDashboard },
    { label: "نقشه فروشندگان", icon: Map, view: "map", badge: "زنده" },
    { label: "بانک لیدها", icon: Users, badge: "41" },
    { label: "لیدهای نمایشگاهی", icon: Building2, badge: "EX" },
  ]},
  { label: "هوشمندی و خروجی", items: [
    { label: "HTI Snap Model", icon: Zap, view: "hti", badge: "AI" },
    { label: "RAG آنالیز کاتالوگ", icon: Sparkles, view: "rag", badge: "RAG" },
    { label: "ممیزی فنی", icon: ClipboardCheck },
    { label: "تولید کاتالوگ", icon: FileText, view: "catalog" },
    { label: "مرکز پیام‌رسانی", icon: Send, view: "messages", badge: "TG" },
  ]},
  { label: "حساب و دسترسی", items: [
    { label: "حساب کاربری", icon: User, view: "account", badge: "دمو" },
    { label: "ورود / ثبت‌نام", icon: ShieldCheck, view: "account", badge: "OTP" },
  ]},
];

const typeLabels: Record<SellerType, string> = { household: "خانگی", industrial: "صنعتی", both: "هر دو" };

function priorityOf(score: number): { label: string; cls: string } {
  if (score >= 85) return { label: "P1", cls: "bg-[#f9e7e4] text-[#b04a40]" };
  if (score >= 70) return { label: "P2", cls: "bg-[#f8eedb] text-[#a0792c]" };
  return { label: "P3", cls: "bg-[#e8f1f8] text-[#3a6e9c]" };
}

export default function Dashboard() {
  const [view, setView] = useState<View>("map");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | SellerType>("all");
  const [voltage, setVoltage] = useState<"all" | "low" | "high">("all");
  const [catalogOnly, setCatalogOnly] = useState(false);
  const [production, setProduction] = useState("all");
  const [scope, setScope] = useState<"iran" | "world">("iran");
  const [country, setCountry] = useState<string>("all");
  const [selected, setSelected] = useState<Seller>(sellers[0]);
  const [leadIds, setLeadIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [1, 7];
    try {
      const raw = window.localStorage.getItem("bldc_leads");
      if (raw) return JSON.parse(raw) as number[];
    } catch { /* ignore */ }
    return [1, 7];
  });
  const [toast, setToast] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    setSession(readSession());
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("bldc_leads", JSON.stringify(leadIds));
    } catch { /* ignore */ }
  }, [leadIds]);

  const allSellers = useMemo<Seller[]>(
    () => (scope === "world" ? [...sellers, ...globalSellers] : sellers),
    [scope]
  );

  const worldCountries = useMemo(
    () => Array.from(new Set(globalSellers.map((s) => s.country ?? "نامشخص"))).sort(),
    []
  );

  const filtered = useMemo(() => allSellers.filter((seller) => {
    const haystack = [seller.name, seller.city, seller.zone, seller.country ?? "", ...seller.products].join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (type === "all" || seller.type === type || seller.type === "both") &&
      (voltage === "all" || seller.voltageClass === voltage) &&
      (!catalogOnly || seller.catalog) &&
      (production === "all" || seller.production === production) &&
      (scope === "iran" || country === "all" || (seller.country ?? "") === country);
  }), [allSellers, query, type, voltage, catalogOnly, production, scope, country]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function sendToTelegram(payload: { topic: string; title: string; details: string[] }) {
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "خطای ناشناخته");
      notify("به تلگرام ارسال شد 📨");
    } catch (error) {
      notify(`ارسال تلگرام ناموفق بود: ${error instanceof Error ? error.message : "خطا"}`);
    }
  }

  function addLead(seller: Seller) {
    if (!leadIds.includes(seller.id)) setLeadIds((ids) => [...ids, seller.id]);
    notify(`${seller.name} به بانک لیدها افزوده شد`);
    void sendToTelegram({
      topic: "lead_added",
      title: `${seller.name} — ${seller.city}`,
      details: [seller.zone, `محصول اصلی: ${seller.products[0] ?? "—"}`, `امتیاز: ${seller.score}/100`],
    });
  }

  function goTo(next: View) {
    setView(next);
    setMobileNav(false);
  }

  // Auth gate — every module requires login. While the session loads, show a
  // minimal loader; logged-out visitors get the main page (module hub).
  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6f8]" dir="rtl">
        <div className="flex items-center gap-3 rounded-2xl border border-[#e1e5e7] bg-white px-6 py-4 shadow-sm">
          <div className="grid size-10 place-items-center rounded-xl bg-[#153e35] text-white"><Radar size={20} className="animate-pulse"/></div>
          <div className="text-xs font-black text-[#5e6873]">در حال بررسی نشست...</div>
        </div>
      </div>
    );
  }
  if (!session) return <ModuleHub />;

  const initials = (session.account.name ?? "U").slice(0, 2);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#182230]" dir="rtl">
      <aside className={`fixed inset-y-0 right-0 z-50 w-[260px] border-l border-[#e6e9ee] bg-white transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-[#edf0f3] px-5">
          <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="بستن منو"><X size={20}/></button>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#153e35] text-white shadow-[0_6px_16px_rgba(21,62,53,.22)]"><Radar size={22}/></div>
            <div><div className="text-[15px] font-black tracking-tight">BLDC Map Signal</div><div className="mt-0.5 text-[10px] font-bold tracking-[.12em] text-[#88928f]">MOTORLEAD OS</div></div>
          </div>
        </div>
        <div className="flex h-[calc(100vh-72px)] flex-col overflow-y-auto px-3 py-5">
          {navGroups.map((group) => <div className="mb-6" key={group.label}>
            <div className="mb-2 px-3 text-[10px] font-bold tracking-[.08em] text-[#9ca4aa]">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.view === view;
                return <button key={item.label} onClick={() => item.view && goTo(item.view)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-bold transition ${active ? "bg-[#edf5f1] text-[#164b3f]" : "text-[#5e6873] hover:bg-[#f6f7f8] hover:text-[#26313d]"}`}>
                  <item.icon size={18} strokeWidth={active ? 2.3 : 1.8}/><span className="flex-1">{item.label}</span>
                  {item.badge && <span className={`rounded-md px-1.5 py-0.5 text-[9px] ${active ? "bg-white text-[#1b6b58]" : "bg-[#f0f2f4] text-[#899199]"}`}>{item.badge}</span>}
                </button>;
              })}
            </div>
          </div>)}
          <div className="mt-auto rounded-2xl bg-[#153e35] p-4 text-white">
            <div className="mb-3 flex items-center justify-between"><ShieldCheck size={19}/><span className="rounded-full bg-white/10 px-2 py-1 text-[9px]">انطباق فعال</span></div>
            <div className="text-xs font-bold">اطلاعات عمومی کسب‌وکار</div>
            <p className="mt-1.5 text-[10px] leading-5 text-white/60">تمام خروجی‌ها نیازمند بازبینی و تأیید انسانی هستند.</p>
          </div>
          <button className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[#69737c]"><Settings size={18}/>تنظیمات و انطباق</button>
        </div>
      </aside>

      {mobileNav && <button onClick={() => setMobileNav(false)} aria-label="بستن منو" className="fixed inset-0 z-40 bg-black/25 lg:hidden"/>}

      <div className="lg:mr-[260px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#e4e8eb] bg-white/95 px-4 backdrop-blur md:px-7">
          <button className="ml-3 rounded-lg p-2 lg:hidden" onClick={() => setMobileNav(true)} aria-label="باز کردن منو"><Menu size={22}/></button>
          <div className="hidden items-center gap-2 text-xs text-[#91999f] sm:flex"><span>BLDC Map Signal</span><ChevronLeft size={14}/><strong className="text-[#38434e]">{view === "map" ? "نقشه فروشندگان" : view === "hti" ? "HTI Snap Model" : view === "rag" ? "RAG آنالیز کاتالوگ" : view === "messages" ? "مرکز پیام‌رسانی" : view === "account" ? "حساب کاربری" : "کاتالوگ نهایی"}</strong></div>
          <div className="mr-auto flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-[#dfe5e3] px-3 py-1.5 text-[10px] font-bold text-[#326252] md:flex"><span className="size-1.5 animate-pulse rounded-full bg-[#35a977]"/> API زنده متصل</div>
            <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[#cfe3f1] bg-[#f2f9fd] px-3 py-1.5 text-[10px] font-black text-[#1e7ea8] transition hover:bg-[#e5f3fa]"><Send size={13}/> تلگرام</a>
            <button className="relative grid size-9 place-items-center rounded-full border border-[#e2e6e9] bg-white text-[#56616b]"><Bell size={17}/><span className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-[#e65b4f] ring-2 ring-white"/></button>
            <button onClick={() => goTo("account")} className="flex items-center gap-2 rounded-full border border-[#e2e6e9] py-1 pl-2 pr-1" title={session.account.name}><span className="grid size-7 place-items-center rounded-full bg-[#dceae4] text-[10px] font-black text-[#1c5749]">{initials}</span><ChevronDown className="hidden sm:block" size={13}/></button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-[#23816a]"><span className="h-px w-6 bg-[#23816a]"/> مرکز عملیات بازار ایران</div>
              <h1 className="text-[26px] font-black tracking-[-.02em] text-[#14211e] md:text-[32px]">{view === "map" ? "یابنده فروشنده BLDC" : view === "hti" ? "مدل Snapshot صنعتی HTI" : view === "rag" ? "RAG آنالیز کاتالوگ (Nian Motor)" : view === "messages" ? "مرکز پیام‌رسانی چندکاناله" : view === "account" ? "حساب کاربری و داشبورد نقش‌محور" : "کاتالوگ نهایی محصولات"}</h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-6 text-[#78828b]">{view === "map" ? "فروشنده، مونتاژکننده و سازنده را روی نقشه پیدا و برای ارزیابی انسانی آماده کنید — ایران و بازار جهانی." : view === "hti" ? "نمای یک‌صفحه‌ای اطلاعات عمومی، سیگنال‌های فنی و پیشنهاد اقدام بعدی." : view === "rag" ? "آنالیز هوشمند مشخصات فنی کاتالوگ‌های PDF (نیان موتور و HTI) با پردازش چانک‌های سمانتیک." : view === "messages" ? "ارسال اعلان‌ها و پیشنهادها از طریق ربات تلگرام با تأیید انسانی، حالت Dry Run و انطباق." : view === "account" ? "داشبورد جداگانه برای ادمین، خریدار، فروشنده و مشتری — نسخه دمو با حساب‌های آماده و ورود با شماره موبایل." : "تجمیع مشخصات عمومی از پین‌های بازبینی‌شده؛ پیش از خرید با فروشنده تأیید شود."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {view === "map" && <><a href="/api/catalog" className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold text-[#42505b] shadow-sm"><Download size={16}/> خروجی CSV</a><a href="/api/sellers?format=csv&scope=world" className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold text-[#42505b] shadow-sm"><Users size={16}/> CSV فروشندگان</a><button onClick={() => notify("حالت افزودن پین فعال شد — یک موقعیت روی نقشه انتخاب کنید")} className="inline-flex items-center gap-2 rounded-xl bg-[#183f36] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)]"><Plus size={17}/> افزودن لید یا پین</button></>}
              {view === "hti" && <><button onClick={() => void sendToTelegram({ topic: "proposal_ready", title: "Industrial Custom + Technical Recovery — HTI", details: ["بازسازی دیتاشیت‌های کاربردمحور", "تفکیک صفحات محصول بر اساس صنعت", "بسته اثبات فنی و پروژه‌های مرجع", "قیف درخواست نمونه و استعلام مهندسی"] })} className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold"><MessageSquareText size={16}/> ارسال به پیام‌رسانی</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#183f36] px-4 py-2.5 text-xs font-extrabold text-white"><FileDown size={16}/> تولید Proposal PDF</button></>}
              {view === "rag" && <><a href="https://nianmotor.ir/wp-content/uploads/2025/08/Nian-Motor-Catalog.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold text-[#42505b] shadow-sm"><ExternalLink size={16}/> لینک Nian Motor Catalog</a><button onClick={() => notify("پایگاه دانش RAG به‌روزرسانی شد")} className="inline-flex items-center gap-2 rounded-xl bg-[#183f36] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)]"><Sparkles size={16}/> به‌روزرسانی Vector Index</button></>}
              {view === "catalog" && <><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold"><FileDown size={16}/> نسخه PDF</button><a href="/api/catalog/html" className="inline-flex items-center gap-2 rounded-xl border border-[#dce1e4] bg-white px-4 py-2.5 text-xs font-extrabold text-[#42505b]"><Code2 size={16}/> دانلود HTML</a><a href="/api/catalog" className="inline-flex items-center gap-2 rounded-xl bg-[#183f36] px-4 py-2.5 text-xs font-extrabold text-white"><Download size={16}/> دانلود CSV</a></>}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label={scope === "world" ? "پین فعال جهانی" : "پین فعال ایران"} value={String(filtered.length)} sub={scope === "world" ? "ایران + ۱۰۰ شرکت بین‌المللی" : "۲۳ شرکت داخلی"} icon={MapPin} color="green"/>
            <Stat label="بازبینی انسانی" value={String(filtered.filter((s) => s.verified).length)} sub="٪ پوشش تأیید" icon={CheckCircle2} color="blue"/>
            <Stat label="دارای کاتالوگ" value={String(filtered.filter((s) => s.catalog).length)} sub="منبع عمومی" icon={BookOpen} color="amber"/>
            <Stat label="لید اولویت‌بالا" value={String(filtered.filter((s) => s.score >= 85).length)} sub="امتیاز +۸۵ · P1" icon={Target} color="red"/>
          </div>

          {view === "map" && <MapView
            filtered={filtered} selected={selected} setSelected={setSelected} addLead={addLead} leadIds={leadIds}
            query={query} setQuery={setQuery} type={type} setType={setType} voltage={voltage} setVoltage={setVoltage}
            catalogOnly={catalogOnly} setCatalogOnly={setCatalogOnly} production={production} setProduction={setProduction}
            showFilters={showFilters} setShowFilters={setShowFilters} goTo={goTo}
            scope={scope} setScope={setScope} country={country} setCountry={setCountry} countries={worldCountries}
          />}
          {view === "hti" && <HTIView onNotify={notify} onSendToTelegram={sendToTelegram}/>} 
          {view === "rag" && <RAGCatalogAnalyzer />}
          {view === "messages" && <MessagingView />}
          {view === "account" && <AccountView onSessionChange={setSession} />}
          {view === "catalog" && <CatalogView/>}
        </div>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#172d27] px-4 py-3 text-xs font-bold text-white shadow-2xl"><CheckCircle2 size={17} className="text-[#62d2a5]"/>{toast}</div>}
    </main>
  );
}

function Stat({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: typeof MapPin; color: string }) {
  const colors: Record<string, string> = { green: "bg-[#e9f4ef] text-[#21725d]", blue: "bg-[#eaf0f8] text-[#346699]", amber: "bg-[#f8f1df] text-[#9b7521]", red: "bg-[#f9eae7] text-[#b04d43]" };
  return <div className="flex items-center gap-3 rounded-2xl border border-[#e5e8eb] bg-white p-3.5 shadow-[0_2px_8px_rgba(25,35,42,.025)] md:p-4"><div className={`grid size-10 shrink-0 place-items-center rounded-xl ${colors[color]}`}><Icon size={19}/></div><div><div className="text-[20px] font-black leading-none text-[#1e2b35]">{value}</div><div className="mt-1 text-[10px] font-bold text-[#69747e] md:text-[11px]">{label}</div></div><span className="mr-auto hidden text-[9px] text-[#929aa1] sm:block">{sub}</span></div>;
}

function MapView(props: {
  filtered: Seller[]; selected: Seller; setSelected: (s: Seller) => void; addLead: (s: Seller) => void; leadIds: number[];
  query: string; setQuery: (v: string) => void; type: "all" | SellerType; setType: (v: "all" | SellerType) => void;
  voltage: "all" | "low" | "high"; setVoltage: (v: "all" | "low" | "high") => void; catalogOnly: boolean; setCatalogOnly: (v: boolean) => void;
  production: string; setProduction: (v: string) => void; showFilters: boolean; setShowFilters: (v: boolean) => void; goTo: (v: View) => void;
  scope: "iran" | "world"; setScope: (v: "iran" | "world") => void; country: string; setCountry: (v: string) => void; countries: string[];
}) {
  const { filtered, selected, setSelected, addLead, leadIds, query, setQuery, type, setType, voltage, setVoltage, catalogOnly, setCatalogOnly, production, setProduction, showFilters, setShowFilters, goTo, scope, setScope, country, setCountry, countries } = props;
  const pr = priorityOf(selected.score);
  const pi = priceInfo(selected);
  return <>
    <section className="mb-4 rounded-2xl border border-[#e3e7e9] bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="relative flex-1"><Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#89939b]" size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={scope === "world" ? "جست‌وجوی شرکت، کشور یا محصول — مثلاً Shenzhen، فن BLDC، پمپ..." : "جست‌وجوی شهر، شرکت یا محصول — مثلاً فن BLDC، درایو صنعتی..."} className="h-11 w-full rounded-xl border border-[#dde2e5] bg-[#fafbfb] pr-11 pl-4 text-xs outline-none transition focus:border-[#71a99a] focus:bg-white focus:ring-3 focus:ring-[#dceee8]"/></div>
        <div className="flex gap-2 overflow-x-auto">
          <Segment value={scope} onChange={(value) => { setScope(value as "iran" | "world"); setCountry("all"); }} options={[{v:"iran",l:"🇮🇷 ایران"},{v:"world",l:"🌍 جهانی + چین"}]}/>
          <Segment value={type} onChange={(value) => setType(value as "all" | SellerType)} options={[{v:"all",l:"همه"},{v:"household",l:"خانگی"},{v:"industrial",l:"صنعتی"}]}/>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-xs font-bold ${showFilters ? "border-[#8db4a9] bg-[#eff6f3] text-[#235f50]" : "border-[#dde2e5]"}`}><SlidersHorizontal size={16}/> فیلترها</button>
        </div>
      </div>
      {showFilters && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#edf0f1] pt-3">
        {scope === "world" && <FilterSelect value={country} onChange={setCountry} options={[{v:"all",l:`همه کشورها (${countries.length})`},...countries.map((c) => ({v:c,l:c}))]} icon="کشور"/>}
        <FilterSelect value={voltage} onChange={(v) => setVoltage(v as "all" | "low" | "high")} options={[{v:"all",l:"همه ولتاژها"},{v:"low",l:"12–48 V"},{v:"high",l:"220–380 V"}]} icon="ولتاژ"/>
        <FilterSelect value={production} onChange={setProduction} options={[{v:"all",l:"نوع فعالیت"},{v:"تولید محلی",l:"تولید محلی"},{v:"مونتاژ",l:"مونتاژ"},{v:"واردات + مونتاژ",l:"واردات + مونتاژ"}]}/>
        <button onClick={() => setCatalogOnly(!catalogOnly)} className={`h-9 rounded-lg border px-3 text-[11px] font-bold ${catalogOnly ? "border-[#79aa9d] bg-[#eaf4f0] text-[#226652]" : "border-[#e0e4e7] text-[#66717a]"}`}><FileText className="ml-1.5 inline" size={14}/> دارای کاتالوگ</button>
        <button onClick={() => { setVoltage("all"); setProduction("all"); setCatalogOnly(false); setQuery(""); setType("all"); setCountry("all"); }} className="mr-auto px-2 text-[10px] font-bold text-[#9a625b]">پاک‌کردن فیلترها</button>
      </div>}
    </section>

    <div className="grid min-h-[590px] gap-4 xl:grid-cols-[minmax(0,1fr)_355px]">
      <section className="relative min-h-[520px] overflow-hidden rounded-2xl border border-[#dce2e1] bg-[#1a232e] shadow-sm">
        <MultiMapViewer sellers={filtered} selected={selected} onSelect={setSelected}/>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white shadow-sm">
        <div className="border-b border-[#e8ebed] p-4"><div className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${selected.type === "industrial" ? "bg-[#fbe9e7] text-[#b94f45]" : selected.type === "household" ? "bg-[#e8f1f8] text-[#346c9d]" : "bg-[#eeeaf7] text-[#6d5790]"}`}>{typeLabels[selected.type]}</span><div className="flex items-center gap-1.5"><span className={`rounded-md px-2 py-1 text-[10px] font-black ${pr.cls}`}>{pr.label}</span><button className="text-[#8d969d]"><MoreHorizontal size={19}/></button></div></div><div className="mt-4 flex items-start gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf3f1] text-sm font-black text-[#245f51]">{selected.shortName}</div><div><h2 className="text-[16px] font-black text-[#1b282f]">{selected.name}</h2><p className="mt-1 flex items-center gap-1 text-[10px] text-[#7f8991]"><MapPin size={12}/>{selected.city} · {selected.zone}{selected.country ? ` · ${selected.country}` : ""}</p></div></div></div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2"><Mini label="امتیاز ممیزی" value={`${selected.score}/100`} strong/><Mini label="نوع فعالیت" value={selected.production}/><Mini label="توان" value={selected.power}/><Mini label="ولتاژ" value={selected.voltage}/></div>
          <div><div className="mb-2 text-[10px] font-bold text-[#929ba2]">محصولات اصلی</div><div className="flex flex-wrap gap-1.5">{selected.products.map((p) => <span key={p} className="rounded-md bg-[#f1f3f4] px-2 py-1 text-[10px] font-bold text-[#58636c]">{p}</span>)}</div></div>
          <div className="rounded-xl border border-[#e3e8e6] bg-[#f8faf9] p-3"><div className="mb-2 flex items-center justify-between text-[10px]"><span className="font-bold text-[#65716d]">اعتبار داده</span><span className="flex items-center gap-1 font-bold text-[#26735d]"><CheckCircle2 size={13}/> {selected.verified ? "بازبینی شده" : "نیازمند بازبینی"}</span></div><p className="text-[10px] leading-5 text-[#87908d]">منبع: {selected.source}<br/>آخرین بررسی: {selected.updated}</p></div>
          <div className="rounded-xl border border-[#e3e8e6] bg-[#f8faf9] p-3"><div className="mb-2 flex items-center justify-between text-[10px]"><span className="font-bold text-[#65716d]">تحلیل هزینه (نمونه قیمت)</span><Wallet size={14} className="text-[#34735f]"/></div><div className="flex flex-wrap gap-1.5"><span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-[#225e4f]">{pi.perWatt}</span><span className="rounded-md bg-white px-2 py-1 text-[10px] font-black text-[#225e4f]">واحد: {pi.unitEstimate}</span><span className="rounded-md bg-[#f8eedb] px-2 py-1 text-[10px] font-black text-[#a0792c]">تا {pi.savingPct}٪ صرفه</span></div><p className="mt-2 text-[9px] leading-4 text-[#87908d]">{pi.bulkNote} · سطح: {tierLabel(pi.tier)}</p></div>
          <div className="flex gap-2"><button onClick={() => addLead(selected)} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-extrabold ${leadIds.includes(selected.id) ? "bg-[#e8f3ef] text-[#226652]" : "bg-[#183f36] text-white"}`}>{leadIds.includes(selected.id) ? <><Check size={15}/> در بانک لیدها</> : <><Plus size={15}/> افزودن به لیدها</>}</button>{selected.id === 1 && <button onClick={() => goTo("hti")} className="grid size-10 place-items-center rounded-xl border border-[#dce2e0] text-[#256452]" title="نمای Snapshot"><Zap size={17}/></button>}</div>
          <div className="flex items-center justify-between border-t border-[#edf0f1] pt-3 text-[9px] text-[#959da3]"><span>فقط اطلاعات عمومی — با فروشنده تأیید شود</span><CircleHelp size={13}/></div>
        </div>
      </aside>
    </div>

    <section className="mt-4 overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#e8ebed] px-5 py-4"><div><h3 className="text-sm font-black">نتایج نزدیک به فیلتر شما</h3><p className="mt-1 text-[10px] text-[#8b949b]">مرتب‌شده بر اساس امتیاز فنی — اولویت P1/P2/P3</p></div><span className="rounded-md bg-[#f2f4f4] px-2 py-1 text-[10px] font-bold text-[#7c868d]">{filtered.length} نتیجه</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-right text-[11px]"><thead className="bg-[#fafbfb] text-[9px] font-bold text-[#90999f]"><tr><th className="px-5 py-3">شرکت</th><th>کشور / منطقه</th><th>محصول اصلی</th><th>دسته</th><th>امتیاز</th><th>نمونه قیمت</th><th>اولویت</th><th>وضعیت</th><th></th></tr></thead><tbody>{filtered.slice().sort((a,b) => b.score-a.score).slice(0,8).map((s) => { const p = priorityOf(s.score); const sp = priceInfo(s); return <tr key={s.id} onClick={() => setSelected(s)} className="cursor-pointer border-t border-[#edf0f2] transition hover:bg-[#f8faf9]"><td className="px-5 py-3.5 font-black text-[#27343d]">{s.name}</td><td className="text-[#6f7a83]">{s.country ?? "ایران"} · {s.city}</td><td className="text-[#6f7a83]">{s.products[0]}</td><td><span className="rounded-md bg-[#f0f3f4] px-2 py-1">{typeLabels[s.type]}</span></td><td><span className="font-black text-[#225e4f]">{s.score}</span><span className="text-[#afb5ba]">/100</span></td><td><span className="rounded-md bg-[#e9f4ef] px-2 py-1 font-black text-[#21725d]" dir="ltr">{sp.perWatt}</span></td><td><span className={`rounded-md px-2 py-1 font-black ${p.cls}`}>{p.label}</span></td><td>{s.catalog ? <span className="text-[#28725f]">● کاتالوگ دارد</span> : <span className="text-[#a17a38]">● در انتظار</span>}</td><td><ChevronLeft size={15} className="text-[#a6adb2]"/></td></tr>; })}</tbody></table></div>
    </section>

    <RegionalAnalysis items={filtered}/>
  </>;
}

function Segment({ value, onChange, options }: { value: string; onChange: (v:string)=>void; options: {v:string;l:string}[] }) {
  return <div className="flex h-11 shrink-0 rounded-xl border border-[#dde2e5] bg-[#f7f8f8] p-1">{options.map(o => <button key={o.v} onClick={() => onChange(o.v)} className={`rounded-lg px-3 text-[11px] font-bold transition ${value === o.v ? "bg-white text-[#215f50] shadow-sm" : "text-[#7c858c]"}`}>{o.l}</button>)}</div>;
}

function FilterSelect({ value, onChange, options, icon }: { value:string; onChange:(v:string)=>void; options:{v:string;l:string}[]; icon?:string }) {
  return <label className="relative"><select aria-label={icon ?? options[0].l} value={value} onChange={(e)=>onChange(e.target.value)} className="h-9 appearance-none rounded-lg border border-[#e0e4e7] bg-white py-0 pr-3 pl-8 text-[11px] font-bold text-[#66717a] outline-none"><>{options.map(o => <option value={o.v} key={o.v}>{o.l}</option>)}</></select><ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#899298]" size={13}/></label>;
}

function RegionalAnalysis({ items }: { items: Seller[] }) {
  if (items.length === 0) return null;
  const top = items.slice().sort((a, b) => b.powerMax - a.powerMax).slice(0, 5);
  const avgSave = Math.round(items.reduce((acc, s) => acc + priceInfo(s).savingPct, 0) / items.length);
  const byRegion: Record<string, number> = {};
  items.forEach((s) => { const k = s.country ?? "ایران"; byRegion[k] = (byRegion[k] ?? 0) + 1; });
  const topRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <section className="mt-4 rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><BarChart3 size={16}/></span>
        <h3 className="text-sm font-black">تحلیل منطقه — شرکت‌های بزرگ</h3>
        <span className="mr-auto flex flex-wrap gap-1.5">
          <span className="rounded-md bg-[#f2f4f4] px-2 py-1 text-[9px] font-bold text-[#7c868d]">{items.length} شرکت در فیلتر</span>
          <span className="rounded-md bg-[#f8eedb] px-2 py-1 text-[9px] font-black text-[#a0792c]">میانگین صرفه‌جویی عمده: {avgSave}٪</span>
          {topRegions.map(([r, n]) => <span key={r} className="rounded-md bg-[#e9f4ef] px-2 py-1 text-[9px] font-black text-[#21725d]">{r}: {n}</span>)}
        </span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {top.map((s) => {
          const sp = priceInfo(s);
          return (
            <div key={s.id} className="rounded-xl border border-[#e5e9e8] p-3">
              <div className="text-[10px] font-black text-[#27343d]">{s.name}</div>
              <div className="mt-0.5 text-[9px] text-[#8b949b]">{s.country ?? "ایران"} · {s.city} · {s.power}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded bg-[#e9f4ef] px-1.5 py-0.5 text-[8px] font-black text-[#21725d]" dir="ltr">{sp.perWatt}</span>
                <span className="rounded bg-[#f2f4f4] px-1.5 py-0.5 text-[8px] font-black text-[#58636c]" dir="ltr">{sp.unitEstimate}</span>
                <span className="rounded bg-[#f8eedb] px-1.5 py-0.5 text-[8px] font-black text-[#a0792c]">-{sp.savingPct}٪</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[9px] leading-4 text-[#899299]">تحلیل تخمینی بر اساس توان، منطقه و کلاس قیمت — نمونه قیمت است و پیش از سفارش باید با فروشنده تأیید شود.</p>
    </section>
  );
}

function Mini({ label, value, strong }: { label:string;value:string;strong?:boolean }) { return <div className="rounded-xl bg-[#f6f8f8] p-2.5"><div className="text-[9px] text-[#929ba1]">{label}</div><div className={`mt-1 text-[10px] font-black ${strong ? "text-[#21715c]" : "text-[#3e4a52]"}`}>{value}</div></div>; }

function IranMap({ sellers: data, selected, onSelect }: { sellers: Seller[]; selected: Seller; onSelect:(s:Seller)=>void }) {
  return <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.8),transparent_36%),linear-gradient(145deg,#d8e5e0,#cbdad5)]">
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="نقشه فروشندگان BLDC در ایران">
      <defs><pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="#7f9d94" strokeWidth=".12" opacity=".25"/></pattern><filter id="shadow"><feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity=".18"/></filter></defs>
      <rect width="100" height="100" fill="url(#grid)"/>
      <path d="M11 24 L20 18 29 19 35 14 43 18 49 16 57 21 68 21 75 27 85 30 89 38 84 44 89 50 85 59 88 69 81 75 74 84 62 88 54 84 44 87 37 80 29 78 25 69 17 64 18 55 12 48 15 40 9 34Z" fill="#f8faf9" stroke="#8da69e" strokeWidth=".65" filter="url(#shadow)"/>
      <path d="M23 31 Q42 39 50 57 T77 74 M39 20 Q43 42 42 63 T55 85 M15 48 Q35 52 57 49 T87 50" fill="none" stroke="#b9c9c4" strokeWidth=".35" strokeDasharray="1.2 1.2" opacity=".8"/>
      <g fill="#8fa59e" fontSize="2.1" fontFamily="sans-serif" textAnchor="middle"><text x="54" y="51">تهران</text><text x="22" y="26">تبریز</text><text x="49" y="76">اصفهان</text><text x="78" y="40">مشهد</text><text x="60" y="79">یزد</text><text x="40" y="43">قزوین</text></g>
      {data.map((seller) => {
        const color = seller.type === "industrial" ? "#d6584d" : seller.type === "household" ? "#3977a8" : "#7a61a1";
        const active = selected.id === seller.id;
        return <g key={seller.id} onClick={() => onSelect(seller)} className="cursor-pointer" role="button" aria-label={seller.name}>
          {active && <circle cx={seller.mapX} cy={seller.mapY} r="4.2" fill={color} opacity=".17"><animate attributeName="r" values="3.5;5;3.5" dur="2s" repeatCount="indefinite"/></circle>}
          <path d={`M${seller.mapX} ${seller.mapY+2.8} C${seller.mapX-3.4} ${seller.mapY-.5},${seller.mapX-2.4} ${seller.mapY-4},${seller.mapX} ${seller.mapY-4} C${seller.mapX+2.4} ${seller.mapY-4},${seller.mapX+3.4} ${seller.mapY-.5},${seller.mapX} ${seller.mapY+2.8}Z`} fill={color} stroke="white" strokeWidth={active ? ".75" : ".45"} filter="url(#shadow)"/>
          <circle cx={seller.mapX} cy={seller.mapY-1.2} r=".8" fill="white"/>
          {active && <g><rect x={seller.mapX-8} y={seller.mapY+4} width="16" height="4.4" rx="1.4" fill="#203c34"/><text x={seller.mapX} y={seller.mapY+7} fill="white" fontSize="1.8" textAnchor="middle" fontWeight="700">{seller.shortName} · {seller.city}</text></g>}
        </g>;
      })}
    </svg>
  </div>;
}

function HTIView({ onNotify, onSendToTelegram }: { onNotify:(s:string)=>void; onSendToTelegram:(p:{topic:string;title:string;details:string[]})=>void }) {
  const signals = [{l:"شفافیت مشخصات فنی",v:94},{l:"کاتالوگ و دیتاشیت",v:88},{l:"شواهد پروژه‌های صنعتی",v:76},{l:"اعتماد و استانداردها",v:82}];
  return <div className="space-y-4">
    <section className="relative overflow-hidden rounded-2xl bg-[#153e35] p-6 text-white shadow-[0_18px_40px_rgba(21,62,53,.16)] md:p-8">
      <div className="absolute -left-12 -top-20 size-64 rounded-full border-[45px] border-white/[.025]"/><div className="absolute bottom-0 left-[36%] h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"/>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center"><div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-2xl font-black">HTI</div><div className="flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#e6b85c] px-2.5 py-1 text-[9px] font-black text-[#44340e]">PRIORITY LEAD</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px]">بازبینی انسانی · امروز</span></div><h2 className="text-2xl font-black">توسعه حرکت HTI</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-white/65">راهکارهای موتور BLDC گشتاور بالا، سیم‌پیچی سفارشی و درایوهای کنترل برداری برای HVAC، پمپ، نوار نقاله و اتوماسیون صنعتی.</p></div><div className="flex gap-7 border-r border-white/10 pr-6"><div><div className="text-[9px] text-white/50">امتیاز ممیزی</div><div className="mt-1 text-3xl font-black text-[#74d3b3]">92<span className="text-sm text-white/35">/100</span></div></div><div><div className="text-[9px] text-white/50">سطح تناسب</div><div className="mt-2 text-sm font-black">بسیار بالا</div></div></div></div>
    </section>
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5"><Title icon={Factory} title="پروفایل و تمرکز محصول" tag="اطلاعات عمومی"/><div className="mt-5 grid gap-3 sm:grid-cols-3"><Feature icon={Gauge} title="توان صنعتی" text="0.75 تا 15+ کیلووات"/><Feature icon={Zap} title="کنترل پیشرفته" text="FOC · Hall · Encoder"/><Feature icon={Settings} title="سفارشی‌سازی" text="سیم‌پیچی و درایو"/></div><div className="mt-4 rounded-xl bg-[#f6f8f7] p-4 text-[11px] leading-6 text-[#5f6c68]">سیگنال کلیدی: تمرکز روشن بر کاربردهای گشتاور بالا و قابلیت مهندسی سفارشی. وجود جدول‌های فنی و تصاویر پروژه، کیفیت لید را افزایش می‌دهد؛ گواهی‌ها باید مستقیماً از شرکت استعلام شوند.</div></section>
        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5"><Title icon={Activity} title="خلاصه ممیزی زنده" tag="آخرین اجرا: ۲ ساعت پیش"/><div className="mt-5 space-y-4">{signals.map(s => <div key={s.l}><div className="mb-1.5 flex justify-between text-[10px]"><span className="font-bold text-[#53605c]">{s.l}</span><span className="font-black text-[#1d6854]">{s.v}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#edf0ef]"><div style={{width:`${s.v}%`}} className="h-full rounded-full bg-[#3e9077]"/></div></div>)}</div><button onClick={() => onNotify("ممیزی جدید در صف بررسی قرار گرفت")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce4e1] py-2.5 text-[11px] font-black text-[#276754]"><Radar size={15}/> اجرای ممیزی مجدد</button></section>
      </div>
      <div className="space-y-4">
        <section className="rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5"><Title icon={Sparkles} title="پکیج پیشنهادی" tag="پیشنهاد AI · مشورتی"/><div className="mt-5 rounded-xl border border-[#cddfd8] bg-white p-4"><div className="flex items-start justify-between"><div><div className="text-[9px] font-bold text-[#2b7b65]">بهترین تطبیق</div><h3 className="mt-1 text-base font-black">Industrial Custom + Technical Recovery</h3></div><span className="rounded-lg bg-[#e9f4ef] p-2 text-[#2a745f]"><PackageCheck size={18}/></span></div><ul className="mt-4 space-y-2 text-[10px] text-[#5f6b67]">{["بازسازی دیتاشیت‌های کاربردمحور", "تفکیک صفحات محصول بر اساس صنعت", "بسته اثبات فنی و پروژه‌های مرجع", "قیف درخواست نمونه و استعلام مهندسی"].map(x=><li className="flex items-center gap-2" key={x}><Check size={13} className="text-[#2f866d]"/>{x}</li>)}</ul></div><div className="mt-4 flex gap-2"><button onClick={() => void onSendToTelegram({ topic: "proposal_ready", title: "Industrial Custom + Technical Recovery", details: ["پکیج پیشنهادی AI", "آماده‌سازی درخواست رسمی کاتالوگ"] })} className="flex-1 rounded-xl bg-[#173f35] py-3 text-[11px] font-black text-white">آماده‌سازی درخواست رسمی</button><button className="grid size-10 place-items-center rounded-xl border border-[#dce3e0] bg-white"><Upload size={16}/></button></div></section>
        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5"><Title icon={BarChart3} title="پیشنهاد KPI"/><div className="mt-4 grid grid-cols-3 gap-2"><Mini label="پاسخ فنی" value="< 24h" strong/><Mini label="نرخ استعلام" value="+18%" strong/><Mini label="تکمیل دیتاشیت" value="95%" strong/></div></section>
      </div>
    </div>
    <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5"><Title icon={Target} title="پیش‌نمایش برنامه ۳۰ / ۶۰ / ۹۰ روزه" tag="Advisory plan"/><div className="mt-5 grid gap-3 md:grid-cols-3"><Plan day="۳۰" title="بازیابی فنی" items={["تأیید دامنه محصولات", "تکمیل دیتاشیت‌ها", "ممیزی مسیرهای تماس"]}/><Plan day="۶۰" title="آماده‌سازی بازار" items={["صفحات کاربرد صنعتی", "بسته پروژه‌های مرجع", "آزمون پیام و پیشنهاد"]}/><Plan day="۹۰" title="مقیاس و سنجش" items={["داشبورد استعلام", "شبکه توزیع منتخب", "بازبینی KPI و بهینه‌سازی"]}/></div></section>
  </div>;
}

function Title({icon:Icon,title,tag}:{icon:typeof Factory;title:string;tag?:string}) { return <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><Icon size={16}/></span><h3 className="text-sm font-black">{title}</h3>{tag&&<span className="mr-auto text-[9px] text-[#929ba1]">{tag}</span>}</div>; }
function Feature({icon:Icon,title,text}:{icon:typeof Factory;title:string;text:string}) { return <div className="rounded-xl border border-[#e5e9e8] p-3"><Icon size={17} className="mb-3 text-[#34735f]"/><div className="text-[10px] font-black">{title}</div><div className="mt-1 text-[9px] text-[#85908c]">{text}</div></div>; }
function Plan({day,title,items}:{day:string;title:string;items:string[]}) { return <div className="relative overflow-hidden rounded-xl border border-[#e3e7e6] p-4"><span className="absolute -left-2 -top-5 text-7xl font-black text-[#f1f4f3]">{day}</span><div className="relative"><span className="text-[9px] font-black text-[#2c7a65]">روز ۰ تا {day}</span><h4 className="mt-1 text-sm font-black">{title}</h4><ul className="mt-3 space-y-2 text-[10px] text-[#66736e]">{items.map(i=><li key={i} className="flex gap-2"><span className="mt-1 size-1 rounded-full bg-[#4d927d]"/>{i}</li>)}</ul></div></div>; }

function CatalogView() {
  const instagramUrl = "https://www.instagram.com/yasinrou/";
  const telegramUrl = "https://t.me/Pars_sell_bot";

  return <div className="space-y-4">
    <section className="relative overflow-hidden rounded-3xl bg-[#153e35] p-6 text-white shadow-[0_18px_45px_rgba(21,62,53,.16)] md:p-8">
      <div className="absolute -left-14 -top-20 size-64 rounded-full border-[44px] border-white/[.025]"/>
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10"><FileText size={26}/></div>
        <div className="flex-1"><div className="mb-2 text-[9px] font-black tracking-[.16em] text-[#8dd0b9]">BLDC MAP SIGNAL · CATALOG 2026</div><h2 className="text-xl font-black md:text-2xl">کاتالوگ موتورهای BLDC خانگی و صنعتی</h2><p className="mt-2 max-w-2xl text-[10px] leading-5 text-white/60">ترکیب مشخصات عمومی پین‌های بازبینی‌شده، کاربردها و مسیر ارتباطی HTI. قیمت، موجودی و مشخصات نهایی باید مستقیماً تأیید شوند.</p></div>
        <div className="flex gap-2 text-[9px]"><span className="rounded-lg bg-white/10 px-3 py-2 font-bold">{catalogRows.length} مدل</span><span className="rounded-lg bg-[#68c5a5]/15 px-3 py-2 font-bold text-[#8ed7bd]">نسخه HTML آماده</span></div>
      </div>
    </section>

    <div className="grid gap-4 md:grid-cols-2"><CatalogSummary icon={Home} title="Household BLDC" subtitle="خانگی · کم‌مصرف و کم‌نویز" stats="20–750 W · 12–48 V" color="blue" items="فن، پمپ کوچک، لوازم خانگی، حمل‌ونقل سبک"/><CatalogSummary icon={Factory} title="Industrial BLDC" subtitle="صنعتی · گشتاور و دوام بالا" stats="0.5–15+ kW · 220–380 V" color="red" items="HVAC، پمپ، نوار نقاله، رباتیک و اتوماسیون"/></div>

    <section className="relative overflow-hidden rounded-2xl border border-[#efd5df] bg-gradient-to-l from-white via-white to-[#fceef3] p-5 shadow-sm">
      <div className="absolute -left-6 -top-14 size-36 rounded-full bg-[#e13b75]/5"/>
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#e1306c] to-[#f77737] text-white shadow-[0_8px_20px_rgba(225,48,108,.22)]"><AtSign size={23}/></div>
        <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black">صفحه ارتباط و کاتالوگ HTI</h3><span className="rounded-full bg-[#edf6f2] px-2 py-1 text-[8px] font-black text-[#26715c]">لینک اعلام‌شده</span></div><p className="mt-1 text-[10px] leading-5 text-[#7c858d]">برای معرفی محصولات، ارتباط نمایشگاهی و پیگیری نسخه‌های کاتالوگ از پروفایل عمومی زیر استفاده کنید.</p><div className="mt-2 text-xs font-black text-[#ba315f]" dir="ltr">@yasinrou</div></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d9346f] px-4 py-3 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(217,52,111,.18)]"><ExternalLink size={15}/> باز کردن Instagram</a>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f94c9] px-4 py-3 text-[11px] font-black text-white shadow-[0_8px_18px_rgba(31,148,201,.18)]"><Send size={15}/> تلگرام</a>
        </div>
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-[#e1e5e7] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e7eaec] px-5 py-4"><div><h3 className="text-sm font-black">جدول مشخصات تجمیع‌شده</h3><p className="mt-1 text-[9px] text-[#929aa1]">Public information only — verify with seller</p></div><ListFilter size={18} className="text-[#68747c]"/></div><div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-right text-[10px]"><thead className="bg-[#f8faf9] text-[9px] text-[#818c92]"><tr>{["مدل","توان","ولتاژ","محدوده RPM","گشتاور","کاربرد","استفاده متداول","منبع عمومی","یادداشت"].map(h=><th className="px-4 py-3 font-bold" key={h}>{h}</th>)}</tr></thead><tbody>{catalogRows.map((r)=><tr className="border-t border-[#ebeeef] hover:bg-[#fafcfb]" key={r.model}><td className="px-4 py-4 font-black text-[#24343c]">{r.model}</td><td>{r.power}</td><td>{r.voltage}</td><td>{r.rpm}</td><td>{r.torque}</td><td><span className={`rounded-md px-2 py-1 font-bold ${r.app === "صنعتی" ? "bg-[#f9eae8] text-[#a7473f]" : "bg-[#e8f1f8] text-[#326b99]"}`}>{r.app}</span></td><td>{r.use}</td><td className="font-bold text-[#316e5c]">{r.source}</td><td className="text-[#7f898f]">{r.notes}</td></tr>)}</tbody></table></div><div className="flex flex-col gap-2 border-t border-[#e7eaec] bg-[#fafbfb] px-5 py-3 text-[9px] text-[#899299] sm:flex-row sm:items-center"><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#2f7863]"/> مشخصات قبل از سفارش باید با کاتالوگ رسمی و فروشنده تطبیق داده شوند.</span><span className="sm:mr-auto flex items-center gap-3 font-bold"><a className="text-[#bd3564]" href={instagramUrl} target="_blank" rel="noopener noreferrer" dir="ltr">Instagram: @yasinrou</a><a className="text-[#1f8fc0]" href={telegramUrl} target="_blank" rel="noopener noreferrer" dir="ltr">Telegram: @Pars_sell_bot</a></span></div></section>
  </div>;
}
function CatalogSummary({icon:Icon,title,subtitle,stats,color,items}:{icon:typeof Home;title:string;subtitle:string;stats:string;color:string;items:string}) { const blue=color==="blue"; return <div className="rounded-2xl border border-[#e1e5e7] bg-white p-5"><div className="flex"><span className={`grid size-10 place-items-center rounded-xl ${blue?"bg-[#e9f1f7] text-[#376d98]":"bg-[#f8eae8] text-[#ad4b43]"}`}><Icon size={19}/></span><div className="mr-3"><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-[9px] text-[#899299]">{subtitle}</p></div><span className="mr-auto self-start rounded-md bg-[#f2f4f4] px-2 py-1 text-[9px] font-bold">{stats}</span></div><p className="mt-4 border-t border-[#edf0f1] pt-3 text-[10px] leading-5 text-[#68747c]">{items}</p></div>; }
