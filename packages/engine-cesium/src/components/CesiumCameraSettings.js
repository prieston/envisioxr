import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Typography, Slider } from "@mui/material";
import { Container, SectionTitle, SettingRow, } from "./CesiumCameraSettings.styles";
import { useSceneStore } from "@envisio/core";
const CesiumCameraSettings = ({ disabled = false, }) => {
    const { cesiumViewer } = useSceneStore();
    const [cameraHeight, setCameraHeight] = useState(1000);
    const [cameraSpeed, setCameraSpeed] = useState(1.0);
    const handleCameraHeightChange = useCallback((height) => {
        if (!cesiumViewer) {
            console.warn("Cesium viewer not available");
            return;
        }
        try {
            // Set camera height above terrain
            const position = cesiumViewer.camera.position;
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            if (cartographic) {
                const newPosition = cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian({
                    longitude: cartographic.longitude,
                    latitude: cartographic.latitude,
                    height: height,
                });
                cesiumViewer.camera.setView({
                    destination: newPosition,
                });
            }
            setCameraHeight(height);
        }
        catch (error) {
            console.error("Error setting camera height:", error);
        }
    }, [cesiumViewer]);
    const handleCameraSpeedChange = useCallback((speed) => {
        if (!cesiumViewer) {
            console.warn("Cesium viewer not available");
            return;
        }
        try {
            // Adjust camera movement speed
            cesiumViewer.scene.screenSpaceCameraController.zoomEventTypes = [
                cesiumViewer.scene.screenSpaceCameraController.zoomEventTypes[0],
            ];
            cesiumViewer.scene.screenSpaceCameraController.zoomAmount = speed;
            setCameraSpeed(speed);
        }
        catch (error) {
            console.error("Error setting camera speed:", error);
        }
    }, [cesiumViewer]);
    // Initialize camera height when component mounts
    useEffect(() => {
        if (cesiumViewer) {
            const position = cesiumViewer.camera.position;
            const cartographic = cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
            if (cartographic) {
                setCameraHeight(cartographic.height);
            }
        }
    }, [cesiumViewer]);
    return (_jsxs(Container, { children: [_jsx(SectionTitle, { children: "Camera Settings" }), _jsxs(SettingRow, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Camera Height (meters)" }), _jsx(Slider, { value: cameraHeight, onChange: (_, value) => handleCameraHeightChange(value), min: 0, max: 10000, step: 100, marks: [
                            { value: 0, label: "0" },
                            { value: 5000, label: "5km" },
                            { value: 10000, label: "10km" },
                        ], disabled: disabled })] }), _jsxs(SettingRow, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Camera Speed" }), _jsx(Slider, { value: cameraSpeed, onChange: (_, value) => handleCameraSpeedChange(value), min: 0.1, max: 5.0, step: 0.1, marks: [
                            { value: 0.1, label: "Slow" },
                            { value: 1.0, label: "Normal" },
                            { value: 5.0, label: "Fast" },
                        ], disabled: disabled })] })] }));
};
export default CesiumCameraSettings;
