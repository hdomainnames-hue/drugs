import { headers } from "next/headers";
import { Geist_Mono, Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-latin",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-sans-arabic",
  subsets: ["arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = h.get("x-lang") === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontSansVar = lang === "ar" ? notoSansArabic.variable : inter.variable;

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${fontSansVar} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
