import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { NextRequest } from "next/server";
import { getUserOrganizations } from "@/lib/organizations";

// GET: Get all organizations user is a member of
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const members = await getUserOrganizations(userId);

    // Filter out personal organizations from the list
    const organizations = members
      .filter((member) => !member.organization.isPersonal)
      .map((member) => ({
      id: member.organization.id,
      name: member.organization.name,
      slug: member.organization.slug,
      isPersonal: member.organization.isPersonal,
      userRole: member.role,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("[Organizations List API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

