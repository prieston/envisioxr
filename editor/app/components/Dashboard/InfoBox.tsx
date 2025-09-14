import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const BannerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open }) => ({
  width: "100%",
  maxHeight: open ? "200px" : "0px",
  overflow: "hidden",
  backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  border: "1px solid var(--glass-border, rgba(37, 99, 235, 0.3))",
  borderRadius: "16px",
  boxShadow: "var(--glass-shadow, 0 8px 32px rgba(37, 99, 235, 0.15))",
  marginBottom: "24px",
  transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
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
}));

const BannerContent = styled(Box)(() => ({
  padding: "20px 24px",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
}));

const BannerText = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}));

const BannerActions = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "8px",
}));

const InfoBox = ({ onDismiss, open }) => {
  return (
    <BannerContainer open={open}>
      <BannerContent>
        <Box
          sx={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <HelpOutlineIcon
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              fontSize: "20px",
            }}
          />
        </Box>

        <BannerText>
          <Typography
            variant="h6"
            sx={{
              color: "var(--glass-text-primary, #2563eb)",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Welcome to EnvisioXR Dashboard!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "var(--glass-text-secondary, #646464)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Learn how to build immersive scenes with our video tutorials and
            guided walkthroughs.
          </Typography>

          <BannerActions>
            <Button
              variant="outlined"
              size="small"
              onClick={onDismiss}
              sx={{
                borderColor: "var(--glass-border, rgba(37, 99, 235, 0.3))",
                color: "var(--glass-text-primary, #2563eb)",
                fontSize: "0.875rem",
                "&:hover": {
                  borderColor: "var(--glass-text-primary, #2563eb)",
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
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
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  color: "var(--glass-text-primary, #2563eb)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </BannerActions>
        </BannerText>
      </BannerContent>
    </BannerContainer>
  );
};

export default InfoBox;
