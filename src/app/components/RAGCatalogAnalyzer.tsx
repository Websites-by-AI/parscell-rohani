"use client";

import { useState } from "react";
import {
  Bot, Check, CheckCircle2, ChevronRight, Cpu, Download, ExternalLink, FileText,
  Filter, Gauge, Globe, Layers, ListFilter, MapPin, MessageSquare, Plus, Radar,
  Search, ShieldCheck, Sparkles, Zap, ArrowLeftRight, RefreshCw, BookOpen
} from "lucide-react";

export type CatalogKnowledgeSource = {
  id: string;
  title: string;
  company: string;
  url: string;
  type: "PDF Catalog" | "Datasheet" | "Site Audit";
  year: string;
  chunksCount: number;
  featuredSpecs: {
    powerRange: string;
    voltage: string;
    efficiency: string;
    controlType: string;
    protection: string;
    primaryApp: string;
  };
};

export const knowledgeSources: CatalogKnowledgeSource[] = [
  {
    id: "nian-motor",
    title: "Nian-Motor-Catalog.pdf",
    company: "نیان موتور (Nian Motor)",
    url: "https://nianmotor.ir/wp-content/uploads/2025/08/Nian-Motor-Catalog.pdf",
    type: "PDF Catalog",
    year: "2025/2026",
    chunksCount: 18,
    featuredSpecs: {
      powerRange: "150W – 1.5 kW",
      voltage: "180–265 VAC (ورودی اینورتر) / 48VDC",
      efficiency: "85% تا 92% (سطح IE4/IE5)",
      controlType: "Sensorless Vector FOC Integrated",
      protection: "IP54 / IP55 Thermal & Overvoltage",
      primaryApp: "کولر آبی کم‌مصرف BLDC، تهویه صنعتی و HVAC",
    },
  },
  {
    id: "hti-drive",
    title: "HTI-HighTorque-Datasheet.pdf",
    company: "توسعه حرکت HTI",
    url: "https://hti-motors.example/catalog.pdf",
    type: "Datasheet",
    year: "2026",
    chunksCount: 14,
    featuredSpecs: {
      powerRange: "0.75 kW – 15 kW",
      voltage: "220V / 380V Three-Phase",
      efficiency: "88% تا 94%",
      controlType: "Hall Effect + Encoder + FOC Drive",
      protection: "IP54 Heavy Industrial",
      primaryApp: "نوار نقاله، اتوماسیون، ماشین‌ابزار و پمپ",
    },
  },
  {
    id: "motogen-bldc",
    title: "Motogen-HighEff-Inverter-Draft.pdf",
    company: "موتوژن تبریز",
    url: "https://motogen.example/bldc-draft.pdf",
    type: "Datasheet",
    year: "2025",
    chunksCount: 11,
    featuredSpecs: {
      powerRange: "0.37 kW – 7.5 kW",
      voltage: "220V Single-Phase / 380V",
      efficiency: "84% تا 90%",
      controlType: "External Inverter / VFD Compatible",
      protection: "IP55 Cast Iron Housing",
      primaryApp: "پمپ خورشیدی، تهویه مطبوع، صنایع عمومی",
    },
  },
];

