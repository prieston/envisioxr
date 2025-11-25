import type { NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/resendClient";
import { emailConfig } from "@/lib/env";
import { ContactFormEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, organization, role, context } = data;

    // Validate required fields
    if (!name || !email || !organization || !role || !context) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const result = await sendEmail({
      to: emailConfig.to,
      subject: `New Contact Form Submission from ${name}`,
      react: ContactFormEmail({
        name,
        email,
        organization,
        role,
        context,
      }),
      from: emailConfig.from,
    });

    if (!result) {
      console.error("[Contact API] Failed to send email");
      return Response.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    console.log("[Contact API] Email sent successfully:", {
      id: result.id,
      from: email,
    });

    return Response.json(
      {
        status: "received",
        message: "Your message has been sent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

