/**
 * Contact form email template
 * Sent when someone submits the contact form on the website
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface ContactFormEmailProps {
  name: string;
  email: string;
  organization: string;
  role: string;
  context: string;
}

export function ContactFormEmail({
  name,
  email,
  organization,
  role,
  context,
}: ContactFormEmailProps) {
  return (
    <EmailLayout preview={`New Contact Form Submission from ${name}`}>
      <Text style={heading}>New Contact Form Submission</Text>
      
      <Section style={infoSection}>
        <Text style={infoLabel}>Name:</Text>
        <Text style={infoValue}>{name}</Text>
      </Section>

      <Section style={infoSection}>
        <Text style={infoLabel}>Email:</Text>
        <Text style={infoValue}>
          <a href={`mailto:${email}`} style={link}>
            {email}
          </a>
        </Text>
      </Section>

      <Section style={infoSection}>
        <Text style={infoLabel}>Organization:</Text>
        <Text style={infoValue}>{organization}</Text>
      </Section>

      <Section style={infoSection}>
        <Text style={infoLabel}>Role:</Text>
        <Text style={infoValue}>{role}</Text>
      </Section>

      <Section style={messageSection}>
        <Text style={messageLabel}>Environment / Project Context:</Text>
        <Text style={messageText}>{context}</Text>
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

const link = {
  color: "#6366f1",
  textDecoration: "underline",
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

