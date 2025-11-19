/**
 * Support request email template
 * Sent when a user submits a support request
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface SupportRequestEmailProps {
  subject: string;
  message: string;
  userName: string;
  userEmail: string;
}

export function SupportRequestEmail({
  subject,
  message,
  userName,
  userEmail,
}: SupportRequestEmailProps) {
  return (
    <EmailLayout preview={`New Support Request: ${subject}`}>
      <Text style={heading}>New Support Request</Text>
      <Section style={infoSection}>
        <Text style={infoLabel}>From:</Text>
        <Text style={infoValue}>
          {userName || "Unknown"} ({userEmail})
        </Text>
      </Section>
      <Section style={infoSection}>
        <Text style={infoLabel}>Subject:</Text>
        <Text style={infoValue}>{subject}</Text>
      </Section>
      <Section style={messageSection}>
        <Text style={messageLabel}>Message:</Text>
        <Text style={messageText}>{message}</Text>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  color: "#6B9CD8",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px",
};

const infoSection = {
  marginBottom: "16px",
};

const infoLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const infoValue = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const messageSection = {
  marginTop: "24px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
};

const messageLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const messageText = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};


