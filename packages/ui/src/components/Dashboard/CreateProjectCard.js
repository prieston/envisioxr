import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
export default function CreateProjectCard({ onClick, selected, onSelect: _onSelect, }) {
    const handleCardClick = () => {
        _onSelect === null || _onSelect === void 0 ? void 0 : _onSelect();
        onClick === null || onClick === void 0 ? void 0 : onClick();
    };
    return (_jsx(Card, { className: `glass-card ${selected ? "selected" : ""}`, onClick: handleCardClick, sx: {
            width: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px) saturate(130%)",
            WebkitBackdropFilter: "blur(20px) saturate(130%)",
            border: "2px dashed rgba(37, 99, 235, 0.3)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
            transition: "background-color 0.15s ease, border-color 0.15s ease",
            "&:hover": {
                background: "rgba(37, 99, 235, 0.08)",
            },
            "&.selected": {
                background: "rgba(37, 99, 235, 0.15)",
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
        }, children: _jsxs(CardContent, { className: "glass-card-content", sx: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                position: "relative",
                zIndex: 1,
            }, children: [_jsx(Box, { sx: {
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "#2563eb",
                        position: "relative",
                        overflow: "hidden",
                        zIndex: 2,
                    }, children: _jsx(AddIcon, { sx: { fontSize: 32 } }) }), _jsx(Typography, { className: "glass-card-title", variant: "h6", sx: { fontWeight: 600, color: "text.primary" }, children: "Create Project" }), _jsx(Typography, { className: "glass-card-subtitle", variant: "body2", sx: { color: "text.secondary", textAlign: "center" }, children: "Start building your new XR experience" })] }) }));
}
//# sourceMappingURL=CreateProjectCard.js.map