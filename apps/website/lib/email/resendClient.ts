/**
 * Resend email client wrapper for website
 *
 * Provides a low-level sendEmail function for sending emails via Resend.
 */

import { Resend } from "resend";
import { emailConfig } from "@/lib/env";
import type { ReactElement } from "react";

// Initialize Resend client
const resend = new Resend(emailConfig.apiKey);

/**
 * Low-level email sending function
 *
 * @param options - Email sending options
 * @returns Promise resolving to Resend response or null on error
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}): Promise<{ id: string } | null> {
  try {
    // eslint-disable-next-line no-console
    console.log("[Email] Attempting to send email:", {
      to: options.to,
      subject: options.subject,
      from: options.from || emailConfig.from,
      hasApiKey: !!emailConfig.apiKey,
      apiKeyPrefix: emailConfig.apiKey?.substring(0, 7),
    });

    const result = await resend.emails.send({
      from: options.from || emailConfig.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      react: options.react,
    });

    if (result.error) {
      // eslint-disable-next-line no-console
      console.error("[Email] Failed to send email:", result.error);
      // eslint-disable-next-line no-console
      console.error(
        "[Email] Resend error details:",
        JSON.stringify(result.error, null, 2)
      );

      // Provide helpful error message for domain verification issues
      if (result.error.message?.includes("domain is not verified")) {
        // eslint-disable-next-line no-console
        console.error(
          "[Email] Domain verification error: Please verify your domain in Resend. " +
            "Check EMAIL_FROM environment variable and ensure the domain is verified at https://resend.com/domains"
        );
      }

      return null;
    }

    // eslint-disable-next-line no-console
    console.log("[Email] Email sent successfully:", {
      id: result.data?.id,
      to: options.to,
    });

    return { id: result.data?.id || "unknown" };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    console.error("[Email] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return null;
  }
}
