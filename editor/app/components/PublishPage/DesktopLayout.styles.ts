import { styled } from "@mui/material/styles";

export const DesktopContainer = styled("div")({
  display: "flex",
  height: "100vh",
});

export const DesktopSidebar = styled("div")(({ theme }) => ({
  width: 300,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderRight: "1px solid rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
}));

export const SidebarContent = styled("div")({
  overflow: "auto",
  height: "100%",
  marginTop: 8,
});

export const ButtonGroupContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const DesktopSceneContainer = styled("div")({
  flexGrow: 1,
  position: "relative",
});

export const Separator = styled("div")({
  borderBottom: "1px solid rgba(159, 159, 159, 0.1)",
  marginBottom: 16,
});