export const precalculatedChunks = [
  {
    id: "c1",
    sourceId: "nian-motor",
    section: "مشخصات فنی کولری و تهویه BLDC (صفحه ۴ کاتالوگ)",
    content: "موتورهای سری NIAN-BLDC با درایور اینورتر داخلی (Integrated Drive) برای جایگزینی مستقیم موتورهای AC کولری طراحی شده‌اند. ورودی ۲۲۰ ولت برق شهری را دریافت کرده و با تکنولوژی کنترل برداری FOC راندمان را تا ۸۸٪ افزایش می‌دهد. مصرف برق تا ۸۰٪ نسبت به موتورهای القایی قدیمی کاهش می‌یابد.",
    tags: ["راندمان", "اینورتر داخلی", "FOC", "کولر آبی"],
    similarity: 0.96,
  },
  {
    id: "c2",
    sourceId: "nian-motor",
    section: "حفاظت‌ها و شرایط محیطی (صفحه ۷ کاتالوگ)",
    content: "درجه حفاظت IP54 با سیم‌پیچی عایق رزینی و پوسته آلومینیومی دایکاست. مجهز به سیستم‌های حفاظتی نرم‌افزاری شامل: ولتاژ بالا/پایین (Over/Under Voltage)، بیش‌جریان (Overcurrent)، حفاظت حرارتی استاتور و راه‌اندازی نرم (Soft Start) جهت کاهش ضربه مکانیکی.",
    tags: ["IP54", "حفاظت حرارتی", "Soft Start", "پوسته آلومینیوم"],
    similarity: 0.92,
  },
  {
    id: "c3",
    sourceId: "hti-drive",
    section: "مشخصات گشتاور و درایوهای صنعتی HTI (صفحه ۲ دیتاشیت)",
    content: "موتورهای HTI گشتاور نامی بالایی در سرعت‌های پایین ارائه می‌دهند (Up to 35 Nm). بهره‌گیری از آهنرباهای ان‌دی‌بی (NdFeB) با مقاومت حرارتی بالا تا ۱۸۰ درجه سانتی‌گراد و قابلیت نصب انکودر نوری برای کنترل دقیق موقعیت در اتوماسیون.",
    tags: ["گشتاور بالا", "NdFeB", "انکودر", "صنعتی"],
    similarity: 0.89,
  },
];

