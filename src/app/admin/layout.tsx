import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const style: React.CSSProperties = await (async () => {
    try {
      const brandKeys = ["theme_brand", "theme_brand_hover", "theme_brand_dark", "theme_brand_dark_hover"];
      const rows = await prisma.siteSetting.findMany({
        where: { key: { in: brandKeys } },
        select: { key: true, value: true },
      });
      const map = new Map(rows.map((r) => [r.key, r.value]));
      return {
        ...(map.get("theme_brand")?.trim() ? { ["--brand" as any]: map.get("theme_brand")!.trim() } : {}),
        ...(map.get("theme_brand_hover")?.trim() ? { ["--brand-hover" as any]: map.get("theme_brand_hover")!.trim() } : {}),
        ...(map.get("theme_brand_dark")?.trim() ? { ["--brand-dark" as any]: map.get("theme_brand_dark")!.trim() } : {}),
        ...(map.get("theme_brand_dark_hover")?.trim()
          ? { ["--brand-dark-hover" as any]: map.get("theme_brand_dark_hover")!.trim() }
          : {}),
      };
    } catch {
      return {};
    }
  })();

  return (
    <div style={style} className="min-h-full bg-(--background) text-(--foreground)">
      <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/60 dark:bg-black/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            لوحة التحكم
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/drugs"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              الأدوية
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              المستخدمون
            </Link>
            <Link
              href="/admin/articles"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              المقالات
            </Link>
            <Link
              href="/admin/faq"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              الأسئلة الشائعة
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              الإعدادات
            </Link>
            <Link
              href="/admin/messages"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              الرسائل
            </Link>
            <Link
              href="/ar"
              className="rounded-lg px-2 py-1 text-(--brand) hover:text-(--brand-hover)"
            >
              عرض الموقع
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
