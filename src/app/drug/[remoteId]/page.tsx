import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DrugLegacyRedirect({
  params,
}: {
  params: Promise<{ remoteId: string }>;
}) {
  const { remoteId } = await params;
  redirect(`/ar/drug/${remoteId}`);
}