export default function RAGCatalogAnalyzer() {
  const [selectedSource, setSelectedSource] = useState<CatalogKnowledgeSource>(knowledgeSources[0]);
  const [userQuery, setUserQuery] = useState("");
  const [chatLog, setChatLog] = useState<{ query: string; answer: string; chunksUsed: string[] }[]>([
    {
      query: "کاتالوگ نیان موتور (Nian Motor) چه ویژگی‌های کلیدی در بخش موتورهای BLDC ارائه می‌دهد؟",
      answer: "بر اساس تحلیل RAG کاتالوگ Nian Motor (نسخه 2025/2026):\n\n۱. **اینورتر و درایو یکپارچه (Integrated FOC):** ورود مستقیم برق ۱۸۰ تا ۲۶۵ ولت شهری بدون نیاز به درایور مجزا.\n۲. **کاهش مصرف تا ۸۰٪:** جایگزینی مستقیم موتورهای القایی قدیمی کولری و تهویه‌ای با راندمان بالای ۸۵٪ (کلاس IE4/IE5).\n۳. **سیستم‌های حفاظتی پیشرفته:** درجه حفاظت IP54/IP55، حفاظت در برابر نوسان ولتاژ، اضافه بار و راه‌اندازی نرم (Soft Start) کم‌صدا (<۴۵ دسی‌بل).\n۴. **طراحی بومی برای اقلیم ایران:** کارکرد پایدار در دمای محیط تا ۵۵ درجه سانتی‌گراد.",
      chunksUsed: ["c1", "c2"],
    },
  ]);
  const [customPdfUrl, setCustomPdfUrl] = useState("https://nianmotor.ir/wp-content/uploads/2025/08/Nian-Motor-Catalog.pdf");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"rag-chat" | "chunk-view" | "matrix">("rag-chat");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const q = userQuery.toLowerCase();
    let answer = "";
    let chunks: string[] = [];

    if (q.includes("کولر") || q.includes("نیان") || q.includes("nian") || q.includes("مصرف")) {
      answer = `تحلیل RAG بر روی کاتالوگ نیان موتور (${selectedSource.title}):\n\nموتورهای BLDC نیان موتور در محدوده ۱۵۰ وات تا ۷۵۰ وات با درایو FOC داخلی، راندمانی بین ۸۵٪ تا ۹۲٪ ارائه می‌دهند. این موتورها جایگزین مستقیم موتورهای کولری و فن‌های تهویه بوده و مصرف برق را از ۴۵۰ وات به زیر ۹۰ وات در دور پایین می‌رسانند. کنترل دور پیوسته (Variable Speed) و راه‌اندازی بدون نویز از مزایای کلیدی است.`;
      chunks = ["c1", "c2"];
    } else if (q.includes("hti") || q.includes("صنعتی") || q.includes("گشتاور")) {
      answer = `مقایسه RAG با کاتالوگ HTI:\n\nموتورهای HTI برای کاربردهای صنعتی با گشتاور بالا (تا ۳۵ نیوتن‌متر) و توان‌های ۰.۷۵ تا ۱۵ کیلووات طراحی شده‌اند. در حالی که کاتالوگ نیان موتور بیشتر روی تهویه، کولر و تک‌فاز اینورتردار تمرکز دارد، HTI روی اتوماسیون سه فاز ۲۲۰/۳۸۰ ولت با سنسور هال و انکودر متمرکز است.`;
      chunks = ["c3"];
    } else if (q.includes("ولتاژ") || q.includes("درایو") || q.includes("ip")) {
      answer = `استخراج مشخصات ولتاژ و حفاظت از کاتالوگ ${selectedSource.company}:\n\n- ولتاژ ورودی: ${selectedSource.featuredSpecs.voltage}\n- درجه حفاظت: ${selectedSource.featuredSpecs.protection}\n- نوع کنترل: ${selectedSource.featuredSpecs.controlType}\n- کلاس راندمان: ${selectedSource.featuredSpecs.efficiency}`;
      chunks = ["c1", "c2", "c3"];
    } else {
      answer = `پاسخ RAG بر اساس استخراج سمانتیک کاتالوگ ${selectedSource.company}:\n\nبر اساس شاخص‌های ثبت‌شده در فایل ${selectedSource.title}، این مدل در بازه ${selectedSource.featuredSpecs.powerRange} با کنترل ${selectedSource.featuredSpecs.controlType} و درجه حفاظت ${selectedSource.featuredSpecs.protection} کار می‌کند. برای بررسی دقیق‌تر، می‌توانید بخش تکه‌های کاتالوگ (Chunks) یا جدول مقایسه را مشاهده کنید.`;
      chunks = ["c1"];
    }

    setChatLog((prev) => [...prev, { query: userQuery, answer, chunksUsed: chunks }]);
    setUserQuery("");
  }

  function handleAnalyzeNewUrl() {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const newSource: CatalogKnowledgeSource = {
        id: `custom-${Date.now()}`,
        title: customPdfUrl.split("/").pop() || "Custom-Catalog.pdf",
        company: "کاتالوگ آنالیز شده جدید",
        url: customPdfUrl,
        type: "PDF Catalog",
        year: "2026",
        chunksCount: 15,
        featuredSpecs: {
          powerRange: "200W – 3.0 kW",
          voltage: "220 VAC / 48 VDC",
          efficiency: "87%",
          controlType: "FOC Sensorless Vector",
          protection: "IP54 / IP55",
          primaryApp: "موتورهای براشلس سفارشی",
        },
      };
      knowledgeSources.push(newSource);
      setSelectedSource(newSource);
    }, 1200);
  }

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12312a] via-[#164338] to-[#0c241d] p-6 text-white shadow-[0_20px_50px_rgba(18,49,42,.2)] md:p-8">
        <div className="absolute -left-12 -top-16 size-60 rounded-full border-[40px] border-white/[.03]" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-widest text-[#6ee7b7]">
              <Sparkles size={14} /> RAG CATALOG INTELLIGENCE ENGINE
            </div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              آنالیز هوشمند کاتالوگ‌های BLDC (با پشتیبانی نیان موتور)
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-white/70">
              استخراج سمانتیک مشخصات فنی، راندمان، درایو و درجه حفاظت از کاتالوگ‌های PDF عمومی (مانند Nian Motor Catalog) و مقایسه هوشمند با HTI و سایر سازندگان.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 font-bold backdrop-blur">
              <BookOpen size={14} className="ml-1.5 inline text-[#6ee7b7]" />۳ کاتالوگ ایندکس‌شده
            </span>
            <span className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 font-bold backdrop-blur">
              <Layers size={14} className="ml-1.5 inline text-[#38bdf8]" />۴۳ چانک سمانتیک
            </span>
          </div>
        </div>
      </section>

      {/* Catalog Source Selector & PDF Link Input */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Active Catalog Details Card */}
        <div className="rounded-2xl border border-[#e2e7e5] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0ee] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-[#eaf5f1] text-[#1c6452]">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1d2932]">{selectedSource.company}</h3>
                <p className="text-[10px] text-[#717d85]">{selectedSource.title} · {selectedSource.year}</p>
              </div>
            </div>
            <a
              href={selectedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce3e0] bg-[#f8faf9] px-3 py-2 text-[11px] font-black text-[#276a57] transition hover:bg-[#eaf3ef]"
            >
              <ExternalLink size={14} /> مشاهده لینک کاتالوگ PDF
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SpecCard label="بازه توان" value={selectedSource.featuredSpecs.powerRange} icon={Gauge} />
            <SpecCard label="ولتاژ ورودی" value={selectedSource.featuredSpecs.voltage} icon={Zap} />
            <SpecCard label="راندمان / رده" value={selectedSource.featuredSpecs.efficiency} icon={Cpu} />
            <SpecCard label="نوع کنترل" value={selectedSource.featuredSpecs.controlType} icon={Radar} />
            <SpecCard label="درجه حفاظت" value={selectedSource.featuredSpecs.protection} icon={ShieldCheck} />
            <SpecCard label="کاربرد اصلی" value={selectedSource.featuredSpecs.primaryApp} icon={Globe} />
          </div>
        </div>

        {/* Catalog Selector Panel */}
        <div className="space-y-3 rounded-2xl border border-[#e2e7e5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#1e2d28]">انتخاب منبع RAG</h3>
            <span className="rounded-full bg-[#e8f3ef] px-2 py-0.5 text-[9px] font-bold text-[#1f6350]">Vector Index</span>
          </div>

          <div className="space-y-2">
            {knowledgeSources.map((source) => {
              const active = selectedSource.id === source.id;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-right transition ${
                    active
                      ? "border-[#1d5c4d] bg-[#f0f7f3] ring-1 ring-[#1d5c4d]"
                      : "border-[#e5e9e7] bg-[#fbfcfc] hover:bg-[#f4f6f5]"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-black text-[#1e2b34]">{source.company}</div>
                    <div className="text-[9px] text-[#78838a]">{source.title}</div>
                  </div>
                  {active && <CheckCircle2 size={16} className="text-[#1f6350]" />}
                </button>
              );
            })}
          </div>

          {/* Analyze custom PDF catalog URL */}
          <div className="border-t border-[#edf0ee] pt-3">
            <label className="block text-[10px] font-bold text-[#687570]">لینک کاتالوگ PDF جدید برای تحلیل:</label>
            <div className="mt-1.5 flex gap-1.5">
              <input
                type="url"
                value={customPdfUrl}
                onChange={(e) => setCustomPdfUrl(e.target.value)}
                placeholder="https://example.com/catalog.pdf"
                className="h-9 flex-1 rounded-xl border border-[#dce2df] bg-[#fafbfb] px-3 text-[10px] outline-none transition focus:border-[#226855]"
              />
              <button
                onClick={handleAnalyzeNewUrl}
                disabled={isAnalyzing}
                className="flex h-9 items-center gap-1 rounded-xl bg-[#183f36] px-3 text-[10px] font-black text-white"
              >
                {isAnalyzing ? <RefreshCw size={12} className="animate-spin" /> : "آنالیز RAG"}
              </button>
            </div>
            <p className="mt-1 text-[9px] text-[#8e9894]">
              نمونه پیش‌فرض: کاتالوگ رسمی نیان موتور (nianmotor.ir)
            </p>
          </div>
        </div>
      </div>

      {/* RAG Mode Navigation Tabs */}
      <div className="flex border-b border-[#e2e7e5] bg-white px-2 pt-2 rounded-2xl shadow-sm">
        <button
          onClick={() => setActiveTab("rag-chat")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === "rag-chat"
              ? "border-[#1d5c4d] text-[#1d5c4d]"
              : "border-transparent text-[#717e87] hover:text-[#2d3a43]"
          }`}
        >
          <MessageSquare size={16} /> چت هوشمند و پرس‌وجوی کاتالوگ
        </button>
        <button
          onClick={() => setActiveTab("chunk-view")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === "chunk-view"
              ? "border-[#1d5c4d] text-[#1d5c4d]"
              : "border-transparent text-[#717e87] hover:text-[#2d3a43]"
          }`}
        >
          <Layers size={16} /> تکه‌های استخراج‌شده (Vector Chunks)
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-black transition ${
            activeTab === "matrix"
              ? "border-[#1d5c4d] text-[#1d5c4d]"
              : "border-transparent text-[#717e87] hover:text-[#2d3a43]"
          }`}
        >
          <ArrowLeftRight size={16} /> ماتریس مقایسه سازندگان (Nian vs HTI)
        </button>
      </div>

      {/* Tab 1: Interactive RAG Chat & Spec Query */}
      {activeTab === "rag-chat" && (
        <div className="space-y-4 rounded-2xl border border-[#e2e7e5] bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {chatLog.map((item, idx) => (
              <div key={idx} className="space-y-2 rounded-2xl bg-[#f8faf9] p-4 border border-[#e6ebe8]">
                <div className="flex items-center gap-2 text-xs font-black text-[#1e2d27]">
                  <span className="grid size-6 place-items-center rounded-lg bg-[#183f36] text-[10px] text-white">Q</span>
                  {item.query}
                </div>
                <div className="whitespace-pre-line text-xs leading-6 text-[#3b4944] pr-8">
                  {item.answer}
                </div>
                {item.chunksUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 pr-8">
                    <span className="text-[9px] font-bold text-[#83918d]">چانک‌های استفاده‌شده:</span>
                    {item.chunksUsed.map((cId) => (
                      <span key={cId} className="rounded-md bg-[#e3efe9] px-2 py-0.5 text-[9px] font-bold text-[#1f6350]">
                        #{cId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="سوال خود را بپرسید — مثلاً: مقایسه راندمان موتور BLDC نیان موتور با HTI..."
              className="h-11 flex-1 rounded-xl border border-[#dde3e0] bg-[#fafbfb] px-4 text-xs outline-none transition focus:border-[#1d5c4d] focus:bg-white"
            />
            <button
              type="submit"
              className="flex h-11 items-center gap-2 rounded-xl bg-[#183f36] px-5 text-xs font-black text-white transition hover:bg-[#112d26]"
            >
              <Bot size={16} /> تحلیل پرسش
            </button>
          </form>

          {/* Preset Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
            <span className="font-bold text-[#808d88]">پرسش‌های پیشنهادی:</span>
            {[
              "موتور BLDC کولری نیان موتور چند درصد کاهش مصرف دارد؟",
              "مقایسه HTI و نیان موتور در بازه ۱ کیلووات",
              "ویژگی‌های درایو FOC اینورتردار نیان موتور",
              "درجه حفاظت IP و نویز صوتی در کاتالوگ",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setUserQuery(prompt)}
                className="rounded-lg border border-[#e1e7e4] bg-[#f8faf9] px-2.5 py-1 text-[#43524d] transition hover:bg-[#eaf3ef] hover:text-[#1d5c4d]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Chunk View */}
      {activeTab === "chunk-view" && (
        <div className="grid gap-3 md:grid-cols-2">
          {precalculatedChunks.map((chunk) => (
            <div key={chunk.id} className="space-y-2 rounded-2xl border border-[#e2e7e5] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-black text-[#1d5c4d]">#{chunk.id} · {chunk.section}</span>
                <span className="rounded-md bg-[#edf5f1] px-2 py-0.5 font-bold text-[#237059]">
                  تطابق سمانتیک: {Math.round(chunk.similarity * 100)}%
                </span>
              </div>
              <p className="text-xs leading-6 text-[#3b4843]">{chunk.content}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {chunk.tags.map((t) => (
                  <span key={t} className="rounded-md bg-[#f1f4f3] px-2 py-0.5 text-[9px] font-bold text-[#62706b]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Comparison Matrix (Nian vs HTI vs Imported) */}
      {activeTab === "matrix" && (
        <div className="overflow-hidden rounded-2xl border border-[#e2e7e5] bg-white shadow-sm">
          <div className="p-4 border-b border-[#edf0ee]">
            <h3 className="text-sm font-black text-[#1e2c27]">ماتریس مقایسه فنی بر اساس داده‌های RAG کاتالوگ‌ها</h3>
            <p className="text-[10px] text-[#717e79]">استخراج پارامترهای مستند از Nian Motor Catalog و HTI Datasheet</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-xs">
              <thead className="bg-[#f8faf9] text-[10px] font-bold text-[#6c7873]">
                <tr>
                  <th className="p-3">معیار مقایسه</th>
                  <th className="p-3 text-[#1d5c4d]">نیان موتور (Nian Motor)</th>
                  <th className="p-3 text-[#386b9a]">توسعه حرکت HTI</th>
                  <th className="p-3 text-[#876a26]">نمونه‌های وارداتی (چین)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                <tr>
                  <td className="p-3 font-bold text-[#33413c]">بازه توان اصلی</td>
                  <td className="p-3">۱۵۰ وات تا ۱.۵ کیلووات (خانگی/تهویه)</td>
                  <td className="p-3">۰.۷۵ تا ۱۵ کیلووات (صنعتی)</td>
                  <td className="p-3">۵۰ وات تا ۱۰ کیلووات</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#33413c]">ولتاژ و درایو</td>
                  <td className="p-3 font-bold text-[#1d5c4d]">۲۲۰V AC شهری با درایور FOC داخلی</td>
                  <td className="p-3 font-bold text-[#386b9a]">سه فاز ۲۲۰V/۳۸۰V درایو مجزا</td>
                  <td className="p-3">متنوع (۱۲V تا ۳۸۰V)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#33413c]">کلاس راندمان energy</td>
                  <td className="p-3 font-bold text-[#1d5c4d]">IE4 / IE5 (کاهش مصرف تا ۸۰٪)</td>
                  <td className="p-3">IE3 / IE4 High Torque</td>
                  <td className="p-3">IE2 تا IE4 بسته به قیمت</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#33413c]">کاربرد تخصصی</td>
                  <td className="p-3">کولر آبی، فن تهویه، HVAC، لوازم خانگی</td>
                  <td className="p-3">نوار نقاله، اتوماسیون، پمپ صنعتی</td>
                  <td className="p-3">دوچرخه برقی، پمپ کوچک، عمومی</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#33413c]">منبع کاتالوگ عمومی</td>
                  <td className="p-3 text-[#1d5c4d] font-bold">nianmotor.ir Catalog 2025</td>
                  <td className="p-3 text-[#386b9a] font-bold">HTI Datasheet 2026</td>
                  <td className="p-3">دایرکتوری‌های عمومی بازارهای صنعتی</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl border border-[#e5e9e7] bg-[#f8faf9] p-3">
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#707e78]">
        <Icon size={13} className="text-[#206652]" />
        {label}
      </div>
      <div className="mt-1 text-xs font-black text-[#1e2b26]">{value}</div>
    </div>
  );
}
