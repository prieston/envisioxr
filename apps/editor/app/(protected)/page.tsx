import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getUserDefaultOrganization } from "@/lib/organizations";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const organization = await getUserDefaultOrganization(session.user.id);

  if (!organization) {
    redirect("/auth/signin");
  }

  redirect(`/org/${organization.id}/dashboard`);
  return null;
}
