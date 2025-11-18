/**
 * Typed email helper functions
 * High-level functions for sending specific types of emails
 */

import { sendEmail, buildAppUrl } from "./resendClient";
import {
  VerificationEmail,
  OrgInviteEmail,
  PasswordResetEmail,
  WelcomeEmail,
} from "./templates";

/**
 * Send email verification email
 * Called after creating an unverified user with a verification token
 *
 * @param userEmail - User's email address
 * @param token - Verification token
 * @param userName - Optional user name for personalization
 */
export async function sendVerificationEmail(
  userEmail: string,
  token: string,
  userName?: string
): Promise<void> {
  const verificationUrl = buildAppUrl(`/auth/verify-email?token=${token}`);

  await sendEmail({
    to: userEmail,
    subject: "Verify your email address",
    react: VerificationEmail({
      verificationUrl,
      userName,
    }),
  });
}

/**
 * Send organization invitation email
 * Called after creating an org invite record and token
 *
 * @param inviteeEmail - Email address of the person being invited
 * @param orgName - Name of the organization
 * @param inviterName - Name of the person sending the invitation
 * @param token - Invitation token
 */
export async function sendOrgInviteEmail(
  inviteeEmail: string,
  orgName: string,
  inviterName: string,
  token: string
): Promise<void> {
  const invitationUrl = buildAppUrl(`/orgs/invites/accept?token=${token}`);

  await sendEmail({
    to: inviteeEmail,
    subject: `You've been invited to join ${orgName}`,
    react: OrgInviteEmail({
      invitationUrl,
      orgName,
      inviterName,
      inviteeEmail,
    }),
  });
}

/**
 * Send password reset email
 * Called after generating a password reset code
 *
 * @param userEmail - User's email address
 * @param resetCode - 6-digit password reset code
 * @param userName - Optional user name for personalization
 * @returns Resend email ID or null if failed
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  resetCode: string,
  userName?: string
): Promise<{ id: string } | null> {
  return sendEmail({
    to: userEmail,
    subject: "Reset your password",
    react: PasswordResetEmail({
      resetCode,
      userName,
    }),
  });
}

/**
 * Send welcome email
 * Called after a user successfully joins their first organization
 *
 * @param userEmail - User's email address
 * @param orgName - Name of the organization they joined
 * @param userName - Optional user name for personalization
 * @param orgId - Organization ID for building dashboard URL
 */
export async function sendWelcomeEmail(
  userEmail: string,
  orgName: string,
  userName?: string,
  orgId?: string
): Promise<void> {
  const dashboardUrl = orgId
    ? buildAppUrl(`/org/${orgId}/dashboard`)
    : buildAppUrl("/dashboard");

  await sendEmail({
    to: userEmail,
    subject: "Welcome to Klorad!",
    react: WelcomeEmail({
      userName,
      orgName,
      dashboardUrl,
    }),
  });
}

