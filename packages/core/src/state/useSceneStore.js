import { createWithEqualityFn as create } from "zustand/traditional";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
const findIntersectionPoint = (scene, camera) => {
    const raycaster = new THREE.Raycaster();
    const cameraPosition = camera.position.clone();
    const cameraTarget = new THREE.Vector3(0, 0, -1).unproject(camera);
    const direction = cameraTarget.sub(cameraPosition).normalize();
    raycaster.set(cameraPosition, direction);
    const allMeshes = [];
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            allMeshes.push(object);
        }
    });
    const intersects = raycaster.intersectObjects(allMeshes);
    if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        return [hitPoint.x, hitPoint.y, hitPoint.z];
    }
    return [0, 0, 0];
};
const useSceneStore = create((set) => ({
    objects: [],
    observationPoints: [],
    selectedObject: null,
    selectedObservation: null,
    selectedCesiumFeature: null,
    selectedAssetId: "2275207",
    selectedLocation: null,
    orbitControlsRef: null,
    scene: null,
    tilesRenderer: null,
    cesiumIonAssets: [],
    cesiumViewer: null,
    cesiumInstance: null,
    basemapType: "none",
    gridEnabled: true,
    ambientLightIntensity: 0.5,
    skyboxType: "default",
    showTiles: false,
    magnetEnabled: false,
    viewMode: "orbit",
    isThirdPerson: false,
    isPlaying: false,
    playbackSpeed: 1,
    previewIndex: 0,
    addingObservation: false,
    capturingPOV: false,
    previewMode: false,
    transformMode: "translate",
    bottomPanelVisible: false,
    // Time simulation defaults
    cesiumLightingEnabled: false,
    cesiumShadowsEnabled: false,
    cesiumCurrentTime: null,
    setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
    setAmbientLightIntensity: (intensity) => set({ ambientLightIntensity: intensity }),
    setSkyboxType: (type) => set({ skyboxType: type }),
    setShowTiles: (show) => set({ showTiles: show }),
    setMagnetEnabled: (enabled) => set({ magnetEnabled: enabled }),
    setCesiumViewer: (viewer) => set({ cesiumViewer: viewer }),
    setCesiumInstance: (instance) => set({ cesiumInstance: instance }),
    setBasemapType: (type) => set({ basemapType: type }),
    setViewMode: (mode) => set({ viewMode: mode }),
    togglePlayback: () => set((state) => {
        const newIsPlaying = !state.isPlaying;
        // When starting playback, enable preview mode
        // When stopping, disable preview mode
        // If starting playback and no observation is selected, select the first one
        const updates = {
            isPlaying: newIsPlaying,
            previewMode: newIsPlaying,
        };
        if (newIsPlaying && !state.selectedObservation && state.observationPoints.length > 0) {
            updates.selectedObservation = state.observationPoints[0];
            updates.previewIndex = 0;
        }
        return updates;
    }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
    setPreviewIndex: (index) => set({ previewIndex: index }),
    // Time simulation setters
    setCesiumLightingEnabled: (enabled) => set({ cesiumLightingEnabled: enabled }),
    setCesiumShadowsEnabled: (enabled) => set({ cesiumShadowsEnabled: enabled }),
    setCesiumCurrentTime: (time) => set({ cesiumCurrentTime: time }),
    setPreviewMode: (value) => set({ previewMode: value }),
    setTransformMode: (mode) => set({ transformMode: mode }),
    setBottomPanelVisible: (visible) => set({ bottomPanelVisible: visible }),
    setObjects: (newObjects) => set({ objects: newObjects }),
    addModel: (model) => set((state) => {
        var _a;
        try {
        }
        catch (_b) { }
        const camera = (_a = state.orbitControlsRef) === null || _a === void 0 ? void 0 : _a.object;
        let position = [0, 0, 0];
        let coordinateSystem = "local";
        if (state.scene && camera) {
            position = findIntersectionPoint(state.scene, camera);
        }
        else if (model.position) {
            position = model.position;
            const [x, y, z] = model.position;
            const isGeographic = x >= -180 && x <= 180 && y >= -90 && y <= 90 && Math.abs(z) < 50000;
            coordinateSystem = isGeographic ? "geographic" : "local";
        }
        const newModel = {
            id: uuidv4(),
            name: model.name || "",
            url: model.url || "",
            type: model.type || "model",
            position,
            rotation: model.rotation || [0, 0, 0],
            scale: model.scale || [1, 1, 1],
            apiKey: model.apiKey,
            assetId: model.assetId,
            material: model.material || { color: "#ffffff" },
            coordinateSystem,
            isObservationModel: model.isObservationModel || false,
            observationProperties: model.observationProperties,
        };
        const nextObjects = [...state.objects, newModel];
        try {
        }
        catch (_c) { }
        return { objects: nextObjects };
    }),
    selectObject: (id, ref) => set((state) => {
        const found = state.objects.find((obj) => obj.id === id);
        return {
            selectedObject: found ? found : null,
            selectedObservation: null, // Deselect any selected observation
        };
    }),
    removeObject: (id) => set((state) => {
        var _a;
        // Find the object to check if it's a Cesium Ion asset
        const objectToRemove = state.objects.find((obj) => obj.id === id);
        const isCesiumIonAsset = (objectToRemove === null || objectToRemove === void 0 ? void 0 : objectToRemove.type) === "cesium-ion-tileset" ||
            (objectToRemove === null || objectToRemove === void 0 ? void 0 : objectToRemove.type) === "cesiumIonAsset";
        return {
            objects: state.objects.filter((obj) => obj.id !== id),
            selectedObject: ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === id ? null : state.selectedObject,
            // Also remove from cesiumIonAssets if it's a Cesium Ion asset
            cesiumIonAssets: isCesiumIonAsset
                ? state.cesiumIonAssets.filter((asset) => {
                    // Match by assetId (Cesium Ion ID), not internal id
                    return asset.assetId !== objectToRemove.assetId;
                })
                : state.cesiumIonAssets,
        };
    }),
    updateObjectProperty: (id, property, value) => {
        set((state) => {
            var _a;
            const updatedObjects = state.objects.map((obj) => {
                if (obj.id === id) {
                    if (property.includes(".")) {
                        const [parent, child] = property.split(".");
                        if (parent === "observationProperties" &&
                            !obj.observationProperties) {
                            const observationProps = {
                                sensorType: "cone",
                                fov: 60,
                                visibilityRadius: 500,
                                showSensorGeometry: true,
                                showViewshed: false,
                                analysisQuality: "medium",
                                enableTransformEditor: true,
                                alignWithModelFront: true,
                                sensorColor: "#00ff00",
                                viewshedColor: "#0080ff",
                                clearance: 2.0,
                                raysElevation: 8,
                                stepCount: 64,
                            };
                            if (child === "sensorType" &&
                                (value === "cone" || value === "rectangle")) {
                                observationProps.sensorType = value;
                            }
                            else if (child === "analysisQuality" &&
                                (value === "low" || value === "medium" || value === "high")) {
                                observationProps.analysisQuality = value;
                            }
                            else {
                                observationProps[child] = value;
                            }
                            return Object.assign(Object.assign({}, obj), { observationProperties: observationProps });
                        }
                        // Initialize iotProperties with defaults if it doesn't exist
                        if (parent === "iotProperties" && !obj.iotProperties) {
                            const iotProps = {
                                enabled: false,
                                serviceType: "weather",
                                apiEndpoint: "https://api.open-meteo.com/v1/forecast",
                                updateInterval: 2000,
                                showInScene: true,
                                displayFormat: "compact",
                                autoRefresh: true,
                                [child]: value,
                            };
                            return Object.assign(Object.assign({}, obj), { iotProperties: iotProps });
                        }
                        return Object.assign(Object.assign({}, obj), { [parent]: Object.assign(Object.assign({}, (obj[parent] || {})), { [child]: value }) });
                    }
                    if (property === "isObservationModel" &&
                        value === true &&
                        !obj.observationProperties) {
                        return Object.assign(Object.assign({}, obj), { [property]: value, observationProperties: Object.assign({ 
                                // Default properties from the original code
                                sensorType: "cone", fov: 60, visibilityRadius: 500, showSensorGeometry: true, showViewshed: false, analysisQuality: "medium", enableTransformEditor: true, alignWithModelFront: true, sensorColor: "#00ff00", viewshedColor: "#0080ff", clearance: 2.0, raysAzimuth: 120, raysElevation: 8, stepCount: 64 }, (obj.observationProperties || {})) });
                    }
                    return Object.assign(Object.assign({}, obj), { [property]: value });
                }
                return obj;
            });
            const updatedSelectedObject = ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === id
                ? updatedObjects.find((obj) => obj.id === id)
                : state.selectedObject;
            return { objects: updatedObjects, selectedObject: updatedSelectedObject };
        });
    },
    updateModelRef: (id, ref) => set((state) => ({
        objects: state.objects.map((obj) => obj.id === id ? Object.assign(Object.assign({}, obj), { ref }) : obj),
    })),
    deselectObject: () => set({ selectedObject: null }),
    setModelPosition: (id, newPosition) => set((state) => ({
        objects: state.objects.map((obj) => obj.id === id
            ? Object.assign(Object.assign({}, obj), { position: newPosition.toArray() }) : obj),
    })),
    setModelRotation: (id, newRotation) => set((state) => ({
        objects: state.objects.map((obj) => obj.id === id
            ? Object.assign(Object.assign({}, obj), { rotation: [newRotation.x, newRotation.y, newRotation.z] }) : obj),
    })),
    setModelScale: (id, newScale) => set((state) => ({
        objects: state.objects.map((obj) => obj.id === id
            ? Object.assign(Object.assign({}, obj), { scale: [newScale.x, newScale.y, newScale.z] }) : obj),
    })),
    setObservationPoints: (newPoints) => set({ observationPoints: newPoints }),
    addObservationPoint: () => set((state) => {
        const id = Date.now();
        // New observation points start without camera position/target
        // User must explicitly capture camera position using the "Capture Camera Position" button
        const newPoint = {
            id,
            title: "New Observation Point",
            description: "",
            position: null,
            target: null,
        };
        const observationPoints = [...state.observationPoints, newPoint];
        const previewIndex = observationPoints.length - 1;
        return {
            observationPoints,
            selectedObservation: newPoint,
            previewIndex,
        };
    }),
    selectObservation: (id) => set((state) => ({
        selectedObservation: id === null
            ? null
            : state.observationPoints.find((point) => point.id === id),
        selectedObject: null, // Deselect any selected object
    })),
    updateObservationPoint: (id, updates) => set((state) => {
        var _a;
        const updatedPoints = state.observationPoints.map((point) => point.id === id ? Object.assign(Object.assign({}, point), updates) : point);
        const updatedSelected = ((_a = state.selectedObservation) === null || _a === void 0 ? void 0 : _a.id) === id
            ? Object.assign(Object.assign({}, state.selectedObservation), updates) : state.selectedObservation;
        return {
            observationPoints: updatedPoints,
            selectedObservation: updatedSelected,
        };
    }),
    deleteObservationPoint: (id) => set((state) => {
        var _a;
        return ({
            observationPoints: state.observationPoints.filter((point) => point.id !== id),
            selectedObservation: ((_a = state.selectedObservation) === null || _a === void 0 ? void 0 : _a.id) === id ? null : state.selectedObservation,
        });
    }),
    setCapturingPOV: (value) => set({ capturingPOV: value }),
    startPreview: () => set({ previewMode: true, previewIndex: 0 }),
    exitPreview: () => set({ previewMode: false, previewIndex: 0 }),
    nextObservation: () => set((state) => {
        // Can't go next if at last observation or no observations
        if (state.observationPoints.length === 0 ||
            state.previewIndex >= state.observationPoints.length - 1) {
            return state; // No change
        }
        const newIndex = state.previewIndex + 1;
        const nextPoint = state.observationPoints[newIndex];
        return {
            previewIndex: newIndex,
            selectedObservation: nextPoint || state.selectedObservation,
        };
    }),
    prevObservation: () => set((state) => {
        // Can't go prev if at first observation or no observations
        if (state.observationPoints.length === 0 || state.previewIndex <= 0) {
            return state; // No change
        }
        const newIndex = state.previewIndex - 1;
        const prevPoint = state.observationPoints[newIndex];
        return {
            previewIndex: newIndex,
            selectedObservation: prevPoint || state.selectedObservation,
        };
    }),
    resetScene: () => set({
        objects: [],
        observationPoints: [],
        selectedObject: null,
        selectedObservation: null,
        selectedAssetId: "2275207",
        selectedLocation: null,
        previewMode: false,
        previewIndex: 0,
        gridEnabled: true,
        ambientLightIntensity: 0.5,
        skyboxType: "default",
        viewMode: "orbit",
        isPlaying: false,
        playbackSpeed: 1,
        tilesRenderer: null,
        cesiumIonAssets: [],
        cesiumLightingEnabled: false,
        cesiumShadowsEnabled: false,
        cesiumCurrentTime: null,
    }),
    setOrbitControlsRef: (ref) => set({ orbitControlsRef: ref }),
    setScene: (scene) => set({ scene }),
    setTilesRenderer: (renderer) => set({ tilesRenderer: renderer }),
    addGoogleTiles: (apiKey) => set((state) => ({
        objects: [
            ...state.objects,
            {
                id: uuidv4(),
                name: "Google Photorealistic Tiles",
                type: "tiles",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                apiKey,
                component: "TilesRenderer",
            },
        ],
    })),
    addCesiumIonTiles: () => set((state) => ({
        objects: [
            ...state.objects,
            {
                id: uuidv4(),
                name: "Cesium Ion Tiles",
                url: "https://assets.ion.cesium.com/1/",
                type: "tiles",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                assetId: "2275207",
            },
        ],
    })),
    setSelectedAssetId: (assetId) => set({ selectedAssetId: assetId }),
    setSelectedLocation: (location) => set({ selectedLocation: location }),
    controlSettings: {
        carSpeed: 54,
        walkSpeed: 20,
        flightSpeed: 100,
        turnSpeed: 0.02,
        smoothness: 0.05,
    },
    updateControlSettings: (settings) => set((state) => ({
        controlSettings: Object.assign(Object.assign({}, state.controlSettings), settings),
    })),
    isCalculatingVisibility: false,
    lastVisibilityCalculation: null,
    startVisibilityCalculation: (objectId) => set({
        isCalculatingVisibility: true,
        lastVisibilityCalculation: { objectId, timestamp: Date.now() },
    }),
    finishVisibilityCalculation: (_objectId) => set({ isCalculatingVisibility: false }),
    updateWeatherData: (objectId, weatherData) => set((state) => {
        var _a;
        return ({
            objects: state.objects.map((obj) => obj.id === objectId ? Object.assign(Object.assign({}, obj), { weatherData }) : obj),
            selectedObject: ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === objectId
                ? Object.assign(Object.assign({}, state.selectedObject), { weatherData }) : state.selectedObject,
        });
    }),
    addCesiumIonAsset: (asset) => set((state) => ({
        cesiumIonAssets: [...state.cesiumIonAssets, Object.assign(Object.assign({}, asset), { id: uuidv4() })],
    })),
    removeCesiumIonAsset: (id) => set((state) => ({
        cesiumIonAssets: state.cesiumIonAssets.filter((asset) => asset.id !== id),
    })),
    updateCesiumIonAsset: (id, updates) => set((state) => ({
        cesiumIonAssets: state.cesiumIonAssets.map((asset) => asset.id === id ? Object.assign(Object.assign({}, asset), updates) : asset),
    })),
    toggleCesiumIonAsset: (id) => set((state) => ({
        cesiumIonAssets: state.cesiumIonAssets.map((asset) => asset.id === id ? Object.assign(Object.assign({}, asset), { enabled: !asset.enabled }) : asset),
    })),
    setCesiumIonAssets: (assets) => set({ cesiumIonAssets: assets }),
    flyToCesiumIonAsset: (assetId) => {
        const state = useSceneStore.getState();
        const asset = state.cesiumIonAssets.find((a) => a.id === assetId);
        const cesiumViewer = state.cesiumViewer;
        const cesiumInstance = state.cesiumInstance;
        if (!asset || !cesiumViewer || !cesiumInstance) {
            console.warn("Asset, Cesium viewer, or Cesium instance not available for fly-to");
            return;
        }
        const primitives = cesiumViewer.scene.primitives;
        let targetTileset = null;
        for (let i = 0; i < primitives.length; i++) {
            const primitive = primitives.get(i);
            if (primitive &&
                primitive.assetId === parseInt(asset.assetId)) {
                targetTileset = primitive;
                break;
            }
        }
        if (!targetTileset) {
            console.warn(`[CesiumIon] Could not find tileset for asset: ${asset.name} (${asset.assetId})`);
            return;
        }
        try {
            cesiumViewer.flyTo(targetTileset, {
                duration: 2.0,
                offset: new cesiumInstance.HeadingPitchRange(0, -0.5, 1000),
            });
        }
        catch (error) {
            // Error flying to asset
        }
    },
    setSelectedCesiumFeature: (feature) => set({ selectedCesiumFeature: feature }),
}));
export default useSceneStore;
//# sourceMappingURL=useSceneStore.js.map