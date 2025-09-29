import { styled } from "@mui/material/styles";
import { Box, Typography, ListItem } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

export const AssetListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: "6px",
  marginBottom: theme.spacing(1),
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
}));
