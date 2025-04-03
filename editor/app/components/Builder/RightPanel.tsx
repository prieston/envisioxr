"use client";

import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@mui/material";
import {
  ViewInAr,
  Image,
  Style,
  Folder,
  CloudUpload,
  Delete,
} from "@mui/icons-material";
import useSceneStore from "../../hooks/useSceneStore";

// Styled container for the RightPanel with conditional styles based on previewMode
interface RightPanelContainerProps {
  previewMode: boolean;
}

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
}));

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { selectedObject, updateObjectProperty, previewMode } = useSceneStore();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePropertyChange = (property, value) => {
    if (selectedObject) {
      updateObjectProperty(selectedObject.id, property, value);
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
        {selectedObject ? (
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
                  value={selectedObject.position?.x || 0}
                  onChange={(e) =>
                    handlePropertyChange("position.x", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.position?.y || 0}
                  onChange={(e) =>
                    handlePropertyChange("position.y", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.position?.z || 0}
                  onChange={(e) =>
                    handlePropertyChange("position.z", Number(e.target.value))
                  }
                />
              </Box>

              <PropertyLabel>Rotation</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObject.rotation?.x || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.x", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.rotation?.y || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.y", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.rotation?.z || 0}
                  onChange={(e) =>
                    handlePropertyChange("rotation.z", Number(e.target.value))
                  }
                />
              </Box>

              <PropertyLabel>Scale</PropertyLabel>
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  label="X"
                  type="number"
                  value={selectedObject.scale?.x || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.x", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Y"
                  type="number"
                  value={selectedObject.scale?.y || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.y", Number(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Z"
                  type="number"
                  value={selectedObject.scale?.z || 1}
                  onChange={(e) =>
                    handlePropertyChange("scale.z", Number(e.target.value))
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
            Select an object to view its properties
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
          <IconButton color="primary" size="small">
            <CloudUpload />
          </IconButton>
        </Box>

        <List>
          <AssetItem button>
            <ListItemIcon>
              <ViewInAr />
            </ListItemIcon>
            <ListItemText primary="3D Models" secondary="12 items" />
          </AssetItem>
          <AssetItem button>
            <ListItemIcon>
              <Image />
            </ListItemIcon>
            <ListItemText primary="Textures" secondary="8 items" />
          </AssetItem>
          <AssetItem button>
            <ListItemIcon>
              <Style />
            </ListItemIcon>
            <ListItemText primary="Materials" secondary="5 items" />
          </AssetItem>
        </List>
      </TabPanel>
    </RightPanelContainer>
  );
};

export default RightPanel;
