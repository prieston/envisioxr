"use client";

import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Page, PageContent } from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

interface NoOrganizationAccessProps {
  firstName: string | null;
}

export default function NoOrganizationAccess({
  firstName,
}: NoOrganizationAccessProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com";
  const contactUrl = `${siteUrl}/contact`;

  const handleRequestQuote = () => {
    window.open(contactUrl, "_blank");
  };

  const handleContactUs = async () => {
    try {
      // Use the support API endpoint
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Account Activation Request",
          message: `Hi, I would like to request access to Klorad. My account is not currently linked to any organization.`,
        }),
      });

      if (response.ok) {
        alert("Your message has been sent. We'll get back to you soon!");
      } else {
        // Fallback to opening contact page if API fails
        window.open(contactUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to send support request:", error);
      // Fallback to opening contact page
      window.open(contactUrl, "_blank");
    }
  };

  const displayName = firstName || "there";

  return (
    <>
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Page>
        <PageContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              textAlign: "center",
              gap: 3,
            }}
          >
            <Card
              sx={{
                maxWidth: 700,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#14171A" : "#ffffff",
                border: (theme) =>
                  `1px solid ${
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)"
                  }`,
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Typography
                  variant="h4"
                  sx={(theme) => ({
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.primary.main,
                  })}
                >
                  Hi {displayName},
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.8 }}
                >
                  It seems your account is not linked to any organisation, and
                  you do not have any pending invitations.
                  <br />
                  <br />
                  Klorad is an enterprise platform, and access is provided
                  only through organisation workspaces.
                  <br />
                  <br />
                  To activate your account, please contact our team or request
                  an enterprise quote.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleRequestQuote}
                    sx={{
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 500,
                      borderRadius: 2,
                    }}
                  >
                    Request a Quote
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleContactUs}
                    sx={{
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 500,
                      borderRadius: 2,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.3)"
                          : "rgba(0, 0, 0, 0.3)",
                      "&:hover": {
                        borderColor: (theme) => theme.palette.primary.main,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(107, 156, 216, 0.1)"
                            : "rgba(107, 156, 216, 0.05)",
                      },
                    }}
                  >
                    Contact Us
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </PageContent>
      </Page>
    </>
  );
}

