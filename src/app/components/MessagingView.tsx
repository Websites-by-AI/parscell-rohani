"use client";

import { useEffect, useState } from "react";
import {
  Bell, Bot, Check, CheckCircle2, Mail, MessageCircle, MessageSquareText,
  Phone, Send, ShieldCheck, Sparkles, X,
} from "lucide-react";

type TelegramStatus = {
  ok: boolean;
  configured: boolean;
  bot?: string | null;
  chatId?: string | null;
};

type BaleStatus = {
  ok: boolean;
  configured: boolean;
  bot?: string | null;
  link?: string | null;
  chatId?: string | null;
};

type Channel = "telegram" | "bale";

const channels = [
  { id: "telegram", label: "تلگرام", desc: "@Pars_sell_bot", link: "https://t.me/Pars_sell_bot", icon: Send, status: "فعال", cls: "border-[#cfe3f1] bg-[#f2f9fd] text-[#1e7ea8]", chip: "bg-[#dceef7] text-[#17688f]" },
  { id: "bale", label: "بله (Bale)", desc: "@power_sell_bot", link: "https://ble.ir/power_sell_bot", icon: MessageCircle, status: "فعال", cls: "border-[#c8ecd7] bg-[#eefaf3] text-[#0d8a5b]", chip: "bg-[#d9f2e5] text-[#0d7a50]" },
  { id: "whatsapp", label: "واتساپ", desc: "Cloud API — به‌زودی", icon: Phone, status: "به‌زودی", cls: "border-[#e5e9e8] bg-white text-[#6b767e]", chip: "bg-[#f2f4f4] text-[#8a939a]" },
  { id: "email", label: "ایمیل", desc: "ارسال رسمی — به‌زودی", icon: Mail, status: "به‌زودی", cls: "border-[#e5e9e8] bg-white text-[#6b767e]", chip: "bg-[#f2f4f4] text-[#8a939a]" },
  { id: "sms", label: "پیامک", desc: "درگاه ایرانی — به‌زودی", icon: Bell, status: "به‌زودی", cls: "border-[#e5e9e8] bg-white text-[#6b767e]", chip: "bg-[#f2f4f4] text-[#8a939a]" },
];

const topics = [
  { v: "lead_added", l: "🆕 لید جدید به بانک اضافه شد" },
  { v: "proposal_ready", l: "📄 پروپوزال آماده برای پیام‌رسانی" },
  { v: "test", l: "📬 پیام آزمایشی" },
];

const CHANNEL_LABEL: Record<Channel, string> = { telegram: "تلگرام", bale: "بله" };

