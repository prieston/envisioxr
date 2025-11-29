/**
 * Email helper functions
 */

import { sendEmail, buildAppUrl } from "./resendClient";
import { OrgInviteEmail } from "./templates/OrgInviteEmail";

/**
 * Send organization invitation email
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

