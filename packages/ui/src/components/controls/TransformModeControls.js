"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Button, ButtonGroup, Tooltip, Box, Typography } from "@mui/material";
import { OpenWith as MoveIcon, RotateRight as RotateIcon, AspectRatio as ScaleIcon, } from "@mui/icons-material";
const TransformModeControls = ({ onModeChange, initialMode = "translate", currentMode, }) => {
    const [activeMode, setActiveMode] = useState(initialMode);
    // Update internal state when currentMode prop changes (controlled component pattern)
    useEffect(() => {
        if (currentMode !== undefined) {
            setActiveMode(currentMode);
        }
    }, [currentMode]);
    const handleModeChange = (mode) => {
        // Update local state if not controlled
        if (currentMode === undefined) {
            setActiveMode(mode);
        }
        // Notify parent
        onModeChange(mode);
    };
    return (_jsxs(Box, { sx: {
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: 2,
            padding: 1,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
        }, children: [_jsx(Typography, { variant: "caption", sx: {
                    color: "white",
                    display: "block",
                    textAlign: "center",
                    mb: 1,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                }, children: "Transform Mode" }), _jsxs(ButtonGroup, { variant: "contained", size: "small", sx: {
                    "& .MuiButton-root": {
                        minWidth: 40,
                        height: 32,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&.Mui-selected": {
                            backgroundColor: "rgba(33, 150, 243, 0.8)",
                            "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.9)",
                            },
                        },
                    },
                }, children: [_jsx(Tooltip, { title: "Move (Translate)", arrow: true, children: _jsx(Button, { onClick: () => handleModeChange("translate"), className: activeMode === "translate" ? "Mui-selected" : "", startIcon: _jsx(MoveIcon, { sx: { fontSize: 16 } }), children: "Move" }) }), _jsx(Tooltip, { title: "Rotate", arrow: true, children: _jsx(Button, { onClick: () => handleModeChange("rotate"), className: activeMode === "rotate" ? "Mui-selected" : "", startIcon: _jsx(RotateIcon, { sx: { fontSize: 16 } }), children: "Rotate" }) }), _jsx(Tooltip, { title: "Scale", arrow: true, children: _jsx(Button, { onClick: () => handleModeChange("scale"), className: activeMode === "scale" ? "Mui-selected" : "", startIcon: _jsx(ScaleIcon, { sx: { fontSize: 16 } }), children: "Scale" }) })] })] }));
};
export default TransformModeControls;
//# sourceMappingURL=TransformModeControls.js.map