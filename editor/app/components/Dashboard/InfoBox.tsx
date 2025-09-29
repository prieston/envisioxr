import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import {
  BannerContainer,
  BannerContent,
  BannerText,
  BannerActions,
} from "./InfoBox.styles";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
