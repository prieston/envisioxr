import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  LeftPanelContainer,
  RightPanelContainer,
  TabPanel,
} from "../components/panels";
import ThemeModeProvider, { useThemeMode } from "../theme/ThemeModeProvider";

const meta: Meta = {
  title: "Overview/Complete UI System",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Complete overview of the EnvisioXR UI system showcasing all components working together.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ThemeToggle = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <Button variant="outlined" onClick={toggle} size="small">
      {mode === "dark" ? "🌙" : "☀️"} {mode === "dark" ? "Dark" : "Light"} Mode
    </Button>
  );
};

const OverviewContent = () => (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      backgroundColor: "background.default",
    }}
  >
    {/* Left Panel */}
    <LeftPanelContainer previewMode={false}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Tools</Typography>
        <ThemeToggle />
      </Box>

      <TabPanel>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          PANEL CONTROLS
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button variant="contained" fullWidth sx={{ mb: 1 }}>
            Add Model
          </Button>
          <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
            Import Asset
          </Button>
          <Button variant="outlined" fullWidth>
            Settings
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          SCENE OBJECTS
        </Typography>

        {Array.from({ length: 8 }, (_, i) => (
          <Paper
            key={i}
            sx={{
              p: 1.5,
              mb: 1,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2">Object {i + 1}</Typography>
              <Chip label="Active" size="small" color="primary" />
            </Box>
          </Paper>
        ))}
      </TabPanel>
    </LeftPanelContainer>

    {/* Main Content Area */}
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          EnvisioXR Editor
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small">
            Save
          </Button>
          <Button variant="contained" size="small">
            Export
          </Button>
        </Box>
      </Box>

      {/* 3D Viewport Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Typography variant="h4" color="white" textAlign="center">
            3D Viewport
            <br />
            <Typography variant="body1" component="span">
              Your 3D scene will render here
            </Typography>
          </Typography>

          {/* Floating UI Elements */}
          <Box sx={{ position: "absolute", top: 16, left: 16 }}>
            <Chip label="FPS: 60" color="primary" />
          </Box>
          <Box sx={{ position: "absolute", top: 16, right: 16 }}>
            <Chip label="Ready" color="success" />
          </Box>
        </Box>
      </Box>
    </Box>

    {/* Right Panel */}
    <RightPanelContainer previewMode={false}>
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>

      <TabPanel>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          SELECTED OBJECT
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Model Properties
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure the selected 3D model properties
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" size="small">
                Edit
              </Button>
              <Button variant="outlined" size="small">
                Duplicate
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          TRANSFORM
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Position: (0, 0, 0)
          </Typography>
          <Typography variant="body2" gutterBottom>
            Rotation: (0°, 0°, 0°)
          </Typography>
          <Typography variant="body2" gutterBottom>
            Scale: (1, 1, 1)
          </Typography>
        </Paper>

        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          MATERIALS
        </Typography>

        {Array.from({ length: 3 }, (_, i) => (
          <Paper key={i} sx={{ p: 1.5, mb: 1 }}>
            <Typography variant="body2">Material {i + 1}</Typography>
            <Typography variant="caption" color="text.secondary">
              Standard Material
            </Typography>
          </Paper>
        ))}

        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
          Add Material
        </Button>
      </TabPanel>
    </RightPanelContainer>
  </Box>
);

export const CompleteInterface: Story = {
  render: () => (
    <ThemeModeProvider>
      <OverviewContent />
    </ThemeModeProvider>
  ),
};

export const PreviewMode: Story = {
  render: () => (
    <ThemeModeProvider>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          backgroundColor: "background.default",
        }}
      >
        <LeftPanelContainer previewMode={true}>
          <Typography variant="h6" gutterBottom>
            Tools (Preview)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Panels are disabled in preview mode
          </Typography>
        </LeftPanelContainer>

        <Box
          sx={{
            flex: 1,
            p: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" textAlign="center">
            Preview Mode
            <br />
            <Typography variant="body1" component="span">
              Panels are disabled for presentation
            </Typography>
          </Typography>
        </Box>

        <RightPanelContainer previewMode={true}>
          <Typography variant="h6" gutterBottom>
            Properties (Preview)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Panels are disabled in preview mode
          </Typography>
        </RightPanelContainer>
      </Box>
    </ThemeModeProvider>
  ),
};
