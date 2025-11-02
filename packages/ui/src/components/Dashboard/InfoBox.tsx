import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export interface InfoBoxProps {
  open: boolean;
  onDismiss: () => void;
}

export default function InfoBox({ onDismiss, open }: InfoBoxProps) {
  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: open ? "200px" : "0px",
        overflow: "hidden",
        backgroundColor: "var(--glass-bg, #14171A)",
        backdropFilter: "blur(20px) saturate(130%)",
        WebkitBackdropFilter: "blur(20px) saturate(130%)",
        border: "1px solid var(--glass-border, rgba(95, 136, 199, 0.3))",
        borderRadius: "16px",
        boxShadow: "var(--glass-shadow, 0 8px 32px rgba(95, 136, 199, 0.15))",
        marginBottom: "24px",
        transition: "max-height 0.2s ease, opacity 0.2s ease",
        opacity: open ? 1 : 0,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          pointerEvents: "none",
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ padding: "20px 24px", display: "flex", gap: "16px" }}>
        <Box
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(95, 136, 199, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <HelpOutlineIcon
            sx={{
              color: "var(--glass-text-primary, #6B9CD8)",
              fontSize: "20px",
            }}
          />
        </Box>

        <Box
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "var(--glass-text-primary, #6B9CD8)",
              fontWeight: 600,
              m: 0,
            }}
          >
            Welcome to EnvisioXR Dashboard!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "var(--glass-text-secondary, #646464)",
              lineHeight: 1.5,
              m: 0,
            }}
          >
            Learn how to build immersive scenes with our video tutorials and
            guided walkthroughs.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              mt: "8px",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={onDismiss}
              sx={{
                borderColor: "var(--glass-border, rgba(95, 136, 199, 0.3))",
                color: "var(--glass-text-primary, #6B9CD8)",
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "var(--glass-text-primary, #6B9CD8)",
                  backgroundColor: "rgba(95, 136, 199, 0.05)",
                },
              }}
            >
              Got it
            </Button>
            <IconButton
              onClick={onDismiss}
              size="small"
              sx={{
                color: "var(--glass-text-secondary, #646464)",
                "&:hover": {
                  backgroundColor: "rgba(95, 136, 199, 0.1)",
                  color: "var(--glass-text-primary, #6B9CD8)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
