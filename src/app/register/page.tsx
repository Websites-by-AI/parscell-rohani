"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, KeyRound, Megaphone, Phone, Radar, Send, ShoppingCart, Store, User, UserPlus, X } from "lucide-react";
import { roleLabels, type Role } from "@/data/accounts";
import { registerUser } from "@/lib/session";

const ROLE_OPTIONS: { id: Role; icon: typeof Store; desc: string }[] = [
  { id: "buyer", icon: ShoppingCart, desc: "خریدار تجهیزات و قطعات" },
  { id: "seller", icon: Store, desc: "فروشنده یا سازنده BLDC" },
  { id: "marketer", icon: Megaphone, desc: "بازاریاب معرف — کمیسیون" },
  { id: "customer", icon: Building2, desc: "مشتری پروژه (HVAC، پمپ، تهویه)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function submit() {
    setBusy(true);
    setError("");
    const result = registerUser({ name, phone, password, role, company, city });
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    // Notify the server-side demo registry too (best effort).
    void fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password, role, company, city }),
    }).catch(() => { /* demo */ });
    router.push("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f8] p-4 text-[#182230]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-[#153e35] text-white shadow-[0_6px_16px_rgba(21,62,53,.22)]"><Radar size={24}/></div>
          <div><div className="text-[15px] font-black tracking-tight">BLDC Map Signal</div><div className="mt-0.5 text-[10px] font-bold tracking-[.12em] text-[#88928f]">ثبت‌نام کاربر جدید</div></div>
        </div>

        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-6 shadow-sm">
          <h1 className="flex items-center gap-2 text-lg font-black"><UserPlus size={19} className="text-[#256452]"/> ثبت‌نام با شماره موبایل</h1>
          <p className="mt-1.5 text-[10px] leading-5 text-[#7c858d]">پس از ثبت‌نام، داشبورد نقش‌محور شما فعال می‌شود. نسخه دمو — اطلاعات فقط در همین مرورگر ذخیره می‌شود.</p>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {ROLE_OPTIONS.map((r) => (
                <button key={r.id} onClick={() => setRole(r.id)} className={`rounded-xl border p-2.5 text-center transition ${role === r.id ? "border-[#79aa9d] bg-[#eaf4f0]" : "border-[#e0e4e7] bg-white hover:border-[#b9d3cb]"}`}>
                  <r.icon size={15} className={`mx-auto ${role === r.id ? "text-[#21725d]" : "text-[#8b949b]"}`}/>
                  <div className="mt-1.5 text-[10px] font-black">{roleLabels[r.id].split(" ")[0]}</div>
                  <div className="mt-0.5 text-[8px] text-[#9aa2a8]">{r.desc}</div>
                </button>
              ))}
            </div>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><User size={12}/> نام و نام خانوادگی</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: علی محمدی" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-xs outline-none transition focus:border-[#71a99a] focus:ring-3 focus:ring-[#dceee8]"/>
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><Phone size={12}/> شماره موبایل</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121111111" dir="ltr" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-left text-xs outline-none transition focus:border-[#71a99a] focus:ring-3 focus:ring-[#dceee8]"/>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><Building2 size={12}/> شرکت (اختیاری)</span>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="نام شرکت" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-xs outline-none transition focus:border-[#71a99a]"/>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold text-[#6b767e]">شهر (اختیاری)</span>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="تهران" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-xs outline-none transition focus:border-[#71a99a]"/>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><KeyRound size={12}/> رمز عبور (حداقل ۶ کاراکتر)</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-left text-xs outline-none transition focus:border-[#71a99a] focus:ring-3 focus:ring-[#dceee8]"/>
            </label>

            <button onClick={submit} disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#183f36] text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)] disabled:opacity-50"><UserPlus size={16}/>{busy ? "در حال ثبت..." : "ثبت‌نام و ورود"}</button>
            {error && <p className="flex items-center gap-1.5 rounded-lg bg-[#fbeceb] px-3 py-2 text-[10px] font-bold text-[#b05248]"><X size={13}/>{error}</p>}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#e1e5e7] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#6b767e]">قبلاً ثبت‌نام کرده‌اید؟ <a href="/login" className="font-black text-[#256452]">وارد شوید ←</a></p>
            <a href="https://t.me/Pars_sell_bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-black text-[#1e7ea8]"><Send size={13}/> ثبت‌نام در تلگرام</a>
          </div>
        </section>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[9px] text-[#9aa2a8]"><CheckCircle2 size={12}/> دموی عمومی — رمز عبور واقعی ذخیره نمی‌شود؛ نسخه نهایی روی دیتابیس D1 با هش رمز است.</p>
      </div>
    </main>
  );
}
