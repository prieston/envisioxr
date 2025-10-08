import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
export const ViewModeSection = styled(Box, {
    shouldForwardProp: (prop) => prop !== "previewMode",
})(({ theme, previewMode }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    height: "100%",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.15s ease, filter 0.15s ease",
}));
export const ViewModeRow = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
}));
export const ViewModeButton = styled(Button)(({ theme }) => ({
    minWidth: 40,
    height: 40,
    padding: theme.spacing(0.5),
    borderRadius: "8px", // Design system: 8px for clickable items
    backgroundColor: "transparent",
    color: "rgba(51, 65, 85, 0.7)", // Design system color
    border: "none",
    boxShadow: "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": {
        backgroundColor: "rgba(37, 99, 235, 0.08)", // Blue tint on hover
        color: "#2563eb",
    },
    "&.active": {
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        color: "#2563eb",
        "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.16)",
        },
    },
    "& .MuiSvgIcon-root": {
        fontSize: "1.2rem",
    },
}));
//# sourceMappingURL=ViewModeControls.styles.js.map