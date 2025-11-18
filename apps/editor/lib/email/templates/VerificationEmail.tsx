/**
 * Email verification email template
 * Sent when a user signs up with email/password
 */

import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface VerificationEmailProps {
  verificationUrl: string;
  userName?: string;
}

export function VerificationEmail({
  verificationUrl,
  userName,
}: VerificationEmailProps) {
  return (
    <EmailLayout preview="Verify your email address to complete your Klorad account">
      <Text style={paragraph}>
        {userName ? `Hi ${userName},` : "Hi,"}
      </Text>
      <Text style={paragraph}>
        Welcome to Klorad! Please verify your email address to complete your
        account setup.
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>
      <Text style={paragraph}>
        Or copy and paste this URL into your browser:
        <br />
        <Link href={verificationUrl} style={link}>
          {verificationUrl}
        </Link>
      </Text>
      <Text style={paragraph}>
        This link will expire in 24 hours. If you didn&apos;t create an account,
        you can safely ignore this email.
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