export default function MessagingView() {
  const [tg, setTg] = useState<TelegramStatus | null>(null);
  const [bale, setBale] = useState<BaleStatus | null>(null);
  const [channel, setChannel] = useState<Channel>("telegram");
  const [topic, setTopic] = useState("lead_added");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [approve, setApprove] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/telegram")
      .then((r) => r.json())
      .then((d) => setTg(d as TelegramStatus))
      .catch(() => setTg({ ok: false, configured: false }));
    fetch("/api/bale")
      .then((r) => r.json())
      .then((d) => setBale(d as BaleStatus))
      .catch(() => setBale({ ok: false, configured: false }));
  }, []);

  async function send() {
    if (!approve) {
      setResult({ ok: false, text: "ابتدا تأیید انسانی را علامت بزنید." });
      return;
    }
    setSending(true);
    setResult(null);
    const endpoint = channel === "telegram" ? "/api/telegram" : "/api/bale";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          title: title || "پیام از داشبورد BLDC Map Signal",
          details: details.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5),
          dryRun,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; dryRun?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "خطای ناشناخته");
      setResult({
        ok: true,
        text: data.dryRun
          ? "Dry Run موفق بود — پیامی ارسال نشد (حالت آزمایشی)."
          : `پیام با موفقیت از طریق ${CHANNEL_LABEL[channel]} ارسال شد 📨`,
      });
      setTitle("");
      setDetails("");
    } catch (error) {
      setResult({ ok: false, text: `ارسال ناموفق بود: ${error instanceof Error ? error.message : "خطا"}` });
    } finally {
      setSending(false);
    }
  }

  const activeBots = [
    { channel: "telegram" as Channel, status: tg, bot: "Pars_sell_bot", link: "https://t.me/Pars_sell_bot", color: "text-[#1e7ea8]", bg: "bg-[#e8f2fb]" },
    { channel: "bale" as Channel, status: bale, bot: "power_sell_bot", link: "https://ble.ir/power_sell_bot", color: "text-[#0d8a5b]", bg: "bg-[#e6f7ef]" },
  ];

  return (
    <div className="space-y-4">
      {/* Channel cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {channels.map((c) => (
          <a key={c.id} href={c.link ?? undefined} target={c.link ? "_blank" : undefined} rel="noopener noreferrer" className={`rounded-2xl border p-4 transition ${c.link ? "hover:-translate-y-0.5 hover:shadow-md" : ""} ${c.cls}`}>
            <div className="flex items-center justify-between">
              <c.icon size={19} />
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${c.chip}`}>{c.status}</span>
            </div>
            <div className="mt-3 text-sm font-black">{c.label}</div>
            <div className="mt-1 text-[9px] opacity-80" dir="ltr">{c.desc}</div>
          </a>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Composer */}
        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><MessageSquareText size={16}/></span>
            <h3 className="text-sm font-black">ارسال اعلان چندکاناله</h3>
            <span className="mr-auto text-[9px] text-[#929ba1]">تأیید انسانی + Dry Run</span>
          </div>

          {/* Channel selector */}
          <div className="mt-5">
            <span className="mb-1.5 block text-[10px] font-bold text-[#6b767e]">کانال ارسال</span>
            <div className="grid grid-cols-2 gap-2">
              {(["telegram", "bale"] as Channel[]).map((ch) => (
                <button key={ch} onClick={() => setChannel(ch)} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition ${channel === ch ? "border-[#79aa9d] bg-[#eaf4f0]" : "border-[#e0e4e7] bg-white hover:border-[#b9d3cb]"}`}>
                  {ch === "telegram" ? <Send size={16} className="text-[#1e7ea8]"/> : <MessageCircle size={16} className="text-[#0d8a5b]"/>}
                  <span className="flex-1 text-right">
                    <span className="block text-[11px] font-black text-[#26333d]">{CHANNEL_LABEL[ch]}</span>
                    <span className="block text-[9px] text-[#8b949b]" dir="ltr">{ch === "telegram" ? "@Pars_sell_bot" : "@power_sell_bot"}</span>
                  </span>
                  {channel === ch && <CheckCircle2 size={16} className="text-[#2f866d]"/>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#6b767e]">نوع اعلان</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="h-10 w-full rounded-lg border border-[#dfe4e7] bg-white px-3 text-[11px] font-bold outline-none focus:border-[#71a99a]">
                {topics.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-[#6b767e]">عنوان</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً: توسعه حرکت HTI — تهران" className="h-10 w-full rounded-lg border border-[#dfe4e7] px-3 text-[11px] outline-none focus:border-[#71a99a]"/>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-[10px] font-bold text-[#6b767e]">جزئیات (هر خط یک مورد — حداکثر ۵)</span>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder={"شهرک صنعتی شمس‌آباد\nمحصول اصلی: درایو FOC\nامتیاز: 92/100"} className="w-full rounded-lg border border-[#dfe4e7] px-3 py-2 text-[11px] leading-6 outline-none focus:border-[#71a99a]"/>
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-[10px] font-bold text-[#5f6a73]"><input type="checkbox" checked={approve} onChange={(e) => setApprove(e.target.checked)} className="size-4 accent-[#1c6b57]"/> تأیید انسانی قبل از ارسال (الزامی)</label>
            <label className="flex items-center gap-2 text-[10px] font-bold text-[#8a7443]"><input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="size-4 accent-[#a1792c]"/> حالت Dry Run — بدون ارسال واقعی</label>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => void send()} disabled={sending} className={`inline-flex h-11 items-center gap-2 rounded-xl px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)] disabled:opacity-50 ${channel === "bale" ? "bg-[#0d8a5b]" : "bg-[#183f36]"}`}>
              {channel === "bale" ? <MessageCircle size={16}/> : <Send size={16}/>}
              {sending ? "در حال ارسال..." : `ارسال به ${CHANNEL_LABEL[channel]}`}
            </button>
            {result && <span className={`flex items-center gap-1.5 text-[10px] font-bold ${result.ok ? "text-[#26735d]" : "text-[#b05248]"}`}>{result.ok ? <CheckCircle2 size={14}/> : <X size={14}/>}{result.text}</span>}
          </div>
        </section>

        {/* Bot status + compliance */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><Bot size={16}/></span><h3 className="text-sm font-black">وضعیت ربات‌ها</h3></div>
            <div className="mt-4 space-y-2">
              {activeBots.map((b) => (
                <div key={b.channel} className="rounded-xl border border-[#e3e9e6] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-[#26333d]">{b.channel === "telegram" ? <Send size={13} className="text-[#1e7ea8]"/> : <MessageCircle size={13} className="text-[#0d8a5b]"/>} {CHANNEL_LABEL[b.channel]}</span>
                    <b className={b.status?.configured ? "text-[#26735d]" : "text-[#a17a38]"}>{b.status?.configured ? "● متصل" : "○ در انتظار شروع"}</b>
                  </div>
                  <div className="mt-1.5 flex justify-between text-[9px] text-[#8b949b]"><span dir="ltr">@{b.bot}</span><span dir="ltr">{b.status?.chatId ?? "chat —"}</span></div>
                  <a href={b.link} target="_blank" rel="noopener noreferrer" className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black text-white ${b.channel === "telegram" ? "bg-[#1f94c9]" : "bg-[#0d8a5b]"}`}>
                    {b.channel === "telegram" ? <Send size={12}/> : <MessageCircle size={12}/>} باز کردن ربات
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-[#dce8e3] bg-white p-3 text-[9px] leading-5 text-[#74807c]" dir="ltr">
              /start · /help · /map · /catalog · /leads · /register · /users · /clinic · /migration
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#ebf3f0] text-[#286854]"><ShieldCheck size={16}/></span><h3 className="text-sm font-black">انطباق و کنترل</h3></div>
            <ul className="mt-4 space-y-2.5 text-[10px] leading-5 text-[#5f6b67]">
              <li className="flex items-center gap-2"><Check size={13} className="shrink-0 text-[#2f866d]"/> تأیید انسانی قبل از هر ارسال</li>
              <li className="flex items-center gap-2"><Check size={13} className="shrink-0 text-[#2f866d]"/> فهرست عدم تماس و امکان انصراف (خروج)</li>
              <li className="flex items-center gap-2"><Check size={13} className="shrink-0 text-[#2f866d]"/> کلیدها فقط در سرور نگهداری می‌شوند</li>
              <li className="flex items-center gap-2"><Check size={13} className="shrink-0 text-[#2f866d]"/> حالت Dry Run برای تست امن</li>
              <li className="flex items-center gap-2"><Sparkles size={13} className="shrink-0 text-[#2f866d]"/> بدون ادعای تضمین — فقط اطلاعات عمومی</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
