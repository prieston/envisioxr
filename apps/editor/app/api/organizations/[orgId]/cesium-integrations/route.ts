import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import {
  isUserMemberOfOrganization,
  hasUserRoleInOrganization,
} from "@/lib/organizations";
import {
  encryptToken,
  getTokenLast4,
} from "@/lib/cesium/encryption";
import {
  validateReadToken,
  validateUploadToken,
} from "@/lib/cesium/token-validation";

interface RouteParams {
  params: { orgId: string };
}

/**
 * GET: List all Cesium Ion integrations for an organization
 * Returns only safe fields (no full tokens)
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

  try {
    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    const integrations = await prisma.cesiumIonIntegration.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        organizationId: true,
        label: true,
        readTokenLast4: true,
        uploadTokenLast4: true,
        readTokenValid: true,
        uploadTokenValid: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
        // Never return full tokens or scopes
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("[Cesium Integrations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new Cesium Ion integration
 * Validates tokens and encrypts them before storage
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { orgId } = await params;

  try {
    const body = await request.json();
    const { label, readToken, uploadToken } = body;

    // Verify user is a member of this organization
    const isMember = await isUserMemberOfOrganization(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this organization" },
        { status: 403 }
      );
    }

    // Check if user has admin or owner role
    const canEdit =
      (await hasUserRoleInOrganization(userId, orgId, "admin")) ||
      (await hasUserRoleInOrganization(userId, orgId, "owner"));

    if (!canEdit) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Validate inputs
    if (!label || label.trim().length === 0) {
      return NextResponse.json(
        { error: "Integration label is required", field: "label" },
        { status: 400 }
      );
    }

    if (!readToken || readToken.trim().length === 0) {
      return NextResponse.json(
        { error: "Read-only token is required", field: "readToken" },
        { status: 400 }
      );
    }

    if (!uploadToken || uploadToken.trim().length === 0) {
      return NextResponse.json(
        { error: "Upload token is required", field: "uploadToken" },
        { status: 400 }
      );
    }

    // Validate read token
    const readValidation = await validateReadToken(readToken.trim());
    if (!readValidation.valid) {
      return NextResponse.json(
        {
          error: readValidation.error || "Read-only token validation failed",
          field: "readToken",
        },
        { status: 400 }
      );
    }

    // Validate upload token
    const uploadValidation = await validateUploadToken(uploadToken.trim());
    if (!uploadValidation.valid) {
      return NextResponse.json(
        {
          error:
            uploadValidation.error || "Upload token validation failed",
          field: "uploadToken",
        },
        { status: 400 }
      );
    }

    // Encrypt tokens
    const encryptedReadToken = encryptToken(readToken.trim());
    const encryptedUploadToken = encryptToken(uploadToken.trim());

    // Get last 4 characters for display
    const readTokenLast4 = getTokenLast4(readToken.trim());
    const uploadTokenLast4 = getTokenLast4(uploadToken.trim());

    // Create integration
    const integration = await prisma.cesiumIonIntegration.create({
      data: {
        organizationId: orgId,
        label: label.trim(),
        readToken: encryptedReadToken,
        uploadToken: encryptedUploadToken,
        readTokenLast4,
        uploadTokenLast4,
        readTokenValid: true,
        uploadTokenValid: true,
        readTokenScopes: readValidation.scopes || null,
        uploadTokenScopes: uploadValidation.scopes || null,
        cesiumAccountId: readValidation.accountId || uploadValidation.accountId || null,
      },
      select: {
        id: true,
        organizationId: true,
        label: true,
        readTokenLast4: true,
        uploadTokenLast4: true,
        readTokenValid: true,
        uploadTokenValid: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    console.error("[Cesium Integrations API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

