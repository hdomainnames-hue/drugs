import { headers } from "next/headers";
import { Cairo, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-latin",
  subsets: ["latin"],
});

const cairo = Cairo({
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
  const fontSansVar = lang === "ar" ? cairo.variable : plusJakartaSans.variable;

  const brandKeys = [
    "theme_brand",
    "theme_brand_hover",
    "theme_brand_dark",
    "theme_brand_dark_hover",
  ];

  const brandSettings = await prisma.siteSetting.findMany({
    where: { key: { in: brandKeys } },
    select: { key: true, value: true },
  });
  const brandMap = new Map(brandSettings.map((s) => [s.key, s.value]));

  const style: React.CSSProperties = {
    ...(brandMap.get("theme_brand")?.trim() ? { ["--brand" as any]: brandMap.get("theme_brand")!.trim() } : {}),
    ...(brandMap.get("theme_brand_hover")?.trim()
      ? { ["--brand-hover" as any]: brandMap.get("theme_brand_hover")!.trim() }
      : {}),
    ...(brandMap.get("theme_brand_dark")?.trim() ? { ["--brand-dark" as any]: brandMap.get("theme_brand_dark")!.trim() } : {}),
    ...(brandMap.get("theme_brand_dark_hover")?.trim()
      ? { ["--brand-dark-hover" as any]: brandMap.get("theme_brand_dark_hover")!.trim() }
      : {}),
  };

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${fontSansVar} ${geistMono.variable} h-full antialiased`}
      style={style}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
