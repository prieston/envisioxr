/**
 * Email system exports
 * Main entry point for the email system
 */

// Low-level client
export { sendEmail, buildAppUrl } from "./resendClient";

// Typed helpers
export {
  sendVerificationEmail,
  sendOrgInviteEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./helpers";

// Templates (for testing or custom use)
export * from "./templates";

