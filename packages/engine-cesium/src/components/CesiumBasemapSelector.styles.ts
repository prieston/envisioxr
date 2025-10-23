import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1.5),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.813rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.75),
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
}));
