import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  getUserDefaultOrganization,
  getUserOrganizations,
  getUserPendingInvitations,
} from "@/lib/organizations";

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

  // If user has zero organizations OR only personal orgs AND no pending invites, redirect to blocking page
  if ((organizations.length === 0 || hasOnlyPersonalOrgs) && !hasPendingInvites) {
    redirect("/account-not-linked");
  }

  // Otherwise, get default organization (non-personal) and redirect
  const organization = await getUserDefaultOrganization(session.user.id);

  // If no organization found, this should not happen if we handled zero orgs above
  // But as a safety check, redirect to blocking page instead of redirecting to signin
  if (!organization) {
    redirect("/account-not-linked");
  }

  redirect(`/org/${organization.id}/dashboard`);
}
