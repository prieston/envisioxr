import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { isUserMemberOfOrganization } from "@/lib/organizations";
import { ClientProviders } from "../../providers";

export const dynamic = "force-dynamic";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { orgId } = await params;

  // Verify user is a member of this organization
  const isMember = await isUserMemberOfOrganization(session.user.id, orgId);

  if (!isMember) {
    // Redirect to default organization if user doesn't have access
    const { getUserDefaultOrganization } = await import("@/lib/organizations");
    const defaultOrg = await getUserDefaultOrganization(session.user.id);
    if (defaultOrg) {
      redirect(`/org/${defaultOrg.id}/dashboard`);
    } else {
      redirect("/auth/signin");
    }
  }

  return <ClientProviders>{children}</ClientProviders>;
}

