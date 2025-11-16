import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { isUserMemberOfOrganization } from "@/lib/organizations";

type RouteContext = {
  params: {
    assetId: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = context.params;
  if (!assetId) {
    return NextResponse.json(
      { error: "Asset ID is required" },
      { status: 400 }
    );
  }

  try {
    const asset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Verify user is a member of the asset's organization
    const isMember = await isUserMemberOfOrganization(
      session.user.id,
      asset.organizationId
    );
    if (!isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
