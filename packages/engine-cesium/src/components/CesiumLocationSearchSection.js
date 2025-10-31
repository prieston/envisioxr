import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from "react";
import { Box } from "@mui/material";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core";
import { LocationSearch } from "@envisio/ui";
const CesiumLocationSearchSection = () => {
    // Use specific selectors to avoid unnecessary re-renders
    const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
    const setSelectedLocation = useSceneStore((state) => state.setSelectedLocation);
    const cesiumViewer = useSceneStore((state) => state.cesiumViewer);
    const handleAssetSelect = useCallback((assetId, latitude, longitude) => {
        setSelectedAssetId(assetId);
        setSelectedLocation({ latitude, longitude });
        // Fly to the selected location in Cesium
        if (cesiumViewer) {
            cesiumViewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000),
                duration: 2.0,
            });
        }
    }, [setSelectedAssetId, setSelectedLocation, cesiumViewer]);
    return (_jsxs(SettingContainer, { children: [_jsx(SettingLabel, { children: "Location Search" }), _jsx(Box, { children: _jsx(LocationSearch, { onAssetSelect: handleAssetSelect }) })] }));
};
export default CesiumLocationSearchSection;
