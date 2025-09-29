import { styled } from "@mui/material/styles";
import { Box, Typography, ButtonGroup } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

export const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  width: "100%",
  "& .MuiButton-root": {
    flex: 1,
    fontSize: "0.8rem",
    padding: theme.spacing(1),
    textTransform: "none",
  },
}));

