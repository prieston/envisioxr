import React, { useEffect, useState } from "react";
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
  Slider,
} from "@mui/material";
import { Camera, FlightTakeoff } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";
import useWorldStore from "../../hooks/useWorldStore";
import * as THREE from "three";
import * as Cesium from "cesium";
import useSWR from "swr";
import { localToGeographic } from "../../utils/coordinateUtils";
import SDKObservationPropertiesPanel from "./SDKObservationPropertiesPanel";

// Types for props
// You may want to import these from your types file

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

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Component to display model metadata
const ModelMetadata = ({ assetId }: { assetId?: string }) => {
  const { data, error, isLoading } = useSWR(
    assetId ? `/api/models/${assetId}` : null,
    fetcher
  );

  if (!assetId) {
    return null;
  }
  if (isLoading) {
    return <CircularProgress size={20} />;
  }
  if (error) {
    return <Typography color="error">Failed to load metadata</Typography>;
  }
  if (!data?.asset?.metadata) {
    return null;
  }

  return (
    <Box sx={{ mt: 1 }}>
      {Object.entries(data.asset.metadata).map(([key, value]) => (
        <Box key={key} sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
            {key}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
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
  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);
  const tilesRenderer = useSceneStore((state) => state.tilesRenderer);
  const observationPoints = useSceneStore((state) => state.observationPoints);

  // Update local state when selectedObject changes or when its transform properties change
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

  // Calculate geographic coordinates if we have a reference location and tilesRenderer
  const geographicCoords =
    tilesRenderer && localObject?.position
      ? localToGeographic(
          tilesRenderer,
          new THREE.Vector3(...localObject.position)
        )
      : null;

  // Add a separate effect to handle transform updates
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

        // Only update if values have changed
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

      // Update immediately
      updateTransform();

      // Set up an animation frame loop for smooth updates
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

  const handlePropertyChange = (
    property: string,
    value: number | string | boolean
  ) => {
    if (selectedObject) {
      // Update local state immediately for responsive UI
      setLocalObject((prev) => {
        if (!prev) return prev;

        // Handle nested properties (e.g., "position.0", "observationProperties.fov")
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
          // Handle array indices (e.g., "position.0")
          const index = parseInt(child);
          if (!isNaN(index)) {
            const array = [...(prev[parent] || [])];
            array[index] = value;
            return {
              ...prev,
              [parent]: array,
            };
          }
        }

        return {
          ...prev,
          [property]: value,
        };
      });

      // Update global state
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
      // Cesium fly-to logic
      const { cesiumViewer } = useSceneStore.getState();
      if (cesiumViewer && selectedObject?.position) {
        const [longitude, latitude, height] = selectedObject.position;

        // Use Cesium's built-in flyTo with a bounding sphere approach
        const modelPosition = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        );

        // Create a bounding sphere around the model for better viewing
        const boundingSphere = new Cesium.BoundingSphere(modelPosition, 50); // 50m radius

        // Fly to the bounding sphere with a good viewing angle
        cesiumViewer.camera.flyToBoundingSphere(boundingSphere, {
          duration: 2.0,
          offset: new Cesium.HeadingPitchRange(
            0.0, // heading
            -Cesium.Math.PI_OVER_FOUR, // pitch (45 degrees down)
            100.0 // range (distance from target)
          ),
        });

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[PropertiesPanel] Flying to Cesium model at: ${longitude}, ${latitude}, ${height}`
          );
        }
      }
    } else {
      // Three.js fly-to logic
      if (selectedObject?.ref && orbitControlsRef) {
        // Get the object's position and bounding box
        const targetPosition = selectedObject.ref.position.clone();
        const boundingBox = new THREE.Box3().setFromObject(selectedObject.ref);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        // Calculate a dynamic offset based on the object's size
        const maxDimension = Math.max(size.x, size.y, size.z);
        const distance = Math.max(maxDimension * 2.5, 15); // Increased distance for better view

        // Create a more natural viewing angle offset
        const offset = new THREE.Vector3(
          distance * 0.7, // Slightly closer on X axis
          distance * 0.8, // Higher up for better perspective
          distance * 0.7 // Slightly closer on Z axis
        );

        // Set the camera position
        orbitControlsRef.object.position.copy(targetPosition).add(offset);

        // Set the orbit controls target to the object center
        orbitControlsRef.target.copy(targetPosition);

        // Make the camera look at the target
        orbitControlsRef.object.lookAt(targetPosition);

        // Update the controls
        orbitControlsRef.update();

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[PropertiesPanel] Flying to Three.js model at: ${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z}`
          );
        }
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
      <>
        <PropertyGroup>
          <Typography variant="subtitle1" gutterBottom>
            Model Information
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Name: {selectedObject.name || "Untitled"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {selectedObject.type || "Unknown"}
            </Typography>
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
                    // If enabling observation model and no properties exist, initialize them
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
                />
              }
              label="Observation Model"
            />
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleFlyToObject}
              startIcon={<FlightTakeoff />}
              sx={{ mt: 2 }}
            >
              Fly to Object
            </Button>
          </Paper>
        </PropertyGroup>

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

        <PropertyGroup>
          <Typography variant="subtitle1" gutterBottom>
            Descriptive Info
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <ModelMetadata assetId={selectedObject.assetId} />
          </Paper>
        </PropertyGroup>

        <PropertyGroup>
          <Typography variant="subtitle1" gutterBottom>
            Transform
          </Typography>
          <PropertyLabel>Position</PropertyLabel>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              label="X"
              type="number"
              value={localObject?.position?.[0] || 0}
              onChange={(e) =>
                handlePropertyChange("position.0", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={localObject?.position?.[1] || 0}
              onChange={(e) =>
                handlePropertyChange("position.1", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={localObject?.position?.[2] || 0}
              onChange={(e) =>
                handlePropertyChange("position.2", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
          </Box>

          {geographicCoords && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Geographic Coordinates
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 1,
                }}
              >
                <TextField
                  label="Latitude"
                  value={geographicCoords.latitude.toFixed(6)}
                  size="small"
                  disabled
                />
                <TextField
                  label="Longitude"
                  value={geographicCoords.longitude.toFixed(6)}
                  size="small"
                  disabled
                />
                <TextField
                  label="Altitude"
                  value={geographicCoords.altitude.toFixed(2)}
                  size="small"
                  disabled
                />
              </Box>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                href={`https://www.google.com/maps?q=${geographicCoords.latitude},${geographicCoords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                View in Google Maps
              </Button>
            </Box>
          )}

          <PropertyLabel>Rotation</PropertyLabel>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              label="X"
              type="number"
              value={localObject?.rotation?.[0] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.0", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={localObject?.rotation?.[1] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.1", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={localObject?.rotation?.[2] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.2", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
          </Box>

          <PropertyLabel>Scale</PropertyLabel>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              label="X"
              type="number"
              value={localObject?.scale?.[0] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.0", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={localObject?.scale?.[1] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.1", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={localObject?.scale?.[2] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.2", Number(e.target.value))
              }
              sx={{ flex: 1 }}
            />
          </Box>
        </PropertyGroup>

        <Divider sx={{ my: 2 }} />

        <PropertyGroup>
          <Typography variant="subtitle1" gutterBottom>
            Material
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Color"
            type="color"
            value={localObject?.material?.color || "#ffffff"}
            onChange={(e) =>
              handlePropertyChange("material.color", e.target.value)
            }
          />
        </PropertyGroup>
      </>
    );
  }

  if (selectedObservation) {
    return (
      <>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
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

        {/* Add Google Maps Link Section */}
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
                  href={`https://www.google.com/maps?q=${
                    localToGeographic(
                      tilesRenderer,
                      new THREE.Vector3(...selectedObservation.position)
                    ).latitude
                  },${
                    localToGeographic(
                      tilesRenderer,
                      new THREE.Vector3(...selectedObservation.position)
                    ).longitude
                  }`}
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
                href={`https://www.google.com/maps/dir/${observationPoints
                  ?.filter((point) => point.position)
                  ?.map((point) =>
                    localToGeographic(
                      tilesRenderer,
                      new THREE.Vector3(...point.position!)
                    )
                  )
                  ?.map((coords) => `${coords.latitude},${coords.longitude}`)
                  ?.join("/")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View All Points in Google Maps
              </Button>
            </Paper>
          </PropertyGroup>
        )}
      </>
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
        color: "text.secondary",
      }}
    >
      <Typography variant="body1" align="center">
        Select an object or observation point to view its properties
      </Typography>
    </Box>
  );
};

export default PropertiesPanel;
