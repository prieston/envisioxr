/**
 * Organization invitation email template
 * Sent when an org admin invites a member by email
 */

import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface OrgInviteEmailProps {
  invitationUrl: string;
  orgName: string;
  inviterName: string;
  inviteeEmail: string;
}

export function OrgInviteEmail({
  invitationUrl,
  orgName,
  inviterName,
  inviteeEmail: _inviteeEmail,
}: OrgInviteEmailProps) {
  return (
    <EmailLayout preview={`You've been invited to join ${orgName} on Klorad`}>
      <Text style={paragraph}>Hi,</Text>
      <Text style={paragraph}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{orgName}</strong> on Klorad.
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={invitationUrl}>
          Accept Invitation
        </Button>
      </Section>
      <Text style={paragraph}>
        Or copy and paste this URL into your browser:
        <br />
        <Link href={invitationUrl} style={link}>
          {invitationUrl}
        </Link>
      </Text>
      <Text style={paragraph}>
        This invitation will expire in 7 days. If you don&apos;t have a Klorad
        account yet, you&apos;ll be able to create one when you accept the
        invitation.
      </Text>
    </EmailLayout>
  );
}

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#6366f1",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

