/**
 * Resend email client wrapper
 *
 * Provides a low-level sendEmail function and typed helpers for common email use cases.
 * All email sending is done through Resend with React Email templates.
 */

import { Resend } from "resend";
import { emailConfig } from "@/lib/env/server";
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
    const result = await resend.emails.send({
      from: options.from || emailConfig.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      react: options.react,
    });

    if (result.error) {
      // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
      // eslint-disable-next-line no-console
      console.error("[Email] Failed to send email:", result.error);
      // eslint-disable-next-line no-console
      console.error(
        "[Email] Resend error details:",
        JSON.stringify(result.error, null, 2)
      );
      return null;
    }

    return { id: result.data?.id || "unknown" };
  } catch (error) {
    // TODO: Integrate with centralized logging/observability system (e.g., Sentry)
    console.error("[Email] Error sending email:", error);
    console.error("[Email] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return null;
  }
}

/**
 * Build a full URL using the app's base URL
 */
export function buildAppUrl(path: string): string {
  const baseUrl = emailConfig.appUrl.replace(/\/$/, ""); // Remove trailing slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
