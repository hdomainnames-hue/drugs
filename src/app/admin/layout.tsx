import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200/60 bg-zinc-50/80 backdrop-blur dark:border-zinc-800/60 dark:bg-black/60">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Admin
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/drugs"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              Drugs
            </Link>
            <Link
              href="/admin/articles"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              Articles
            </Link>
            <Link
              href="/admin/faq"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              FAQ
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-lg px-2 py-1 text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              Settings
            </Link>
            <Link
              href="/ar"
              className="rounded-lg px-2 py-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              View site
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
