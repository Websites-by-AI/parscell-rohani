"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, LogIn, Phone, Radar, ShieldCheck, UserPlus } from "lucide-react";
import { demoAccounts, roleLabels } from "@/data/accounts";
import { getRegisteredUsers, login } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const registered = typeof window === "undefined" ? [] : getRegisteredUsers();

  function doLogin(p: string, w: string) {
    setBusy(true);
    setError("");
    const result = login(p, w);
    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bldc_leads", JSON.stringify([1, 7]));
    }
    router.push("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f8] p-4 text-[#182230]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-[#153e35] text-white shadow-[0_6px_16px_rgba(21,62,53,.22)]"><Radar size={24}/></div>
          <div><div className="text-[15px] font-black tracking-tight">BLDC Map Signal</div><div className="mt-0.5 text-[10px] font-bold tracking-[.12em] text-[#88928f]">MOTORLEAD OS · ورود</div></div>
        </div>

        <section className="rounded-2xl border border-[#e1e5e7] bg-white p-6 shadow-sm">
          <h1 className="text-lg font-black">ورود به حساب کاربری</h1>
          <p className="mt-1.5 text-[10px] leading-5 text-[#7c858d]">دسترسی به ماژول‌ها (نقشه، کاتالوگ، RAG، پیام‌رسانی و حساب) نیازمند ورود است. با شماره موبایل وارد شوید — رمز همه حساب‌های دمو <b dir="ltr">demo123</b> است.</p>

          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><Phone size={12}/> شماره موبایل</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121111111" dir="ltr" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-left text-xs outline-none transition focus:border-[#71a99a] focus:ring-3 focus:ring-[#dceee8]"/>
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#6b767e]"><KeyRound size={12}/> رمز عبور</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" dir="ltr" className="h-11 w-full rounded-xl border border-[#dde2e5] px-3 text-left text-xs outline-none transition focus:border-[#71a99a] focus:ring-3 focus:ring-[#dceee8]"/>
            </label>
            <button onClick={() => doLogin(phone, password)} disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#183f36] text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(24,63,54,.2)] disabled:opacity-50"><LogIn size={16}/>{busy ? "در حال ورود..." : "ورود"}</button>
            {error && <p className="rounded-lg bg-[#fbeceb] px-3 py-2 text-[10px] font-bold text-[#b05248]">{error}</p>}
            <a href="/register" className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dce4e1] py-2.5 text-[11px] font-black text-[#276754]"><UserPlus size={15}/> ثبت‌نام نکرده‌اید؟ حساب بسازید</a>
          </div>
        </section>

        {registered.length > 0 && (
          <section className="mt-4 rounded-2xl border border-[#dce5e1] bg-[#f7faf8] p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-black text-[#2b6a59]"><CheckCircle2 size={15}/> حساب‌های ثبت‌شده در این مرورگر</div>
            <div className="space-y-2">
              {registered.map((a) => (
                <button key={a.id} onClick={() => doLogin(a.phone, a.password)} disabled={busy} className="flex w-full items-center gap-3 rounded-xl border border-[#d3e4dd] bg-white px-3 py-2.5 text-right transition hover:bg-[#f2f8f5]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e9f2ee] text-[10px] font-black text-[#256452]">{a.name.slice(0, 2)}</span>
                  <span className="flex-1"><span className="block text-[11px] font-black text-[#26333d]">{a.name}</span><span className="mt-0.5 block text-[9px] text-[#8b949b]">{roleLabels[a.role]}{a.company ? ` · ${a.company}` : ""}</span></span>
                  <span dir="ltr" className="text-[9px] font-bold text-[#9aa2a8]">{a.phone}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 rounded-2xl border border-[#e1e5e7] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-black text-[#2b6a59]"><ShieldCheck size={15}/> ورود سریع با حساب‌های دمو</div>
          <div className="space-y-2">
            {demoAccounts.map((a) => (
              <button key={a.id} onClick={() => doLogin(a.phone, a.password)} disabled={busy} className="flex w-full items-center gap-3 rounded-xl border border-[#e3e7e6] bg-[#fafbfb] px-3 py-2.5 text-right transition hover:border-[#b9d3cb] hover:bg-[#f2f8f5]">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e9f2ee] text-[10px] font-black text-[#256452]">{roleLabels[a.role].slice(0, 2)}</span>
                <span className="flex-1"><span className="block text-[11px] font-black text-[#26333d]">{a.name}</span><span className="mt-0.5 block text-[9px] text-[#8b949b]">{roleLabels[a.role]}{a.company ? ` · ${a.company}` : ""}</span></span>
                <span dir="ltr" className="text-[9px] font-bold text-[#9aa2a8]">{a.phone}</span>
              </button>
            ))}
          </div>
        </section>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[9px] text-[#9aa2a8]"><CheckCircle2 size={12}/> دموی عمومی — هیچ داده واقعی کاربر یا رمز عبور واقعی ذخیره نمی‌شود.</p>
      </div>
    </main>
  );
}
