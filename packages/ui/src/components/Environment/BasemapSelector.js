"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button, Box, Typography, ButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";
const Container = styled(Box)(({ theme }) => ({
    "& > *:not(:last-child)": {
        marginBottom: theme.spacing(2),
    },
}));
const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 500,
    marginBottom: theme.spacing(2),
}));
const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
    width: "100%",
    "& .MuiButton-root": {
        flex: 1,
        fontSize: "0.8rem",
        padding: theme.spacing(1),
        textTransform: "none",
    },
}));
const defaultOptions = [
    { value: "cesium", label: "Cesium World Imagery" },
    { value: "google", label: "Google Satellite" },
    { value: "google-photorealistic", label: "Google Photorealistic" },
    { value: "none", label: "No Basemap" },
];
export default function BasemapSelector({ onBasemapChange, currentBasemap = "none", disabled = false, options = defaultOptions, title = "Basemap", }) {
    const [selectedBasemap, setSelectedBasemap] = useState(currentBasemap);
    const handleBasemapChange = (basemapType) => {
        setSelectedBasemap(basemapType);
        onBasemapChange(basemapType);
    };
    if (disabled) {
        return null;
    }
    return (_jsxs(Container, { children: [_jsx(SectionTitle, { children: title }), _jsx(StyledButtonGroup, { orientation: "vertical", variant: "outlined", size: "small", disabled: disabled, children: options.map((option) => (_jsx(Button, { onClick: () => handleBasemapChange(option.value), variant: selectedBasemap === option.value ? "contained" : "outlined", children: option.label }, option.value))) })] }));
}
//# sourceMappingURL=BasemapSelector.js.map