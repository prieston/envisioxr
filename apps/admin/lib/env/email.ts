/**
 * Email configuration
 * Validates and exports email-related environment variables
 */

const emailConfig = {
  apiKey: process.env.RESEND_API_KEY || "",
  from: process.env.EMAIL_FROM || "Klorad <no-reply@klorad.app>",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3001",
};

export { emailConfig };

