import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLDC Map Signal | Seller Finder + HTI Snap",
  description: "مرکز عملیات یافتن و ارزیابی فروشندگان و سازندگان موتور BLDC در ایران",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
