/**
 * POST /api/auth/reset-password/request
 * Request a password reset email
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetCode, getTokenExpiration } from "@/lib/email/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (user) {
      console.log("[Password Reset Request] User found:", {
        email: user.email,
        hasPassword: !!user.password,
        userId: user.id,
      });

      // Check if user has a password (email/password signup)
      // Users who signed up with OAuth (Google/GitHub) don't have passwords
      if (!user.password) {
        console.log(
          "[Password Reset Request] User signed up with OAuth - skipping password reset"
        );
        // User signed up with OAuth, don't send password reset
        // Still return success to prevent email enumeration
        return NextResponse.json({
          message:
            "If an account exists with this email, a password reset code has been sent.",
        });
      }

      // Generate 6-digit reset code
      const resetCode = generateResetCode();
      const expires = getTokenExpiration(1); // 1 hour

      console.log("[Password Reset Request] Generated reset code:", {
        code: resetCode,
        expires: expires.toISOString(),
      });

      // Store reset code on user (we'll store it as the token)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetCode,
          passwordResetTokenExp: expires,
        },
      });

      console.log("[Password Reset Request] Stored reset code in database");

      // Send reset email with code (don't await - don't block response)
      console.log("[Password Reset Request] Attempting to send email...");
      sendPasswordResetEmail(email, resetCode, user.name || undefined)
        .then((result) => {
          if (result === null) {
            console.error(
              "[Password Reset Request] Email sending returned null - check Resend API key and configuration"
            );
          } else {
            console.log(
              `[Password Reset Request] Password reset email sent successfully. Resend ID: ${result.id}`
            );
          }
        })
        .catch((error) => {
          // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
          console.error(
            "[Password Reset Request] Failed to send reset email:",
            error
          );
          console.error("[Password Reset Request] Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        });
    } else {
      console.log("[Password Reset Request] User not found for email:", email);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account exists with this email, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("[Password Reset Request] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

