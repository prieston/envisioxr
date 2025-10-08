import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CardContent, CardActions, Chip, Button, IconButton, Card, Typography, } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
export default function ProjectCard({ project, onGoToBuilder, onMenuOpen, selected, onSelect: _onSelect, }) {
    const getEngineLabel = (engine) => engine === "cesium" ? "Cesium" : "Three.js";
    const handleCardClick = (e) => {
        if (e.target.closest(".menu-button"))
            return;
        onGoToBuilder(project.id);
    };
    const chipStyles = project.engine === "cesium"
        ? {
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            color: "#6366f1",
            border: "1px solid rgba(99, 102, 241, 0.4)",
        }
        : {
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            color: "#f59e0b",
            border: "1px solid rgba(245, 158, 11, 0.4)",
        };
    return (_jsxs(Card, { className: `glass-card ${selected ? "selected" : ""}`, onClick: handleCardClick, sx: {
            width: 300,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px) saturate(130%)",
            WebkitBackdropFilter: "blur(20px) saturate(130%)",
            border: "1px solid rgba(37, 99, 235, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
            transition: "background-color 0.15s ease, border-color 0.15s ease",
            "&:hover": {
                background: "rgba(37, 99, 235, 0.1)",
                // Trigger button underline animation on card hover
                "& .action-button::after": {
                    maxWidth: "100%",
                },
            },
            "&.selected": {
                background: "rgba(37, 99, 235, 0.12)",
                borderColor: "#2563eb",
                boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.15), 0 10px 10px -5px rgba(37, 99, 235, 0.06), 0 0 0 2px rgba(37, 99, 235, 0.2)",
            },
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
                opacity: 0,
                transition: "opacity 0.15s ease",
                pointerEvents: "none",
                zIndex: 1,
            },
            "&:hover::before": {
                opacity: 1,
            },
        }, children: [_jsx(Chip, { label: getEngineLabel(project.engine || "three"), size: "small", sx: Object.assign({ position: "absolute", top: 8, left: 8, fontSize: "0.7rem", height: 20, "& .MuiChip-label": { p: "0 6px" } }, chipStyles) }), _jsxs(CardContent, { className: "glass-card-content", sx: { pb: 2, pt: 4 }, children: [_jsx(Typography, { className: "glass-card-title", variant: "h6", sx: { fontWeight: 600 }, children: project.title }), _jsx(Typography, { className: "glass-card-subtitle", variant: "body2", sx: {
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }, children: project.description || "No description provided" })] }), _jsxs(CardActions, { sx: { px: 2, pb: 2 }, children: [_jsxs(Button, { className: "action-button", size: "small", onClick: () => onGoToBuilder(project.id), sx: {
                            color: "#2563eb",
                            textTransform: "none",
                            position: "relative",
                            overflow: "visible",
                            px: 0,
                            pt: 2,
                            pb: 0.5,
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                            "&::after": {
                                content: '""',
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                width: "100%",
                                maxWidth: 0,
                                height: "1px",
                                background: "#2563eb",
                                transition: "max-width 0.3s ease",
                                borderRadius: 0,
                            },
                            "&:hover::after": { maxWidth: "100%" },
                        }, children: ["Open Project", _jsx(ArrowForwardIcon, { sx: { fontSize: 16, ml: 0.5 } })] }), _jsx(IconButton, { className: "menu-button", size: "small", onClick: (e) => onMenuOpen(e, project.id), sx: {
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "text.secondary",
                        }, children: _jsx(MoreVertIcon, {}) })] })] }));
}
//# sourceMappingURL=ProjectCard.js.map