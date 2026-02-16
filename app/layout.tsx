import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AdminLayout } from "@/components/layout/admin-layout";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบจัดการหวยออนไลน์ - Admin",
  description: "ระบบจัดการหวยออนไลน์สำหรับผู้ดูแลระบบ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} scroll-smooth`}>
      <body className="antialiased">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
