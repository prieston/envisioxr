import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { Camera, FlightTakeoff, LocationOn } from "@mui/icons-material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import * as THREE from "three";
import useSWR from "swr";
import { localToGeographic } from "@envisio/core/utils";
import {
  getPositionAtScreenPoint,
  flyToCesiumPosition,
} from "@envisio/engine-cesium";
import { flyToThreeObject } from "@envisio/engine-three/components";
import {
  googleMapsLinkForLatLon,
  googleMapsDirectionsLinkLatLon,
  textFieldStyles,
} from "@envisio/ui";
import SDKObservationPropertiesPanel from "./SDKObservationPropertiesPanel";
import IoTDevicePropertiesPanel from "./IoTDevicePropertiesPanel";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";

type Vector3Tuple = [number, number, number];

interface PropertiesPanelProps {
  selectedObject: any;
  selectedObservation: any;
  viewMode: string;
  controlSettings: any;
  updateObjectProperty: (id: string, property: string, value: any) => void;
  updateObservationPoint: (id: number, update: any) => void;
  deleteObservationPoint: (id: number) => void;
  setCapturingPOV: (val: boolean) => void;
  updateControlSettings: (update: any) => void;
}

const PropertyGroup = (props: any) => <Box mb={2}>{props.children}</Box>;
const PropertyLabel = (props: any) => (
  <Typography fontSize="0.875rem" color="text.secondary" mb={0.5}>
    {props.children}
  </Typography>
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ModelMetadata = ({ assetId }: { assetId?: string }) => {
  const { data, error, isLoading } = useSWR(
    assetId ? `/api/models/${assetId}` : null,
    fetcher
  );

  if (!assetId) {
    return (
      <Box
        sx={{
          backgroundColor: "rgba(248, 250, 252, 0.4)",
          borderRadius: "8px",
          border: "1px dashed rgba(226, 232, 240, 0.6)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            fontStyle: "italic",
          }}
        >
          No asset ID available
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Failed to load metadata
      </Alert>
    );
  }

  if (!data?.asset?.metadata || Object.keys(data.asset.metadata).length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: "rgba(248, 250, 252, 0.4)",
          borderRadius: "8px",
          border: "1px dashed rgba(226, 232, 240, 0.6)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            fontStyle: "italic",
          }}
        >
          No descriptive information available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {Object.entries(data.asset.metadata).map(([key, value]) => (
        <Box key={key}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(100, 116, 139, 0.8)",
              mb: 0.5,
            }}
          >
            {key}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(51, 65, 85, 0.9)",
            }}
          >
            {value as string}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  selectedObservation,
  viewMode,
  controlSettings,
  updateObjectProperty,
  updateObservationPoint,
  deleteObservationPoint,
  setCapturingPOV,
  updateControlSettings,
}) => {
  const [localObject, setLocalObject] = useState(selectedObject);
  const [repositioning, setRepositioning] = useState(false);
  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);
  const tilesRenderer = useSceneStore((state) => state.tilesRenderer);
  const scene = useSceneStore((state) => state.scene);
  const observationPoints = useSceneStore((state) => state.observationPoints);

  useEffect(() => {
    if (selectedObject) {
      setLocalObject({
        ...selectedObject,
        position: selectedObject.position || [0, 0, 0],
        rotation: selectedObject.rotation || [0, 0, 0],
        scale: selectedObject.scale || [1, 1, 1],
        isObservationModel: selectedObject.isObservationModel || false,
        observationProperties: selectedObject.isObservationModel
          ? {
              fov: selectedObject.observationProperties?.fov || 90,
              showVisibleArea:
                selectedObject.observationProperties?.showVisibleArea || false,
              showActualArea:
                selectedObject.observationProperties?.showActualArea || false,
              visibilityRadius:
                selectedObject.observationProperties?.visibilityRadius || 100,
            }
          : undefined,
      });
    } else {
      setLocalObject(null);
    }
  }, [selectedObject]);

  const geographicCoords = useMemo(() => {
    if (!localObject?.position) return null;

    const posArray = Array.isArray(localObject.position)
      ? localObject.position
      : [0, 0, 0];
    const [x, y, z] = posArray;
    const coordinateSystem = localObject.coordinateSystem;

    const isGeographic =
      coordinateSystem === "geographic" ||
      (x >= -180 && x <= 180 && y >= -90 && y <= 90 && Math.abs(z) < 50000);

    if (isGeographic) {
      return { longitude: x, latitude: y, altitude: z };
    } else if (tilesRenderer) {
      return localToGeographic(tilesRenderer, new THREE.Vector3(x, y, z));
    } else {
      return { longitude: 139.7454, latitude: 35.6586, altitude: z || 0 };
    }
  }, [localObject?.position, tilesRenderer, localObject?.coordinateSystem]);

  useEffect(() => {
    if (selectedObject?.ref) {
      const updateTransform = () => {
        if (!selectedObject.ref) return;
        const newPosition = selectedObject.ref.position.toArray();
        const newRotation = [
          selectedObject.ref.rotation.x,
          selectedObject.ref.rotation.y,
          selectedObject.ref.rotation.z,
        ];
        const newScale = selectedObject.ref.scale.toArray();

        if (
          JSON.stringify(newPosition) !==
            JSON.stringify(localObject?.position) ||
          JSON.stringify(newRotation) !==
            JSON.stringify(localObject?.rotation) ||
          JSON.stringify(newScale) !== JSON.stringify(localObject?.scale)
        ) {
          setLocalObject((prev) => ({
            ...prev,
            position: newPosition,
            rotation: newRotation,
            scale: newScale,
          }));
        }
      };

      updateTransform();

      let animationFrameId: number;
      const animate = () => {
        updateTransform();
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [
    selectedObject?.ref,
    localObject?.position,
    localObject?.rotation,
    localObject?.scale,
  ]);

  useEffect(() => {
    if (!repositioning) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLCanvasElement;
      if (!target) return;

      const cesiumViewer = useSceneStore.getState().cesiumViewer;

      if (cesiumViewer) {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const positioningResult = getPositionAtScreenPoint(cesiumViewer, x, y, {
          prefer3DTiles: true,
          preferTerrain: true,
          maxTerrainDistance: 1000,
          fallbackToEllipsoid: true,
        });

        if (positioningResult) {
          const newPosition: [number, number, number] =
            positioningResult.position;

          if (selectedObject?.id) {
            updateObjectProperty(selectedObject.id, "position", newPosition);
            updateObjectProperty(
              selectedObject.id,
              "coordinateSystem",
              "geographic"
            );
          }

          setRepositioning(false);
        }
      } else if (orbitControlsRef && scene) {
        const rect = target.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, orbitControlsRef.object);

        const allObjects: THREE.Mesh[] = [];
        scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            allObjects.push(object as THREE.Mesh);
          }
        });

        const intersects = raycaster.intersectObjects(allObjects, true);
        if (intersects.length > 0) {
          const hitPoint = intersects[0].point;
          const newPosition: [number, number, number] = [
            hitPoint.x,
            hitPoint.y,
            hitPoint.z,
          ];

          if (selectedObject?.id) {
            updateObjectProperty(selectedObject.id, "position", newPosition);
            updateObjectProperty(
              selectedObject.id,
              "coordinateSystem",
              "local"
            );
          }

          setRepositioning(false);
        }
      }
    };

    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleClick);
      canvas.style.cursor = "crosshair";
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", handleClick);
        canvas.style.cursor = "auto";
      }
    };
  }, [
    repositioning,
    orbitControlsRef,
    scene,
    selectedObject?.id,
    updateObjectProperty,
  ]);

  const handleReposition = () => setRepositioning(true);
  const handleCancelReposition = () => setRepositioning(false);

  const handlePropertyChange = (
    property: string,
    value: number | string | boolean
  ) => {
    if (selectedObject) {
      setLocalObject((prev) => {
        if (!prev) return prev;
        if (property.includes(".")) {
          const [parent, child] = property.split(".");
          if (parent === "observationProperties") {
            const updated = {
              ...prev,
              observationProperties: {
                ...prev.observationProperties,
                [child]: value,
              },
            };
            return updated;
          }
          const index = parseInt(child);
          if (!isNaN(index)) {
            const prevArray = prev[parent];
            const array = Array.isArray(prevArray) ? [...prevArray] : [];
            (array as any)[index] = value;
            return {
              ...prev,
              [parent]: array,
            } as any;
          }
        }
        return { ...prev, [property]: value } as any;
      });

      if (property.startsWith("observationProperties.")) {
        const propName = property.split(".")[1];
        const updatedProperties = {
          ...selectedObject.observationProperties,
          [propName]: value,
        };
        updateObjectProperty(
          selectedObject.id,
          "observationProperties",
          updatedProperties
        );
      } else {
        updateObjectProperty(selectedObject.id, property, value);
      }
    }
  };

  const handleObservationChange = (
    property: string,
    value: string | Vector3Tuple
  ) => {
    if (selectedObservation) {
      updateObservationPoint(selectedObservation.id, { [property]: value });
    }
  };

  const handleFlyToObject = () => {
    const { engine } = useWorldStore.getState();

    if (engine === "cesium") {
      const { cesiumViewer } = useSceneStore.getState();
      if (cesiumViewer && selectedObject?.position) {
        const longitude =
          geographicCoords?.longitude ?? selectedObject.position[0];
        const latitude =
          geographicCoords?.latitude ?? selectedObject.position[1];
        const height = geographicCoords?.altitude ?? selectedObject.position[2];
        flyToCesiumPosition(cesiumViewer, longitude, latitude, height);
      }
    } else {
      if (selectedObject?.ref && orbitControlsRef) {
        flyToThreeObject(selectedObject.ref, orbitControlsRef);
      }
    }
  };

  if (viewMode === "settings") {
    return (
      <PropertyGroup>
        <Typography variant="subtitle1" gutterBottom>
          Control Settings
        </Typography>
        <PropertyLabel>Car Speed</PropertyLabel>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={controlSettings.carSpeed}
          onChange={(e) =>
            updateControlSettings({ carSpeed: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />
        <PropertyLabel>Walk Speed</PropertyLabel>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={controlSettings.walkSpeed}
          onChange={(e) =>
            updateControlSettings({ walkSpeed: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />
        <PropertyLabel>Flight Speed</PropertyLabel>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={controlSettings.flightSpeed}
          onChange={(e) =>
            updateControlSettings({ flightSpeed: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />
        <PropertyLabel>Turn Speed</PropertyLabel>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={controlSettings.turnSpeed}
          onChange={(e) =>
            updateControlSettings({ turnSpeed: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />
        <PropertyLabel>Smoothness</PropertyLabel>
        <TextField
          fullWidth
          size="small"
          type="number"
          value={controlSettings.smoothness}
          onChange={(e) =>
            updateControlSettings({ smoothness: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />
      </PropertyGroup>
    );
  }

  if (selectedObject) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        }}
      >
        {/* Object Actions */}
        <SettingContainer>
          <SettingLabel>Object Actions</SettingLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleFlyToObject}
              startIcon={<FlightTakeoff />}
              sx={{
                flex: 1,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor: "rgba(37, 99, 235, 0.3)",
                color: "#2563eb",
                padding: "6px 16px",
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                },
              }}
            >
              Fly to Object
            </Button>
            <Button
              variant="outlined"
              onClick={handleReposition}
              startIcon={<LocationOn />}
              sx={{
                flex: 1,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor: "rgba(100, 116, 139, 0.3)",
                color: "rgba(100, 116, 139, 0.8)",
                padding: "6px 16px",
                "&:hover": {
                  borderColor: "rgba(100, 116, 139, 0.5)",
                  backgroundColor: "rgba(100, 116, 139, 0.08)",
                },
              }}
              disabled={repositioning}
              data-testid="reposition-button"
            >
              {repositioning ? "Repositioning..." : "Reposition"}
            </Button>
          </Box>
        </SettingContainer>

        {/* Model Information */}
        <SettingContainer>
          <SettingLabel>Model Information</SettingLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.5,
                }}
              >
                Name
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(51, 65, 85, 0.9)",
                }}
              >
                {selectedObject.name || "Untitled"}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.5,
                }}
              >
                Type
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(51, 65, 85, 0.9)",
                }}
              >
                {selectedObject.type || "Unknown"}
              </Typography>
            </Box>
          </Box>
        </SettingContainer>

        {/* Observation Model Settings */}
        <SettingContainer>
          <SettingLabel>Observation Model</SettingLabel>

          {/* Enable Switch */}
          <Box
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              mb: selectedObject.isObservationModel ? 2 : 0,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={selectedObject.isObservationModel || false}
                  onChange={(e) => {
                    updateObjectProperty(
                      selectedObject.id,
                      "isObservationModel",
                      e.target.checked
                    );
                    if (
                      e.target.checked &&
                      !selectedObject.observationProperties
                    ) {
                      updateObjectProperty(
                        selectedObject.id,
                        "observationProperties.sensorType",
                        "cone"
                      );
                    }
                  }}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#2563eb",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                />
              }
              label="Enable Observation Model"
              sx={{
                margin: 0,
                padding: "8.5px 14px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  color: "rgba(51, 65, 85, 0.9)",
                  flex: 1,
                },
              }}
              labelPlacement="start"
            />
          </Box>

          {/* Sensor Configuration - shown when enabled */}
          {selectedObject.isObservationModel && (
            <SDKObservationPropertiesPanel
              selectedObject={selectedObject}
              onPropertyChange={handlePropertyChange}
              onCalculateViewshed={() => {
                useSceneStore
                  .getState()
                  .startVisibilityCalculation(selectedObject.id);
              }}
              isCalculating={useSceneStore.getState().isCalculatingVisibility}
            />
          )}
        </SettingContainer>

        {repositioning && (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleCancelReposition}
              >
                Cancel
              </Button>
            }
            sx={{ mb: 2 }}
          >
            Click anywhere in the scene to reposition the model
          </Alert>
        )}

        <IoTDevicePropertiesPanel
          selectedObject={selectedObject}
          onPropertyChange={handlePropertyChange}
          geographicCoords={geographicCoords}
        />

        {/* Descriptive Info */}
        <SettingContainer>
          <SettingLabel>Descriptive Info</SettingLabel>
          <ModelMetadata assetId={selectedObject.assetId} />
        </SettingContainer>

        {/* Transform & Location */}
        <SettingContainer>
          <SettingLabel>Transform & Location</SettingLabel>

          {/* View on Google Maps - shown first if coordinates available */}
          {geographicCoords && (
            <Button
              variant="outlined"
              startIcon={<LocationOn />}
              href={googleMapsLinkForLatLon(
                geographicCoords.latitude,
                geographicCoords.longitude
              )}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor: "rgba(37, 99, 235, 0.3)",
                color: "#2563eb",
                padding: "6px 16px",
                mb: 2,
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                },
              }}
            >
              View on Google Maps
            </Button>
          )}

          {/* Position */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Position
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                label="X"
                type="number"
                value={localObject?.position?.[0] || 0}
                onChange={(e) =>
                  handlePropertyChange("position.0", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Y"
                type="number"
                value={localObject?.position?.[1] || 0}
                onChange={(e) =>
                  handlePropertyChange("position.1", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Z"
                type="number"
                value={localObject?.position?.[2] || 0}
                onChange={(e) =>
                  handlePropertyChange("position.2", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
            </Box>
          </Box>

          {/* Geographic Coordinates */}
          {geographicCoords && (
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(100, 116, 139, 0.8)",
                  mb: 0.75,
                }}
              >
                Geographic Coordinates
              </Typography>
              <Box display="flex" gap={1}>
                <TextField
                  label="Latitude"
                  value={geographicCoords.latitude.toFixed(6)}
                  size="small"
                  disabled
                  sx={{ ...textFieldStyles, flex: 1 }}
                />
                <TextField
                  label="Longitude"
                  value={geographicCoords.longitude.toFixed(6)}
                  size="small"
                  disabled
                  sx={{ ...textFieldStyles, flex: 1 }}
                />
                <TextField
                  label="Altitude"
                  value={geographicCoords.altitude.toFixed(2)}
                  size="small"
                  disabled
                  sx={{ ...textFieldStyles, flex: 1 }}
                />
              </Box>
            </Box>
          )}

          {/* Rotation */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Rotation
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                label="X"
                type="number"
                value={localObject?.rotation?.[0] || 0}
                onChange={(e) =>
                  handlePropertyChange("rotation.0", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Y"
                type="number"
                value={localObject?.rotation?.[1] || 0}
                onChange={(e) =>
                  handlePropertyChange("rotation.1", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Z"
                type="number"
                value={localObject?.rotation?.[2] || 0}
                onChange={(e) =>
                  handlePropertyChange("rotation.2", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
            </Box>
          </Box>

          {/* Scale */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Scale
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                label="X"
                type="number"
                value={localObject?.scale?.[0] || 1}
                onChange={(e) =>
                  handlePropertyChange("scale.0", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Y"
                type="number"
                value={localObject?.scale?.[1] || 1}
                onChange={(e) =>
                  handlePropertyChange("scale.1", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
              <TextField
                size="small"
                label="Z"
                type="number"
                value={localObject?.scale?.[2] || 1}
                onChange={(e) =>
                  handlePropertyChange("scale.2", Number(e.target.value))
                }
                sx={{ ...textFieldStyles, flex: 1 }}
              />
            </Box>
          </Box>
        </SettingContainer>

        {/* Material */}
        <SettingContainer>
          <SettingLabel>Material</SettingLabel>
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Color
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="color"
              value={localObject?.material?.color || "#ffffff"}
              onChange={(e) =>
                handlePropertyChange("material.color", e.target.value)
              }
              sx={textFieldStyles}
            />
          </Box>
        </SettingContainer>
      </Box>
    );
  }

  if (selectedObservation) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        }}
      >
        <PropertyGroup>
          <Typography variant="subtitle1" gutterBottom>
            Observation Point Settings
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Title"
            value={selectedObservation.title || ""}
            onChange={(e) => handleObservationChange("title", e.target.value)}
            sx={{ ...textFieldStyles, mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Description"
            multiline
            rows={4}
            value={selectedObservation.description || ""}
            onChange={(e) =>
              handleObservationChange("description", e.target.value)
            }
            sx={{ ...textFieldStyles, mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setCapturingPOV(true)}
            startIcon={<Camera />}
            sx={{ mb: 2 }}
          >
            Capture Camera Position
          </Button>
          {selectedObservation.position && (
            <>
              <PropertyLabel>Position</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObservation.position[0]}
                  onChange={(e) => {
                    const newPosition: Vector3Tuple = [
                      Number(e.target.value),
                      selectedObservation.position![1],
                      selectedObservation.position![2],
                    ];
                    handleObservationChange("position", newPosition);
                  }}
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObservation.position[1]}
                  onChange={(e) => {
                    const newPosition: Vector3Tuple = [
                      selectedObservation.position![0],
                      Number(e.target.value),
                      selectedObservation.position![2],
                    ];
                    handleObservationChange("position", newPosition);
                  }}
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObservation.position[2]}
                  onChange={(e) => {
                    const newPosition: Vector3Tuple = [
                      selectedObservation.position![0],
                      selectedObservation.position![1],
                      Number(e.target.value),
                    ];
                    handleObservationChange("position", newPosition);
                  }}
                />
              </Box>
            </>
          )}
          {selectedObservation.target && (
            <>
              <PropertyLabel>Look At Target</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObservation.target[0]}
                  onChange={(e) => {
                    const newTarget: Vector3Tuple = [
                      Number(e.target.value),
                      selectedObservation.target![1],
                      selectedObservation.target![2],
                    ];
                    handleObservationChange("target", newTarget);
                  }}
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObservation.target[1]}
                  onChange={(e) => {
                    const newTarget: Vector3Tuple = [
                      selectedObservation.target![0],
                      Number(e.target.value),
                      selectedObservation.target![2],
                    ];
                    handleObservationChange("target", newTarget);
                  }}
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObservation.target[2]}
                  onChange={(e) => {
                    const newTarget: Vector3Tuple = [
                      selectedObservation.target![0],
                      selectedObservation.target![1],
                      Number(e.target.value),
                    ];
                    handleObservationChange("target", newTarget);
                  }}
                />
              </Box>
            </>
          )}
          <Button
            color="error"
            onClick={() => deleteObservationPoint(selectedObservation.id)}
            sx={{ mt: 2 }}
          >
            Delete Observation Point
          </Button>
        </PropertyGroup>

        {tilesRenderer && (
          <PropertyGroup>
            <Typography variant="subtitle1" gutterBottom>
              Google Maps Links
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Single Point
              </Typography>
              {selectedObservation.position && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  href={(() => {
                    const coords = localToGeographic(
                      tilesRenderer,
                      new THREE.Vector3(...selectedObservation.position)
                    );
                    return googleMapsLinkForLatLon(
                      coords.latitude,
                      coords.longitude
                    );
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: 2 }}
                >
                  View This Point in Google Maps
                </Button>
              )}

              <Typography variant="subtitle2" gutterBottom>
                All Points
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                href={(() => {
                  const pts =
                    observationPoints
                      ?.filter((p) => p.position)
                      ?.map((p) =>
                        localToGeographic(
                          tilesRenderer,
                          new THREE.Vector3(...p.position!)
                        )
                      )
                      ?.map((c) => ({ lat: c.latitude, lon: c.longitude })) ||
                    [];
                  return googleMapsDirectionsLinkLatLon(pts);
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                View All Points in Google Maps
              </Button>
            </Paper>
          </PropertyGroup>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(248, 250, 252, 0.4)",
          borderRadius: "12px",
          border: "1px dashed rgba(226, 232, 240, 0.6)",
          padding: "32px 24px",
          textAlign: "center",
          maxWidth: "320px",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.813rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.9)",
            mb: 1,
          }}
        >
          No Selection
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            lineHeight: 1.5,
          }}
        >
          Select an object or observation point to view and edit its properties
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;
