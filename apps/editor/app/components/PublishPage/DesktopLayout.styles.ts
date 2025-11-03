import { styled, alpha } from "@mui/material/styles";

export const DesktopContainer = styled("div")({
  position: "relative",
  height: "100vh",
  overflow: "hidden",
});

export const SidebarContent = styled("div")(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  backgroundColor:
    theme.palette.mode === "dark" ? "#14171A" : "rgba(248, 250, 252, 0.6)",
  padding: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.08)
        : "rgba(95, 136, 199, 0.05)",
    borderRadius: "4px",
    margin: "4px 0",
  },
  "&::-webkit-scrollbar-thumb": {
    background:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.24)
        : "rgba(95, 136, 199, 0.2)",
    borderRadius: "4px",
    border: "2px solid transparent",
    backgroundClip: "padding-box",
    transition: "background 0.2s ease",
    "&:hover": {
      background:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.38)
          : "rgba(95, 136, 199, 0.35)",
      backgroundClip: "padding-box",
    },
  },
}));

export const SidebarHeader = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
  flexShrink: 0,
}));

export const ButtonGroupContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
  flexShrink: 0,
}));

export const DesktopSceneContainer = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
});

export const Separator = styled("div")({
  borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
  margin: "16px 0",
});


