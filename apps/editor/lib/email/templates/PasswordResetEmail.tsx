/**
 * Password reset email template
 * Sent when a user requests a password reset
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface PasswordResetEmailProps {
  resetCode: string;
  userName?: string;
}

export function PasswordResetEmail({
  resetCode,
  userName,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your Klorad password">
      <Text style={paragraph}>
        {userName ? `Hi ${userName},` : "Hi,"}
      </Text>
      <Text style={paragraph}>
        We received a request to reset your password. Use the code below to
        reset your password:
      </Text>
      <Section style={codeContainer}>
        <Text style={code}>{resetCode}</Text>
      </Section>
      <Text style={paragraph}>
        Enter this code on the password reset page to create a new password.
      </Text>
      <Text style={paragraph}>
        This code will expire in 1 hour. If you didn&apos;t request a password
        reset, you can safely ignore this email.
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

const codeContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
};

const code = {
  color: "#111827",
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  fontFamily: "monospace",
  margin: "0",
  textAlign: "center" as const,
};

