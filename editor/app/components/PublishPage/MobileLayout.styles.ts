import { styled } from "@mui/material/styles";
import { AppBar } from "@mui/material";

export const TOP_APPBAR_HEIGHT = 56;
export const BOTTOM_BAR_HEIGHT = 64;

export const MobileAppBar = styled(AppBar)(({ theme }) => ({
  position: "fixed",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  backgroundImage: "none",
  boxShadow: "none",
  color: theme.palette.text.primary,
}));

export const MobileSceneContainer = styled("div")<{ height: string }>(
  ({ height }) => ({
    marginTop: TOP_APPBAR_HEIGHT,
    height,
    position: "relative",
  })
);

export const MobileBottomNav = styled("div")(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  boxShadow: theme.shadows[4],
  zIndex: 1300,
}));

export const MobileDetailsContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
}));


