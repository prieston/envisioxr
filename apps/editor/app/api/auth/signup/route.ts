/**
 * POST /api/auth/signup
 * Create a new user account with email/password
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateToken, getTokenExpiration } from "@/lib/email/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { createPersonalOrganization } from "@/lib/organizations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but email is not verified, allow resending verification email
      if (!existingUser.emailVerified && existingUser.password) {
        // Ensure user has a personal organization (in case it wasn't created before)
        const hasPersonalOrg = await prisma.organizationMember.findFirst({
          where: {
            userId: existingUser.id,
            organization: { isPersonal: true },
          },
        });

        if (!hasPersonalOrg) {
          try {
            await createPersonalOrganization(
              existingUser.id,
              existingUser.name,
              existingUser.email
            );
          } catch (orgError) {
            console.error(
              "[Signup] Failed to create personal organization for existing user:",
              orgError
            );
          }
        }

        // Delete old verification tokens for this email
        await prisma.verificationToken.deleteMany({
          where: { identifier: email },
        });

        // Generate new verification token
        const token = generateToken();
        const expires = getTokenExpiration(24); // 24 hours

        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires,
          },
        });

        // Send verification email
        sendVerificationEmail(email, token, existingUser.name || undefined).catch(
          (error) => {
            console.error("[Signup] Failed to send verification email:", error);
          }
        );

        return NextResponse.json(
          {
            message:
              "An account with this email already exists but is not verified. A new verification email has been sent.",
            userId: existingUser.id,
            resendVerification: true,
          },
          { status: 200 }
        );
      }

      // User exists and is verified, or signed up with OAuth
      return NextResponse.json(
        {
          error: "User with this email already exists",
          verified: !!existingUser.emailVerified,
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    // Create personal organization for the user
    try {
      await createPersonalOrganization(user.id, name || null, email);
    } catch (orgError) {
      console.error("[Signup] Failed to create personal organization:", orgError);
      // Don't fail signup if org creation fails - user can still sign in
      // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
    }

    // Generate verification token
    const token = generateToken();
    const expires = getTokenExpiration(24); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email (don't await - don't block response)
    sendVerificationEmail(email, token, name).catch((error) => {
      // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
      console.error("[Signup] Failed to send verification email:", error);
    });

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Signup] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

