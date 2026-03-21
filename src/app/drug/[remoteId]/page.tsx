import { redirect } from "next/navigation";

export default async function DrugLegacyRedirect({
  params,
}: {
  params: Promise<{ remoteId: string }>;
}) {
  const { remoteId } = await params;
  redirect(`/ar/drug/${remoteId}`);
}
