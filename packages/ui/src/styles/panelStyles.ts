import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import type { BoxProps, TypographyProps } from "@mui/material";

export const SettingContainer: React.FC<BoxProps> = styled(Box)(
  ({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor:
      theme.palette.mode === "dark" ? "#14171A" : "rgba(248, 250, 252, 0.6)",
    borderBottom:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.05)"
        : "1px solid rgba(226, 232, 240, 0.8)",
  })
);

export const CustomSettingContainer: React.FC<BoxProps> = styled(Box)(
  ({ theme }) => ({
    width: "100%",
  })
);

export const SettingLabel: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: theme.spacing(1),
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.primary
        : "rgba(51, 65, 85, 0.95)",
  })
);

export const SettingDescription: React.FC<TypographyProps> = styled(Typography)(
  ({ theme }) => ({
    fontSize: "0.75rem", // 12px - descriptions
    fontWeight: 400,
    lineHeight: 1.4,
    color:
      theme.palette.mode === "dark"
        ? "rgba(20, 23, 26, 0.88)"
        : "rgba(100, 116, 139, 0.85)",
    marginBottom: theme.spacing(1.25),
  })
);
