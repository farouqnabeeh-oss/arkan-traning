import type { Metadata } from "next";
import { Tajawal, Noto_Sans_Arabic, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

const notoArabic = Noto_Sans_Arabic({
  weight: ["400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
});

const playfair = Playfair_Display({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

import { AuthProvider } from "@/context/AuthContext";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "أركان | المنصة التعليمية الرائدة",
  description: "أركان هي منصة تعليمية تفاعلية تجمع بين المعرفة النظرية والتدريبات العملية والألعاب البرمجية تحت إشراف مدربين محترفين.",
  keywords: ["تعلم البرمجة", "كورسات", "أركان", "ذكاء اصطناعي", "تعليم تفاعلي", "ألعاب برمجية"],
  authors: [{ name: "Arkan Academy" }],
  openGraph: {
    title: "أركان | المنصة التعليمية الرائدة",
    description: "أركان هي منصة تعليمية تفاعلية للبرمجة.",
    url: "https://arkan.edu",
    siteName: "Arkan",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أركان | المنصة التعليمية الرائدة",
    description: "أركان هي منصة تعليمية تفاعلية للبرمجة.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.jpeg", type: "image/jpeg" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/logo.jpeg", type: "image/jpeg" }],
    shortcut: "/logo.jpeg",
  },
};

export const viewport = {
  themeColor: "#3B5BDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${notoArabic.variable} ${playfair.variable} ${inter.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-brand-dark text-brand-white antialiased selection:bg-brand-royal/30 selection:text-brand-royal">
        <AuthProvider>
          <PwaRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
