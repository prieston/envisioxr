import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import { Camera, FlightTakeoff } from "@mui/icons-material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import * as THREE from "three";
import { localToGeographic } from "@envisio/core/utils";
import { flyToCesiumPosition } from "@envisio/engine-cesium";
import { flyToThreeObject } from "@envisio/engine-three/components";
import { textFieldStyles } from "@envisio/ui";
import IoTDevicePropertiesPanel from "./IoTDevicePropertiesPanel";
import ObjectActionsSection from "./ObjectActionsSection";
import ModelInformationSection from "./ModelInformationSection";
import ObservationModelSection from "./ObservationModelSection";
import TransformLocationSection from "./TransformLocationSection";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import {
  ModelObject,
  ObservationPoint,
  ControlSettings,
  GeographicCoords,
  Vector3Tuple,
} from "./types";

interface PropertiesPanelProps {
  selectedObject: ModelObject | null;
  selectedObservation: ObservationPoint | null;
  viewMode: string;
  controlSettings: ControlSettings;
  updateObjectProperty: (id: string, property: string, value: unknown) => void;
  updateObservationPoint: (
    id: number,
    update: Partial<ObservationPoint>
  ) => void;
  _deleteObservationPoint: (id: number) => void;
  setCapturingPOV: (val: boolean) => void;
  updateControlSettings: (update: Partial<ControlSettings>) => void;
}

