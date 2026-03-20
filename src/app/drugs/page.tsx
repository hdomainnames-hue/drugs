import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DrugsLegacyRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const page = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  if (q) qs.set("q", q);
  if (page) qs.set("page", page);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/ar/drugs${suffix}`);
}
