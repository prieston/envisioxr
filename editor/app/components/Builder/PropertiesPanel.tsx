import React from "react";
import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import { Camera } from "@mui/icons-material";

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
  const handlePropertyChange = (property: string, value: number | string) => {
    if (selectedObject) {
      updateObjectProperty(selectedObject.id, property, value);
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
      </>
    );
  }

  if (selectedObject) {
    return (
      <>
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
              value={selectedObject.position[0]}
              onChange={(e) =>
                handlePropertyChange("position.0", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={selectedObject.position[1]}
              onChange={(e) =>
                handlePropertyChange("position.1", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={selectedObject.position[2]}
              onChange={(e) =>
                handlePropertyChange("position.2", Number(e.target.value))
              }
            />
          </Box>

          <PropertyLabel>Rotation</PropertyLabel>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              label="X"
              type="number"
              value={selectedObject.rotation?.[0] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.0", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={selectedObject.rotation?.[1] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.1", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={selectedObject.rotation?.[2] || 0}
              onChange={(e) =>
                handlePropertyChange("rotation.2", Number(e.target.value))
              }
            />
          </Box>

          <PropertyLabel>Scale</PropertyLabel>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              label="X"
              type="number"
              value={selectedObject.scale?.[0] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.0", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Y"
              type="number"
              value={selectedObject.scale?.[1] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.1", Number(e.target.value))
              }
            />
            <TextField
              size="small"
              label="Z"
              type="number"
              value={selectedObject.scale?.[2] || 1}
              onChange={(e) =>
                handlePropertyChange("scale.2", Number(e.target.value))
              }
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
            value={selectedObject.material?.color || "#ffffff"}
            onChange={(e) =>
              handlePropertyChange("material.color", e.target.value)
            }
          />
        </PropertyGroup>
      </>
    );
  }

  return (
    <Typography variant="body2" color="text.secondary">
      Select an object or observation point to view its properties
    </Typography>
  );
};

export default PropertiesPanel;
