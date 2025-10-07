import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export const SettingContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(2),
  backgroundColor: "rgba(248, 250, 252, 0.6)",
  borderRadius: "12px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

export const CustomSettingContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  width: "100%",
  "&:last-child": {
    marginBottom: 0,
  },
}));

export const SettingLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.813rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.75),
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
}));

export const SettingDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  lineHeight: 1.5,
  color: "rgba(100, 116, 139, 0.85)",
  marginBottom: theme.spacing(1.25),
}));
