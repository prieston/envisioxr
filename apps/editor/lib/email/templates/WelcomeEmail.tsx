/**
 * Welcome email template
 * Sent the first time a user successfully joins their FIRST organization
 */

import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WelcomeEmailProps {
  userName?: string;
  orgName: string;
  dashboardUrl: string;
  docsUrl?: string;
  supportUrl?: string;
}

export function WelcomeEmail({
  userName,
  orgName,
  dashboardUrl,
  docsUrl = "https://docs.klorad.app",
  supportUrl = "https://support.klorad.app",
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Klorad!">
      <Text style={paragraph}>
        {userName ? `Hi ${userName},` : "Hi,"}
      </Text>
      <Text style={paragraph}>
        Welcome to Klorad! We&apos;re excited to have you join <strong>{orgName}</strong>.
      </Text>
      <Text style={paragraph}>
        Klorad helps you create, visualize, and share immersive 3D experiences.
        Get started by exploring your dashboard and creating your first project.
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Go to Dashboard
        </Button>
      </Section>
      <Text style={paragraph}>
        Need help getting started? Check out our{" "}
        <Link href={docsUrl} style={link}>
          documentation
        </Link>{" "}
        or reach out to our{" "}
        <Link href={supportUrl} style={link}>
          support team
        </Link>
        .
      </Text>
      <Text style={paragraph}>Happy building!</Text>
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
};

