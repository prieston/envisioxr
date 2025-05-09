"use client";

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import { ViewInAr, Camera } from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";
import AddModelDialog from "../AppBar/AddModelDialog";

// Styled container for the RightPanel with conditional styles based on previewMode
interface RightPanelContainerProps {
  previewMode: boolean;
}

type Vector3Tuple = [number, number, number];

const RightPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<RightPanelContainerProps>(({ theme, previewMode }) => ({
  width: "280px",
  height: "100%",
  backgroundColor: "#121212",
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
  userSelect: "none",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "default",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "all 0.3s ease",
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "calc(100% - 48px)", // 48px is the height of the tabs
  overflow: "auto",
}));

const PropertyGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PropertyLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
}));

const AssetItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cursor: "pointer",
}));

const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [addModelDialogOpen, setAddModelDialogOpen] = useState(false);
  const {
    selectedObject,
    updateObjectProperty,
    previewMode,
    selectedObservation,
    updateObservationPoint,
    deleteObservationPoint,
    setCapturingPOV,
    viewMode,
    controlSettings,
    updateControlSettings,
  } = useSceneStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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

  return (
    <RightPanelContainer previewMode={previewMode}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Properties" />
        <Tab label="Assets" />
      </Tabs>

      {/* Properties Inspector Tab */}
      <TabPanel role="tabpanel" hidden={activeTab !== 0}>
        {viewMode === "settings" ? (
          // Control Settings Panel
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
        ) : selectedObservation ? (
          // Observation Point Properties
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
                onChange={(e) =>
                  handleObservationChange("title", e.target.value)
                }
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
        ) : selectedObject ? (
          // Object Properties
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
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select an object or observation point to view its properties
          </Typography>
        )}
      </TabPanel>

      {/* Asset Library Tab */}
      <TabPanel role="tabpanel" hidden={activeTab !== 1}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1">Asset Library</Typography>
        </Box>

        <List>
          <AssetItem onClick={() => setAddModelDialogOpen(true)}>
            <ListItemIcon>
              <ViewInAr />
            </ListItemIcon>
            <ListItemText
              primary="Add Model"
              secondary="Upload or select from stock models"
            />
          </AssetItem>
        </List>
      </TabPanel>

      <AddModelDialog
        open={addModelDialogOpen}
        onClose={() => setAddModelDialogOpen(false)}
      />
    </RightPanelContainer>
  );
};

export default RightPanel;
