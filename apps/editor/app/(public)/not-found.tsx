"use client";

import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import { DashboardIcon, HomeIcon } from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
function NotFoundContent() {
  const router = useRouter();

  const handleGoToDashboard = async () => {
    try {
      // Get user's default organization
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        if (userData.user?.organization?.id) {
          router.push(`/org/${userData.user.organization.id}/dashboard`);
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    // Fallback: redirect to root (will redirect to default org dashboard)
    router.push("/");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <>
      {/* Animated background */}
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

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          padding: 3,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* 404 Number */}
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "8rem", sm: "12rem", md: "16rem" },
                  fontWeight: 700,
                  background: "linear-gradient(135deg, rgba(95, 136, 199, 0.3) 0%, rgba(95, 136, 199, 0.1) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  mb: 2,
                }}
              >
                404
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: "120px", sm: "180px", md: "240px" },
                  height: { xs: "120px", sm: "180px", md: "240px" },
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(95, 136, 199, 0.15) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  zIndex: -1,
                }}
              />
            </Box>

            {/* Error Message */}
            <Box sx={{ maxWidth: "600px" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary",
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                }}
              >
                Page Not Found
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  lineHeight: 1.7,
                  mb: 1,
                }}
              >
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  opacity: 0.7,
                }}
              >
                Don&apos;t worry, we&apos;ll get you back on track.
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                width: "100%",
                maxWidth: "400px",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={handleGoToDashboard}
                sx={{
                  flex: 1,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  background: "linear-gradient(135deg, rgba(95, 136, 199, 0.2) 0%, rgba(95, 136, 199, 0.1) 100%)",
                  border: "1px solid rgba(95, 136, 199, 0.3)",
                  color: "primary.main",
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(95, 136, 199, 0.3) 0%, rgba(95, 136, 199, 0.2) 100%)",
                    borderColor: "rgba(95, 136, 199, 0.5)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(95, 136, 199, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Beam Me to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  flex: 1,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: "text.primary",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Go Home
              </Button>
            </Box>

            {/* Additional Help Text */}
            <Box
              sx={{
                mt: 2,
                pt: 4,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                width: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  opacity: 0.6,
                  fontSize: "0.8rem",
                }}
              >
                Error Code: 404 | If you believe this is an error, please contact support
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}

