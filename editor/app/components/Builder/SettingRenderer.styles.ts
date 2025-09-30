import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export const SettingContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  "&:last-child": {
    marginBottom: 0,
  },
}));

export const CustomSettingContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

export const SettingLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.primary,
}));

export const SettingDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.8rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

