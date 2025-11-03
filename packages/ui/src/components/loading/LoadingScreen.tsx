"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";

const LoadingContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #0a0d10 0%, #14171a 50%, #1a1f24 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
}));

const LoadingCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha("#14171A", 0.95)
      : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 30px rgba(0, 0, 0, 0.4)"
      : "0 0 30px rgba(95, 136, 199, 0.12)",
}));

interface LoadingScreenProps {
  message?: string;
  minimal?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  minimal = false,
}) => {
  // Try to use theme, fallback to inline styles if no theme provider
  let hasTheme = true;
  try {
    useTheme();
  } catch {
    hasTheme = false;
  }

  // Fallback render without theme context
  if (!hasTheme) {
    if (minimal) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(107, 156, 216, 0.2)",
              borderTopColor: "#6B9CD8",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0d10 0%, #14171a 50%, #1a1f24 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            padding: "32px",
            backgroundColor: "rgba(20, 23, 26, 0.95)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid rgba(107, 156, 216, 0.2)",
              borderTopColor: "#6B9CD8",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p
            style={{
              color: "rgba(148, 163, 184, 0.9)",
              fontSize: "15px",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    );
  }

  // Render with theme context
  if (minimal) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={48}
          sx={(theme) => ({
            color: theme.palette.primary.main,
          })}
        />
      </Box>
    );
  }

  return (
    <LoadingContainer>
      <LoadingCard>
        <CircularProgress
          size={48}
          sx={(theme) => ({
            color: theme.palette.primary.main,
          })}
        />
        <Typography
          variant="body1"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: "0.9375rem",
            fontWeight: 500,
          })}
        >
          {message}
        </Typography>
      </LoadingCard>
    </LoadingContainer>
  );
};

