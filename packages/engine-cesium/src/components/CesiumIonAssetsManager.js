import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Box, Button, Switch, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, } from "@mui/material";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
export default function CesiumIonAssetsManager() {
    const cesiumIonAssets = useSceneStore((s) => s.cesiumIonAssets);
    const addCesiumIonAsset = useSceneStore((s) => s.addCesiumIonAsset);
    const removeCesiumIonAsset = useSceneStore((s) => s.removeCesiumIonAsset);
    const toggleCesiumIonAsset = useSceneStore((s) => s.toggleCesiumIonAsset);
    const flyToCesiumIonAsset = useSceneStore((s) => s.flyToCesiumIonAsset);
    const [assetIdInput, setAssetIdInput] = useState("");
    const [assetNameInput, setAssetNameInput] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [open, setOpen] = useState(false);
    const assets = useMemo(() => cesiumIonAssets || [], [cesiumIonAssets]);
    const handleAdd = () => {
        const cleanId = assetIdInput.trim();
        if (!cleanId)
            return;
        addCesiumIonAsset({
            name: assetNameInput.trim() || `Asset ${cleanId}`,
            apiKey: apiKeyInput.trim() || "",
            assetId: cleanId,
            enabled: true,
        });
        setAssetIdInput("");
        setAssetNameInput("");
        // Keep apiKey for subsequent adds if user wants
        setOpen(false);
    };
    return (_jsxs(SettingContainer, { children: [_jsx(SettingLabel, { children: "Cesium Ion Assets" }), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setOpen(true), children: "Add Asset" }), _jsxs(Dialog, { open: open, onClose: () => setOpen(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: "Add Cesium Ion Asset" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, pt: 2 }, children: [_jsxs(Box, { sx: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }, children: [_jsx(TextField, { size: "small", label: "Asset ID", value: assetIdInput, onChange: (e) => setAssetIdInput(e.target.value), autoFocus: true }), _jsx(TextField, { size: "small", label: "Name (optional)", value: assetNameInput, onChange: (e) => setAssetNameInput(e.target.value) })] }), _jsx(TextField, { size: "small", label: "Ion API Key (optional)", value: apiKeyInput, onChange: (e) => setApiKeyInput(e.target.value) })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleAdd, disabled: !assetIdInput.trim(), variant: "contained", children: "Add" })] })] }), assets.length > 0 && (_jsx(Box, { sx: { mt: 1, display: "flex", flexDirection: "column", gap: 1 }, children: assets.map((a) => (_jsxs(Box, { sx: {
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                    }, children: [_jsx(Switch, { checked: !!a.enabled, onChange: () => toggleCesiumIonAsset(a.id), size: "small" }), _jsxs(Box, { children: [_jsxs(Typography, { variant: "body2", color: "text.primary", children: [a.name || "Ion Asset", " (", a.assetId, ")"] }), a.apiKey ? (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["Key: ", a.apiKey.slice(0, 6), "\u2026"] })) : null] }), _jsx(Button, { size: "small", onClick: () => flyToCesiumIonAsset(a.id), children: "Fly To" }), _jsx(Button, { size: "small", color: "error", onClick: () => removeCesiumIonAsset(a.id), children: "Remove" })] }, a.id))) }))] }));
}
