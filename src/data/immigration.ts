/**
 * Migration (مهاجرت) agents — demo dataset compiled from the related GitHub
 * repos in the Websites-by-AI / SBZ-EDU orgs:
 *   - SBZ-EDU/shahrokh-immigration-turkey   (شاهرخ / شاهان — Turkey)
 *   - Websites-by-AI/AI-Iimmigration-visa-assistant- (consultants + AI agents)
 *   - Websites-by-AI/Soh_visa_by_xprize     (Germany §21 startup-visa agent)
 *
 * Demo/public data only — verify every contact and credential before use.
 */

export interface MigrationAgent {
  id: string;
  name: string;
  country: string;
  phone?: string;
  credentials?: string;
  note: string;
  url?: string;
  source: string;
  kind: "human" | "company" | "ai";
}

export const migrationAgents: MigrationAgent[] = [
  {
    id: "mig-01",
    name: "شاهرخ (Shahrokh)",
    country: "ترکیه",
    phone: "+90 542 177 2753",
    note: "دو دفتر: تهران (مدارک) و استانبول لِوِنت/شیشلی (پذیرش حضوری). بسته Lite: ارزیابی + توریستی ۹۰ روزه + مشاوره اجاره رسمی — ۳۵۰$",
    source: "SBZ-EDU/shahrokh-immigration-turkey",
    kind: "company",
  },
  {
    id: "mig-02",
    name: "شرکت مهاجرتی شاهان (Shaahan)",
    country: "ترکیه",
    url: "https://apply.shaahan.com/",
    note: "آژانس فارسی‌زبان — جستجوی ملک، تاپو، حساب بانکی، اقامت و مسیرهای مهاجرت به ترکیه",
    source: "TURKEY_4X_SHAHROKH_GUIDE.md",
    kind: "company",
  },
  {
    id: "mig-03",
    name: "Dr. Alistair Finch",
    country: "کانادا و بریتانیا",
    credentials: "RCIC, OISC",
    note: "مشاور رسمی مهاجرت — ۱۵+ سال تجربه در Express Entry، PNP و ویزای Skilled Worker بریتانیا",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "human",
  },
  {
    id: "mig-04",
    name: "Maria Sanchez",
    country: "آمریکا",
    credentials: "AILA Member",
    note: "متخصص ویزای دانشجویی F-1 و گرین‌کارت کاری EB-2 / EB-3",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "human",
  },
  {
    id: "mig-05",
    name: "Chen Wei",
    country: "استرالیا / پرتغال / امارات",
    credentials: "IMC",
    note: "کارشناس برنامه‌های ویزای سرمایه‌گذاری و بیزینس — Investment & Business Visas",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "human",
  },
  {
    id: "mig-06",
    name: "ایجنت §21 آلمان (The 10:00 Agent)",
    country: "آلمان",
    note: "ایجنت خودکار ویزای استارتاپ §21 — ارسال روزانه ۱۰:۰۰ صبح به ۲۰ انکوباتور برای دریافت نامه حمایت (THR → BER)",
    source: "Websites-by-AI/Soh_visa_by_xprize",
    kind: "ai",
  },
  {
    id: "mig-07",
    name: "AI Consultant (دستیار مهاجرت)",
    country: "جهانی",
    note: "مشاور چت هوشمند — پاسخ به سؤالات ویزا، اپلای و اسکان (Gemini 2.5 Flash، ورودی صوتی)",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "ai",
  },
  {
    id: "mig-08",
    name: "Office Finder ایجنت",
    country: "جهانی",
    note: "یافتن سفارت‌ها، کنسولگری‌ها و مراکز ویزا بر اساس موقعیت یا جستجوی متنی + گوگل",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "ai",
  },
  {
    id: "mig-09",
    name: "Pathway Analyzer ایجنت",
    country: "جهانی",
    note: "تحلیل مسیر مهاجرتی — ورودی آزاد پروفایل، خروجی تحلیل واجد شرایط بودن و کشورهای پیشنهادی",
    source: "AI-Iimmigration-visa-assistant-",
    kind: "ai",
  },
  {
    id: "mig-10",
    name: "ربات تلگرام شاهرخ (@shahrokh_imigration_bot)",
    country: "ترکیه",
    url: "https://t.me/shahrokh_imigration_bot",
    note: "دریافت فرم‌ها و لیدها مستقیم به تلگرام ادمین — اتصال اپ مهاجرت به ربات",
    source: "TELEGRAM_SETUP.md",
    kind: "ai",
  },
];
