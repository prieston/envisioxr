import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { sendEmail } from "@/lib/email/resendClient";
import { emailConfig } from "@/lib/env/server";
import { SupportRequestEmail } from "@/lib/email/templates";

/**
 * POST: Send support request email
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, message, userEmail, userName } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: "info@prieston.gr",
      subject: `[Support Request] ${subject}`,
      react: SupportRequestEmail({
        subject,
        message,
        userName: userName || session.user.name || "Unknown",
        userEmail: userEmail || session.user.email || "Unknown",
      }),
      from: emailConfig.from,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to send support request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Support request sent successfully" });
  } catch (error) {
    console.error("[Support API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

