"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessIcon from "@mui/icons-material/Business";
import { Page, PageContent } from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useOrganizations from "@/app/hooks/useOrganizations";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { organizations, loadingOrganizations: loadingOrgs } = useOrganizations();
  const orgCanceled = searchParams.get("org_canceled") === "true";
  const orgCreated = searchParams.get("org_created") === "true";

  useEffect(() => {
    // If no special query params, redirect to org dashboard
    if (!orgCanceled && !orgCreated && !loadingOrgs && organizations.length > 0) {
      // Find personal org first, or use first org
      const personalOrg = organizations.find((org) => org.isPersonal);
      const defaultOrg = personalOrg || organizations[0];
      if (defaultOrg) {
        router.replace(`/org/${defaultOrg.id}/dashboard`);
      }
    }
  }, [orgCanceled, orgCreated, loadingOrgs, organizations, router]);

  if (orgCanceled) {
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
                minHeight: "60vh",
                textAlign: "center",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(244, 67, 54, 0.1)"
                      : "rgba(244, 67, 54, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <CancelIcon
                  sx={{
                    fontSize: 48,
                    color: (theme) => theme.palette.error.main,
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={(theme) => ({
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.primary.main,
                })}
              >
                Payment Canceled
              </Typography>

              <Card
                sx={{
                  maxWidth: 600,
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
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.7 }}
                  >
                    Your organization creation was canceled. No payment was
                    processed and your organization was not created.
                  </Typography>

                  <Alert
                    severity="info"
                    icon={<BusinessIcon />}
                    sx={{
                      mb: 3,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(33, 150, 243, 0.1)"
                          : "rgba(33, 150, 243, 0.05)",
                      border: (theme) =>
                        `1px solid ${
                          theme.palette.mode === "dark"
                            ? "rgba(33, 150, 243, 0.2)"
                            : "rgba(33, 150, 243, 0.1)"
                        }`,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      Continue with Your Personal Workspace
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You can continue using your personal workspace with all
                      free features. Upgrade to an organization workspace
                      anytime to unlock team collaboration, unlimited projects,
                      and advanced features.
                    </Typography>
                  </Alert>

                  <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (organizations.length > 0) {
                          const personalOrg = organizations.find((org) => org.isPersonal);
                          const defaultOrg = personalOrg || organizations[0];
                          router.push(`/org/${defaultOrg.id}/dashboard`);
                        } else {
                          router.push("/dashboard");
                        }
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        router.push("/dashboard");
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      Try Again
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, maxWidth: 500 }}
              >
                Need help? Contact our support team or visit our documentation
                to learn more about organization workspaces.
              </Typography>
            </Box>
          </PageContent>
        </Page>
      </>
    );
  }

  if (orgCreated) {
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
                minHeight: "60vh",
                textAlign: "center",
                gap: 3,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Redirecting to your organization...
              </Typography>
            </Box>
          </PageContent>
        </Page>
      </>
    );
  }

  // Default: redirect to org dashboard
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
}