const PropertyGroup = (props: { children: React.ReactNode }) => (
  <Box mb={2}>{props.children}</Box>
);
const PropertyLabel = (props: { children: React.ReactNode }) => (
  <Typography fontSize="0.875rem" color="text.secondary" mb={0.5}>
    {props.children}
  </Typography>
);
const InputLabel = (props: { children: React.ReactNode }) => (
  <Typography
    sx={{
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "rgba(100, 116, 139, 0.8)",
      mb: 0.75,
    }}
  >
    {props.children}
  </Typography>
);
const InfoText = (props: { label: string; value: string }) => (
  <Box
    sx={{
      mb: 1.5,
    }}
  >
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "rgba(100, 116, 139, 0.8)",
        mb: 0.75,
      }}
    >
      {props.label}
    </Typography>
    <Typography
      sx={{
        fontSize: "0.75rem",
        fontWeight: 400,
        color: "rgba(51, 65, 85, 0.9)",
        fontFamily: "monospace",
        backgroundColor: "rgba(248, 250, 252, 0.8)",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
      }}
    >
      {props.value}
    </Typography>
  </Box>
);

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  selectedObservation,
  viewMode,
  controlSettings,
  updateObjectProperty,
  updateObservationPoint,
  _deleteObservationPoint,
  setCapturingPOV,
  updateControlSettings,
}) => {
  const { orbitControlsRef } = useSceneStore();
  const [localObject, setLocalObject] = useState<ModelObject | null>(
    selectedObject
  );
  const [repositioning, setRepositioning] = useState(false);

  useEffect(() => {
    if (selectedObject) {
      setLocalObject(selectedObject);
    }
  }, [selectedObject]);

  const geographicCoords = useMemo<GeographicCoords | null>(() => {
    if (!localObject?.position) return null;
    const posArray = Array.isArray(localObject.position)
      ? localObject.position
      : [0, 0, 0];
    const [x, y, z] = posArray;

    const { engine } = useWorldStore.getState();
    if (engine === "cesium") {
      return {
        longitude: x,
        latitude: y,
        altitude: z,
      };
    } else {
      return localToGeographic(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, 0, 0)
      ) as GeographicCoords;
    }
  }, [localObject?.position]);

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
            return {
              ...prev,
              observationProperties: {
                ...prev.observationProperties,
                [child]: value,
              },
            };
          }
          if (parent === "iotProperties") {
            return {
              ...prev,
              iotProperties: {
                ...prev.iotProperties,
                [child]: value,
              },
            };
          }
          const index = parseInt(child);
          if (!isNaN(index)) {
            const prevArray = prev[parent as keyof typeof prev];
            const array = Array.isArray(prevArray) ? [...prevArray] : [0, 0, 0];
            array[index] = value as number;
            return {
              ...prev,
              [parent]: array,
            };
          }
        }
        return { ...prev, [property]: value };
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
      } else if (property.startsWith("iotProperties.")) {
        const propName = property.split(".")[1];
        const updatedProperties = {
          ...selectedObject.iotProperties,
          [propName]: value,
        };
        updateObjectProperty(
          selectedObject.id,
          "iotProperties",
          updatedProperties
        );
      } else if (property.includes(".")) {
        const [parent, child] = property.split(".");
        const index = parseInt(child);
        if (!isNaN(index)) {
          const currentArray = Array.isArray(
            selectedObject[parent as keyof ModelObject]
          )
            ? [...(selectedObject[parent as keyof ModelObject] as number[])]
            : [0, 0, 0];
          currentArray[index] = value as number;
          updateObjectProperty(selectedObject.id, parent, currentArray);
        }
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

  const handleFlyToObservation = () => {
    if (
      selectedObservation &&
      selectedObservation.position &&
      selectedObservation.target
    ) {
      const setPreviewMode = useSceneStore.getState().setPreviewMode;
      const setPreviewIndex = useSceneStore.getState().setPreviewIndex;
      const observationPoints = useSceneStore.getState().observationPoints;

      // Find the index of the current observation
      const index = observationPoints.findIndex(
        (point) => point.id === selectedObservation.id
      );

      if (index !== -1) {
        setPreviewIndex(index);
        setPreviewMode(true);
      }
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
        flyToThreeObject(
          selectedObject.ref as THREE.Object3D,
          orbitControlsRef
        );
      }
    }
  };

  // Settings view
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

  // Object properties view
  if (selectedObject && localObject) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        }}
      >
        <ObjectActionsSection
          onFlyToObject={handleFlyToObject}
          onReposition={handleReposition}
          repositioning={repositioning}
        />

        <ModelInformationSection object={localObject} />

        <ObservationModelSection
          object={localObject}
          onPropertyChange={handlePropertyChange}
          onCalculateViewshed={() => {
            useSceneStore
              .getState()
              .startVisibilityCalculation(selectedObject.id);
          }}
          isCalculating={useSceneStore.getState().isCalculatingVisibility}
          updateObjectProperty={updateObjectProperty}
        />

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
          selectedObject={localObject}
          onPropertyChange={handlePropertyChange}
          geographicCoords={geographicCoords}
        />

        <TransformLocationSection
          object={localObject}
          geographicCoords={geographicCoords}
          onPropertyChange={handlePropertyChange}
          updateObjectProperty={updateObjectProperty}
        />
      </Box>
    );
  }

  // Observation point properties view
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
        {/* Observation Point Actions */}
        <SettingContainer>
          <SettingLabel>Observation Point Actions</SettingLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleFlyToObservation}
              disabled={
                !selectedObservation.position || !selectedObservation.target
              }
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
                "&:disabled": {
                  borderColor: "rgba(226, 232, 240, 0.8)",
                  color: "rgba(100, 116, 139, 0.4)",
                },
              }}
            >
              Fly To
            </Button>

            <Button
              variant="outlined"
              onClick={() => setCapturingPOV(true)}
              startIcon={<Camera />}
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
              Capture Position
            </Button>
          </Box>
        </SettingContainer>

        <SettingContainer>
          <SettingLabel>Observation Point Settings</SettingLabel>

          {/* Title Input */}
          <Box sx={{ mb: 2 }}>
            <InputLabel>Title</InputLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter title"
              value={selectedObservation.title || ""}
              onChange={(e) => handleObservationChange("title", e.target.value)}
              sx={textFieldStyles}
            />
          </Box>

          {/* Description Input */}
          <Box sx={{ mb: 2 }}>
            <InputLabel>Description</InputLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter description"
              multiline
              rows={4}
              value={(selectedObservation.description as string) || ""}
              onChange={(e) =>
                handleObservationChange("description", e.target.value)
              }
              sx={{
                ...textFieldStyles,
                "& .MuiOutlinedInput-root": {
                  ...textFieldStyles["& .MuiOutlinedInput-root"],
                  "& textarea": {
                    padding: "0px",
                  },
                },
              }}
            />
          </Box>

          {/* Position Info - Display Only */}
          <InfoText
            label="Camera Position"
            value={
              selectedObservation.position
                ? `Long: ${selectedObservation.position[1].toFixed(
                    6
                  )}, Lat: ${selectedObservation.position[0].toFixed(
                    6
                  )}, Alt: ${selectedObservation.position[2].toFixed(2)}m`
                : "Not captured"
            }
          />

          {/* Target Info - Display Only */}
          <InfoText
            label="Camera Target"
            value={
              selectedObservation.target
                ? `Long: ${selectedObservation.target[1].toFixed(
                    6
                  )}, Lat: ${selectedObservation.target[0].toFixed(
                    6
                  )}, Alt: ${selectedObservation.target[2].toFixed(2)}m`
                : "Not captured"
            }
          />
        </SettingContainer>
      </Box>
    );
  }

  // Default empty state
  return (
    <Paper
      sx={{
        p: 3,
        textAlign: "center",
        backgroundColor: "rgba(248, 250, 252, 0.4)",
        border: "1px dashed rgba(226, 232, 240, 0.6)",
        borderRadius: "12px",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.875rem",
          color: "rgba(100, 116, 139, 0.7)",
          fontStyle: "italic",
        }}
      >
        Select an object or observation point to view its properties
      </Typography>
    </Paper>
  );
};

export default PropertiesPanel;
