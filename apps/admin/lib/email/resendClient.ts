/**
 * Resend email client wrapper
 */

import { Resend } from "resend";
import { emailConfig } from "@/lib/env/email";
import type { ReactElement } from "react";

const resend = new Resend(emailConfig.apiKey);

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}): Promise<{ id: string } | null> {
  try {
    if (!emailConfig.apiKey) {
      console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
      return null;
    }

    const result = await resend.emails.send({
      from: options.from || emailConfig.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      react: options.react,
    });

    if (result.error) {
      console.error("[Email] Failed to send email:", result.error);
      return null;
    }

    console.log("[Email] Email sent successfully:", {
      id: result.data?.id,
      to: options.to,
    });

    return { id: result.data?.id || "unknown" };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return null;
  }
}

export function buildAppUrl(path: string): string {
  const baseUrl = emailConfig.appUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

