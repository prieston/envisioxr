/**
 * POST /api/auth/test-email
 * Test endpoint to verify email sending works
 * Only works in development mode
 */

import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { emailConfig } from "@/lib/env/server";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate a test code
    const testCode = "123456";

    console.log("[Test Email] Attempting to send test email:", {
      email,
      from: emailConfig.from,
      hasApiKey: !!emailConfig.apiKey,
      apiKeyPrefix: emailConfig.apiKey?.substring(0, 7),
    });

    const result = await sendPasswordResetEmail(email, testCode, "Test User");

    if (result === null) {
      return NextResponse.json(
        {
          error: "Failed to send email. Check server logs for details.",
          checkLogs: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      resendId: result.id,
      email,
    });
  } catch (error) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

