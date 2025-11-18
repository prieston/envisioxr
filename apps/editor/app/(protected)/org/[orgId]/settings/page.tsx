import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = await params;
  redirect(`/org/${orgId}/settings/general`);
  return null;
}
