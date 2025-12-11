import { redirect } from "next/navigation";

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  redirect(`/org/${orgId}/library/models`);
  return null;
}
