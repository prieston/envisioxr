"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  alpha,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  textFieldStyles,
  showToast,
  SendIcon,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useUser from "@/app/hooks/useUser";

const SupportPage = () => {
  const { user } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (!user?.email) {
      showToast("Please sign in to send a support request", "error");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Support Request",
          message: message.trim(),
          userEmail: user.email,
          userName: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send support request");
      }

      showToast("Support request sent successfully! We'll get back to you soon.", "success");
      setMessage("");
    } catch (error) {
      console.error("Error sending support request:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to send support request",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Page>
        <PageHeader title="Support" />
        <PageDescription>
          If you need help with your Klorad workspace, onboarding, or an enterprise deployment, our team is here to assist you.
        </PageDescription>

        <PageContent maxWidth="5xl">
          <PageCard>
            {/* Email Section */}
            <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                    sx={{
                  mb: 2,
                      fontWeight: 600,
                  fontSize: "1rem",
                    }}
                  >
                Contact Us
                  </Typography>
              <Typography
                variant="body1"
                      sx={{
                  fontSize: "0.875rem",
                  color: "text.secondary",
                        mb: 1,
                }}
              >
                For support inquiries, please contact us:
              </Typography>
                        <Typography
                          variant="body1"
              sx={{
                  fontSize: "0.875rem",
                  color: "text.primary",
              }}
            >
                Email:{" "}
                <Link
                  href="mailto:support@klorad.com"
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  support@klorad.com
                </Link>
              </Typography>
            </Box>

            {/* Contact Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                Send us a Message
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      color: "text.primary",
                    }}
                  >
                    Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                  <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    disabled={sending}
                    placeholder="Enter your name"
                    sx={textFieldStyles}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      color: "text.primary",
                    }}
                  >
                    Message <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    multiline
                    rows={6}
                    required
                    disabled={sending}
                    placeholder="Enter your message"
                    sx={textFieldStyles}
                  />
                </Box>

                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                    type="submit"
                      startIcon={
                      sending ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <SendIcon />
                        )
                      }
                    disabled={sending}
                    sx={(theme) => ({
                      borderRadius: `${theme.shape.borderRadius}px`,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#161B20"
                          : theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      padding: "6px 16px",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "#1a1f26"
                            : alpha(theme.palette.primary.main, 0.05),
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                      },
                    })}
                  >
                    {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </Box>
                </Box>
            </Box>

            {/* Optional Links */}
            <Box
              sx={{
                mt: 4,
                pt: 4,
                borderTop: (theme) =>
                  `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                display: "flex",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("FAQ coming soon", "info");
                }}
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
              }}
            >
                FAQ
              </Link>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Documentation coming soon", "info");
                }}
                  sx={{
                  fontSize: "0.75rem",
                    color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                Documentation
              </Link>
            </Box>
          </PageCard>
        </PageContent>
      </Page>
    </>
  );
};

export default SupportPage;
