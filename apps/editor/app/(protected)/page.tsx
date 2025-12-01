import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  getUserDefaultOrganization,
  getUserOrganizations,
  getUserPendingInvitations,
  // Keep createPersonalOrganization import for future reference
  // createPersonalOrganization,
} from "@/lib/organizations";
import { prisma } from "@/lib/prisma";
import NoOrganizationAccess from "@/app/components/NoOrganizationAccess";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Get all user's organizations
  const members = await getUserOrganizations(session.user.id);
  const organizations = members.map((m) => m.organization);

  // Check if user only has personal organizations
  const hasOnlyPersonalOrgs =
    organizations.length > 0 &&
    organizations.every((org) => org.isPersonal);

  // Check for pending invitations
  let hasPendingInvites = false;
  if (session.user.email) {
    const pendingInvites = await getUserPendingInvitations(session.user.email);
    hasPendingInvites = pendingInvites.length > 0;
  }

  // If user only has personal orgs AND no pending invites, show blocking screen
  if (hasOnlyPersonalOrgs && !hasPendingInvites) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      select: { name: true },
    });

    const firstName = user?.name?.split(" ")[0] || null;
    return <NoOrganizationAccess firstName={firstName} />;
  }

  // Otherwise, get default organization (non-personal) and redirect
  const organization = await getUserDefaultOrganization(session.user.id);

  // If no organization found, redirect to signin
  if (!organization) {
    redirect("/auth/signin");
  }

  redirect(`/org/${organization.id}/dashboard`);
  return null;
}
