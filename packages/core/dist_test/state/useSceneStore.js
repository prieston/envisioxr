"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var traditional_1 = require("zustand/traditional");
var THREE = require("three");
var uuid_1 = require("uuid");
var findIntersectionPoint = function (scene, camera) {
    var raycaster = new THREE.Raycaster();
    var cameraPosition = camera.position.clone();
    var cameraTarget = new THREE.Vector3(0, 0, -1).unproject(camera);
    var direction = cameraTarget.sub(cameraPosition).normalize();
    raycaster.set(cameraPosition, direction);
    var allMeshes = [];
    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            allMeshes.push(object);
        }
    });
    var intersects = raycaster.intersectObjects(allMeshes);
    if (intersects.length > 0) {
        var hitPoint = intersects[0].point;
        return [hitPoint.x, hitPoint.y, hitPoint.z];
    }
    return [0, 0, 0];
};
var useSceneStore = (0, traditional_1.createWithEqualityFn)(function (set) { return ({
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
    setGridEnabled: function (enabled) { return set({ gridEnabled: enabled }); },
    setAmbientLightIntensity: function (intensity) {
        return set({ ambientLightIntensity: intensity });
    },
    setSkyboxType: function (type) { return set({ skyboxType: type }); },
    setShowTiles: function (show) { return set({ showTiles: show }); },
    setMagnetEnabled: function (enabled) { return set({ magnetEnabled: enabled }); },
    setCesiumViewer: function (viewer) { return set({ cesiumViewer: viewer }); },
    setCesiumInstance: function (instance) { return set({ cesiumInstance: instance }); },
    setBasemapType: function (type) { return set({ basemapType: type }); },
    setViewMode: function (mode) { return set({ viewMode: mode }); },
    togglePlayback: function () {
        return set(function (state) {
            var newIsPlaying = !state.isPlaying;
            // When starting playback, enable preview mode
            // When stopping, disable preview mode
            // If starting playback and no observation is selected, select the first one
            var updates = {
                isPlaying: newIsPlaying,
                previewMode: newIsPlaying,
            };
            if (newIsPlaying && !state.selectedObservation && state.observationPoints.length > 0) {
                updates.selectedObservation = state.observationPoints[0];
                updates.previewIndex = 0;
            }
            return updates;
        });
    },
    setPlaybackSpeed: function (speed) { return set({ playbackSpeed: speed }); },
    setPreviewIndex: function (index) { return set({ previewIndex: index }); },
    // Time simulation setters
    setCesiumLightingEnabled: function (enabled) {
        return set({ cesiumLightingEnabled: enabled });
    },
    setCesiumShadowsEnabled: function (enabled) { return set({ cesiumShadowsEnabled: enabled }); },
    setCesiumCurrentTime: function (time) { return set({ cesiumCurrentTime: time }); },
    setPreviewMode: function (value) { return set({ previewMode: value }); },
    setTransformMode: function (mode) { return set({ transformMode: mode }); },
    setBottomPanelVisible: function (visible) { return set({ bottomPanelVisible: visible }); },
    setObjects: function (newObjects) { return set({ objects: newObjects }); },
    addModel: function (model) {
        return set(function (state) {
            var _a;
            try {
            }
            catch (_b) { }
            var camera = (_a = state.orbitControlsRef) === null || _a === void 0 ? void 0 : _a.object;
            var position = [0, 0, 0];
            var coordinateSystem = "local";
            if (state.scene && camera) {
                position = findIntersectionPoint(state.scene, camera);
            }
            else if (model.position) {
                position = model.position;
                var _c = model.position, x = _c[0], y = _c[1], z = _c[2];
                var isGeographic = x >= -180 && x <= 180 && y >= -90 && y <= 90 && Math.abs(z) < 50000;
                coordinateSystem = isGeographic ? "geographic" : "local";
            }
            var newModel = {
                id: (0, uuid_1.v4)(),
                name: model.name || "",
                url: model.url || "",
                type: model.type || "model",
                position: position,
                rotation: model.rotation || [0, 0, 0],
                scale: model.scale || [1, 1, 1],
                apiKey: model.apiKey,
                assetId: model.assetId,
                material: model.material || { color: "#ffffff" },
                coordinateSystem: coordinateSystem,
                isObservationModel: model.isObservationModel || false,
                observationProperties: model.observationProperties,
            };
            var nextObjects = __spreadArray(__spreadArray([], state.objects, true), [newModel], false);
            try {
            }
            catch (_d) { }
            return { objects: nextObjects };
        });
    },
    selectObject: function (id, ref) {
        return set(function (state) {
            var found = state.objects.find(function (obj) { return obj.id === id; });
            return {
                selectedObject: found ? found : null,
                selectedObservation: null, // Deselect any selected observation
            };
        });
    },
    removeObject: function (id) {
        return set(function (state) {
            var _a;
            // Find the object to check if it's a Cesium Ion asset
            var objectToRemove = state.objects.find(function (obj) { return obj.id === id; });
            var isCesiumIonAsset = (objectToRemove === null || objectToRemove === void 0 ? void 0 : objectToRemove.type) === "cesium-ion-tileset" ||
                (objectToRemove === null || objectToRemove === void 0 ? void 0 : objectToRemove.type) === "cesiumIonAsset";
            return {
                objects: state.objects.filter(function (obj) { return obj.id !== id; }),
                selectedObject: ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === id ? null : state.selectedObject,
                // Also remove from cesiumIonAssets if it's a Cesium Ion asset
                cesiumIonAssets: isCesiumIonAsset
                    ? state.cesiumIonAssets.filter(function (asset) {
                        // Match by assetId (Cesium Ion ID), not internal id
                        return asset.assetId !== objectToRemove.assetId;
                    })
                    : state.cesiumIonAssets,
            };
        });
    },
    updateObjectProperty: function (id, property, value) {
        set(function (state) {
            var _a;
            var updatedObjects = state.objects.map(function (obj) {
                var _a, _b, _c, _d, _e;
                if (obj.id === id) {
                    if (property.includes(".")) {
                        var _f = property.split("."), parent_1 = _f[0], child = _f[1];
                        if (parent_1 === "observationProperties" &&
                            !obj.observationProperties) {
                            var observationProps = {
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
                            return __assign(__assign({}, obj), { observationProperties: observationProps });
                        }
                        // Initialize iotProperties with defaults if it doesn't exist
                        if (parent_1 === "iotProperties" && !obj.iotProperties) {
                            var iotProps = (_a = {
                                    enabled: false,
                                    serviceType: "weather",
                                    apiEndpoint: "https://api.open-meteo.com/v1/forecast",
                                    updateInterval: 2000,
                                    showInScene: true,
                                    displayFormat: "compact",
                                    autoRefresh: true
                                },
                                _a[child] = value,
                                _a);
                            return __assign(__assign({}, obj), { iotProperties: iotProps });
                        }
                        return __assign(__assign({}, obj), (_b = {}, _b[parent_1] = __assign(__assign({}, (obj[parent_1] || {})), (_c = {}, _c[child] = value, _c)), _b));
                    }
                    if (property === "isObservationModel" &&
                        value === true &&
                        !obj.observationProperties) {
                        return __assign(__assign({}, obj), (_d = {}, _d[property] = value, _d.observationProperties = __assign({ 
                            // Default properties from the original code
                            sensorType: "cone", fov: 60, visibilityRadius: 500, showSensorGeometry: true, showViewshed: false, analysisQuality: "medium", enableTransformEditor: true, alignWithModelFront: true, sensorColor: "#00ff00", viewshedColor: "#0080ff", clearance: 2.0, raysAzimuth: 120, raysElevation: 8, stepCount: 64 }, (obj.observationProperties || {})), _d));
                    }
                    return __assign(__assign({}, obj), (_e = {}, _e[property] = value, _e));
                }
                return obj;
            });
            var updatedSelectedObject = ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === id
                ? updatedObjects.find(function (obj) { return obj.id === id; })
                : state.selectedObject;
            return { objects: updatedObjects, selectedObject: updatedSelectedObject };
        });
    },
    updateModelRef: function (id, ref) {
        return set(function (state) { return ({
            objects: state.objects.map(function (obj) {
                return obj.id === id ? __assign(__assign({}, obj), { ref: ref }) : obj;
            }),
        }); });
    },
    deselectObject: function () { return set({ selectedObject: null }); },
    setModelPosition: function (id, newPosition) {
        return set(function (state) { return ({
            objects: state.objects.map(function (obj) {
                return obj.id === id
                    ? __assign(__assign({}, obj), { position: newPosition.toArray() }) : obj;
            }),
        }); });
    },
    setModelRotation: function (id, newRotation) {
        return set(function (state) { return ({
            objects: state.objects.map(function (obj) {
                return obj.id === id
                    ? __assign(__assign({}, obj), { rotation: [newRotation.x, newRotation.y, newRotation.z] }) : obj;
            }),
        }); });
    },
    setModelScale: function (id, newScale) {
        return set(function (state) { return ({
            objects: state.objects.map(function (obj) {
                return obj.id === id
                    ? __assign(__assign({}, obj), { scale: [newScale.x, newScale.y, newScale.z] }) : obj;
            }),
        }); });
    },
    setObservationPoints: function (newPoints) { return set({ observationPoints: newPoints }); },
    addObservationPoint: function () {
        return set(function (state) {
            var id = Date.now();
            // New observation points start without camera position/target
            // User must explicitly capture camera position using the "Capture Camera Position" button
            var newPoint = {
                id: id,
                title: "New Observation Point",
                description: "",
                position: null,
                target: null,
            };
            var observationPoints = __spreadArray(__spreadArray([], state.observationPoints, true), [newPoint], false);
            var previewIndex = observationPoints.length - 1;
            return {
                observationPoints: observationPoints,
                selectedObservation: newPoint,
                previewIndex: previewIndex,
            };
        });
    },
    selectObservation: function (id) {
        return set(function (state) { return ({
            selectedObservation: id === null
                ? null
                : state.observationPoints.find(function (point) { return point.id === id; }),
            selectedObject: null, // Deselect any selected object
        }); });
    },
    updateObservationPoint: function (id, updates) {
        return set(function (state) {
            var _a;
            var updatedPoints = state.observationPoints.map(function (point) {
                return point.id === id ? __assign(__assign({}, point), updates) : point;
            });
            var updatedSelected = ((_a = state.selectedObservation) === null || _a === void 0 ? void 0 : _a.id) === id
                ? __assign(__assign({}, state.selectedObservation), updates) : state.selectedObservation;
            return {
                observationPoints: updatedPoints,
                selectedObservation: updatedSelected,
            };
        });
    },
    deleteObservationPoint: function (id) {
        return set(function (state) {
            var _a;
            return ({
                observationPoints: state.observationPoints.filter(function (point) { return point.id !== id; }),
                selectedObservation: ((_a = state.selectedObservation) === null || _a === void 0 ? void 0 : _a.id) === id ? null : state.selectedObservation,
            });
        });
    },
    setCapturingPOV: function (value) { return set({ capturingPOV: value }); },
    startPreview: function () { return set({ previewMode: true, previewIndex: 0 }); },
    exitPreview: function () { return set({ previewMode: false, previewIndex: 0 }); },
    nextObservation: function () {
        return set(function (state) {
            // Can't go next if at last observation or no observations
            if (state.observationPoints.length === 0 ||
                state.previewIndex >= state.observationPoints.length - 1) {
                return state; // No change
            }
            var newIndex = state.previewIndex + 1;
            var nextPoint = state.observationPoints[newIndex];
            return {
                previewIndex: newIndex,
                selectedObservation: nextPoint || state.selectedObservation,
            };
        });
    },
    prevObservation: function () {
        return set(function (state) {
            // Can't go prev if at first observation or no observations
            if (state.observationPoints.length === 0 || state.previewIndex <= 0) {
                return state; // No change
            }
            var newIndex = state.previewIndex - 1;
            var prevPoint = state.observationPoints[newIndex];
            return {
                previewIndex: newIndex,
                selectedObservation: prevPoint || state.selectedObservation,
            };
        });
    },
    resetScene: function () {
        return set({
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
        });
    },
    setOrbitControlsRef: function (ref) { return set({ orbitControlsRef: ref }); },
    setScene: function (scene) { return set({ scene: scene }); },
    setTilesRenderer: function (renderer) { return set({ tilesRenderer: renderer }); },
    addGoogleTiles: function (apiKey) {
        return set(function (state) { return ({
            objects: __spreadArray(__spreadArray([], state.objects, true), [
                {
                    id: (0, uuid_1.v4)(),
                    name: "Google Photorealistic Tiles",
                    type: "tiles",
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1],
                    apiKey: apiKey,
                    component: "TilesRenderer",
                },
            ], false),
        }); });
    },
    addCesiumIonTiles: function () {
        return set(function (state) { return ({
            objects: __spreadArray(__spreadArray([], state.objects, true), [
                {
                    id: (0, uuid_1.v4)(),
                    name: "Cesium Ion Tiles",
                    url: "https://assets.ion.cesium.com/1/",
                    type: "tiles",
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1],
                    assetId: "2275207",
                },
            ], false),
        }); });
    },
    setSelectedAssetId: function (assetId) { return set({ selectedAssetId: assetId }); },
    setSelectedLocation: function (location) { return set({ selectedLocation: location }); },
    controlSettings: {
        carSpeed: 54,
        walkSpeed: 20,
        flightSpeed: 100,
        turnSpeed: 0.02,
        smoothness: 0.05,
    },
    updateControlSettings: function (settings) {
        return set(function (state) { return ({
            controlSettings: __assign(__assign({}, state.controlSettings), settings),
        }); });
    },
    isCalculatingVisibility: false,
    lastVisibilityCalculation: null,
    startVisibilityCalculation: function (objectId) {
        return set({
            isCalculatingVisibility: true,
            lastVisibilityCalculation: { objectId: objectId, timestamp: Date.now() },
        });
    },
    finishVisibilityCalculation: function (_objectId) {
        return set({ isCalculatingVisibility: false });
    },
    updateWeatherData: function (objectId, weatherData) {
        return set(function (state) {
            var _a;
            return ({
                objects: state.objects.map(function (obj) {
                    return obj.id === objectId ? __assign(__assign({}, obj), { weatherData: weatherData }) : obj;
                }),
                selectedObject: ((_a = state.selectedObject) === null || _a === void 0 ? void 0 : _a.id) === objectId
                    ? __assign(__assign({}, state.selectedObject), { weatherData: weatherData }) : state.selectedObject,
            });
        });
    },
    addCesiumIonAsset: function (asset) {
        return set(function (state) { return ({
            cesiumIonAssets: __spreadArray(__spreadArray([], state.cesiumIonAssets, true), [__assign(__assign({}, asset), { id: (0, uuid_1.v4)() })], false),
        }); });
    },
    removeCesiumIonAsset: function (id) {
        return set(function (state) { return ({
            cesiumIonAssets: state.cesiumIonAssets.filter(function (asset) { return asset.id !== id; }),
        }); });
    },
    updateCesiumIonAsset: function (id, updates) {
        return set(function (state) { return ({
            cesiumIonAssets: state.cesiumIonAssets.map(function (asset) {
                return asset.id === id ? __assign(__assign({}, asset), updates) : asset;
            }),
        }); });
    },
    toggleCesiumIonAsset: function (id) {
        return set(function (state) { return ({
            cesiumIonAssets: state.cesiumIonAssets.map(function (asset) {
                return asset.id === id ? __assign(__assign({}, asset), { enabled: !asset.enabled }) : asset;
            }),
        }); });
    },
    setCesiumIonAssets: function (assets) { return set({ cesiumIonAssets: assets }); },
    flyToCesiumIonAsset: function (assetId) {
        var state = useSceneStore.getState();
        var asset = state.cesiumIonAssets.find(function (a) { return a.id === assetId; });
        var cesiumViewer = state.cesiumViewer;
        var cesiumInstance = state.cesiumInstance;
        if (!asset || !cesiumViewer || !cesiumInstance) {
            console.warn("Asset, Cesium viewer, or Cesium instance not available for fly-to");
            return;
        }
        var primitives = cesiumViewer.scene.primitives;
        var targetTileset = null;
        for (var i = 0; i < primitives.length; i++) {
            var primitive = primitives.get(i);
            if (primitive &&
                primitive.assetId === parseInt(asset.assetId)) {
                targetTileset = primitive;
                break;
            }
        }
        if (!targetTileset) {
            console.warn("[CesiumIon] Could not find tileset for asset: ".concat(asset.name, " (").concat(asset.assetId, ")"));
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
    setSelectedCesiumFeature: function (feature) {
        return set({ selectedCesiumFeature: feature });
    },
}); });
exports.default = useSceneStore;
