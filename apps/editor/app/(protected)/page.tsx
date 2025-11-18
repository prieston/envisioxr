import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import {
  getUserDefaultOrganization,
  createPersonalOrganization,
} from "@/lib/organizations";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  let organization = await getUserDefaultOrganization(session.user.id);

  // If user doesn't have an organization, create a personal one
  // This can happen for OAuth users or users created before personal orgs were added
  if (!organization) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user) {
        organization = await createPersonalOrganization(
          user.id,
          user.name,
          user.email
        );
      }
    } catch (error) {
      console.error(
        "[HomePage] Failed to create personal organization:",
        error
      );
      // Fall through to redirect to signin
    }
  }

  if (!organization) {
    redirect("/auth/signin");
  }

  redirect(`/org/${organization.id}/dashboard`);
  return null;
}
