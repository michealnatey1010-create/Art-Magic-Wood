import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Electronic Library | Smart School Partner",
  description: "Your Smart Educational Partner for Schools, Teachers and Students. One-click school supply kits, loyalty points rewards, and teacher subscriptions.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased">
        <LanguageProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
