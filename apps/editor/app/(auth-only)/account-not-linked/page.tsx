import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import NoOrganizationAccess from "@/app/components/NoOrganizationAccess";

export const dynamic = "force-dynamic";

export default async function AccountNotLinkedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null; // Layout will handle redirect
  }

  // Fetch user's firstName
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const firstName = user?.name?.split(" ")[0] || null;

  return <NoOrganizationAccess firstName={firstName} />;
}



