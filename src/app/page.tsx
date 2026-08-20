import type { Metadata } from "next";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "BLDC Map Signal | مرکز عملیات بازار موتورهای BLDC",
  description:
    "کشف، تحلیل هزینه و پیگیری فروشندگان و سازندگان موتور BLDC در ایران و جهان — نقشه ۱۲۳ شرکت، کاتالوگ، RAG و ربات تلگرام @Pars_sell_bot. عضویت بازاریاب‌ها با کمیسیون معرفی.",
  keywords: ["BLDC", "موتور براشلس", "نقشه فروشندگان", "کاتالوگ", "تلگرام", "بازاریابی"],
  openGraph: {
    title: "BLDC Map Signal — مرکز عملیات بازار موتورهای BLDC",
    description: "نقشه ۱۲۳ شرکت ایرانی و جهانی، تحلیل هزینه، کاتالوگ و پیگیری در ربات تلگرام.",
    type: "website",
  },
};

export default function HomePage() {
  return <Dashboard />;
}
