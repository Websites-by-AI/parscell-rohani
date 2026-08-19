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
  channels?: { id: string; label: string; status: string }[];
};

const channels = [
  { id: "telegram", label: "تلگرام", desc: "@Pars_sell_bot", icon: Send, status: "فعال", cls: "border-[#cfe3f1] bg-[#f2f9fd] text-[#1e7ea8]" },
  { id: "whatsapp", label: "واتساپ", desc: "Cloud API — به‌زودی", icon: MessageCircle, status: "به‌زودی", cls: "border-[#d9ecdc] bg-[#f4faf4] text-[#2d8a4e]" },
  { id: "email", label: "ایمیل", desc: "ارسال رسمی — به‌زودی", icon: Mail, status: "به‌زودی", cls: "border-[#eee5d2] bg-[#fbf7ee] text-[#9a7521]" },
  { id: "sms", label: "پیامک", desc: "درگاه ایرانی — به‌زودی", icon: Phone, status: "به‌زودی", cls: "border-[#e8e0f1] bg-[#f8f4fb] text-[#7a579b]" },
  { id: "iranian", label: "بله / روبیکا / ایتا", desc: "پل API ایرانی — به‌زودی", icon: Bell, status: "به‌زودی", cls: "border-[#f6e0df] bg-[#fdf5f4] text-[#b05248]" },
];

const topics = [
  { v: "lead_added", l: "🆕 لید جدید به بانک اضافه شد" },
  { v: "proposal_ready", l: "📄 پروپوزال آماده برای پیام‌رسانی" },
  { v: "test", l: "📬 پیام آزمایشی" },
];

export default function MessagingView() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
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
      .then((d) => setStatus(d as TelegramStatus))
      .catch(() => setStatus({ ok: false, configured: false }));
  }, []);

  async function send() {
    if (!approve) {
      setResult({ ok: false, text: "ابتدا تأیید انسانی را علامت بزنید." });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/telegram", {
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
        text: data.dryRun ? "Dry Run موفق بود — پیامی ارسال نشد (حالت آزمایشی)." : "پیام با موفقیت از طریق تلگرام ارسال شد 📨",
      });
      setTitle("");
      setDetails("");
    } catch (error) {
      setResult({ ok: false, text: `ارسال ناموفق بود: ${error instanceof Error ? error.message : "خطا"}` });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Channels grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {channels.map((c) => (
          <div key={c.id} className={`rounded-2xl border p-4 ${c.cls}`}>
            <div className="flex items-center justify-between">
              <c.icon size={19} />
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${c.id === "telegram" ? "bg-[#dceef7] text-[#17688f]" : "bg-white/70 text-[#8a939a]"}`}>{c.status}</span>
            </div>
            <div className="mt-3 text-sm font-black">{c.label}</div>
            <div className="mt-1 text-[9px] opacity-80">{c.desc}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* Composer */}
        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
          <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><MessageSquareText size={16}/></span><h3 className="text-sm font-black">ارسال اعلان از طریق ربات تلگرام</h3><span className="mr-auto text-[9px] text-[#929ba1]">Pars_sell_bot</span></div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
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
            <button onClick={() => void send()} disabled={sending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#183f36] px-6 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)] disabled:opacity-50"><Send size={16}/>{sending ? "در حال ارسال..." : "ارسال به تلگرام"}</button>
            {result && <span className={`flex items-center gap-1.5 text-[10px] font-bold ${result.ok ? "text-[#26735d]" : "text-[#b05248]"}`}>{result.ok ? <CheckCircle2 size={14}/> : <X size={14}/>}{result.text}</span>}
          </div>
        </section>

        {/* Bot status + compliance */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5">
            <div className="flex items-center"><span className="ml-2 grid size-8 place-items-center rounded-lg bg-[#e8f2fb] text-[#1f7ba6]"><Bot size={16}/></span><h3 className="text-sm font-black">وضعیت ربات</h3></div>
            <div className="mt-4 space-y-2 text-[10px] text-[#5f6b67]">
              <div className="flex justify-between"><span>ربات</span><b>{status?.bot ?? "—"}</b></div>
              <div className="flex justify-between"><span>اتصال</span><b className={status?.configured ? "text-[#26735d]" : "text-[#a17a38]"}>{status?.configured ? "● متصل" : "○ پیکربندی نشده"}</b></div>
              <div className="flex justify-between"><span>مقصد اعلان‌ها</span><b dir="ltr">{status?.chatId ?? "—"}</b></div>
              <div className="flex justify-between"><span>وب‌هوک فرمان‌ها</span><b>فعال</b></div>
            </div>
            <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f94c9] py-2.5 text-[11px] font-black text-white"><Send size={14}/> باز کردن @Pars_sell_bot</a>
            <div className="mt-3 rounded-lg border border-[#dce8e3] bg-white p-3 text-[9px] leading-5 text-[#74807c]" dir="ltr">
              /start · /help · /map · /catalog · /leads · /rag · /contact
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
