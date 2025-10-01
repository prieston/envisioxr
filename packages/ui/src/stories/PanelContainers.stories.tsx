import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, Button, Paper } from "@mui/material";
import {
  LeftPanelContainer,
  RightPanelContainer,
  TabPanel,
} from "../components/panels";

const meta: Meta<typeof LeftPanelContainer> = {
  title: "Components/Panel Containers",
  component: LeftPanelContainer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Glass-morphism panel containers for the EnvisioXR editor interface.",
      },
    },
  },
  argTypes: {
    previewMode: {
      control: "boolean",
      description: "Whether the panel is in preview mode (disabled state)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Left Panel Stories
export const LeftPanelDefault: Story = {
  args: {
    previewMode: false,
  },
  render: (args) => (
    <Box sx={{ height: "100vh", display: "flex", backgroundColor: "#f0f0f0" }}>
      <LeftPanelContainer {...args}>
        <Typography variant="h6" gutterBottom>
          Left Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is the left panel container with glass-morphism styling.
        </Typography>
        <Button variant="contained" size="small">
          Action Button
        </Button>
      </LeftPanelContainer>
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography>Main content area</Typography>
      </Box>
    </Box>
  ),
};

export const LeftPanelPreviewMode: Story = {
  args: {
    previewMode: true,
  },
  render: (args) => (
    <Box sx={{ height: "100vh", display: "flex", backgroundColor: "#f0f0f0" }}>
      <LeftPanelContainer {...args}>
        <Typography variant="h6" gutterBottom>
          Left Panel (Preview)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This panel is in preview mode and appears disabled.
        </Typography>
        <Button variant="contained" size="small">
          Disabled Button
        </Button>
      </LeftPanelContainer>
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography>Main content area</Typography>
      </Box>
    </Box>
  ),
};

// Right Panel Stories
export const RightPanelDefault: Story = {
  args: {
    previewMode: false,
  },
  render: (args) => (
    <Box sx={{ height: "100vh", display: "flex", backgroundColor: "#f0f0f0" }}>
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography>Main content area</Typography>
      </Box>
      <RightPanelContainer {...args}>
        <Typography variant="h6" gutterBottom>
          Right Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is the right panel container with glass-morphism styling.
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Panel Content
          </Typography>
          <Typography variant="body2">
            Additional content can be placed here.
          </Typography>
        </Paper>
        <Button variant="outlined" size="small" fullWidth>
          Full Width Button
        </Button>
      </RightPanelContainer>
    </Box>
  ),
};

export const RightPanelPreviewMode: Story = {
  args: {
    previewMode: true,
  },
  render: (args) => (
    <Box sx={{ height: "100vh", display: "flex", backgroundColor: "#f0f0f0" }}>
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography>Main content area</Typography>
      </Box>
      <RightPanelContainer {...args}>
        <Typography variant="h6" gutterBottom>
          Right Panel (Preview)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          This panel is in preview mode and appears disabled.
        </Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Disabled Content
          </Typography>
          <Typography variant="body2">
            This content is not interactive in preview mode.
          </Typography>
        </Paper>
        <Button variant="outlined" size="small" fullWidth>
          Disabled Button
        </Button>
      </RightPanelContainer>
    </Box>
  ),
};

// Tab Panel Stories
export const TabPanelDefault: Story = {
  render: () => (
    <Box sx={{ height: "400px", display: "flex", backgroundColor: "#f0f0f0" }}>
      <Box sx={{ width: "300px", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tab Panel Container
        </Typography>
        <TabPanel>
          <Typography variant="body1" paragraph>
            This is a tab panel with scrollable content. It has custom scrollbar
            styling and is designed to fit within the panel containers.
          </Typography>
          {Array.from({ length: 20 }, (_, i) => (
            <Paper key={i} sx={{ p: 2, mb: 1 }}>
              <Typography variant="subtitle2">Content Item {i + 1}</Typography>
              <Typography variant="body2" color="text.secondary">
                This is some sample content to demonstrate scrolling behavior.
              </Typography>
            </Paper>
          ))}
        </TabPanel>
      </Box>
    </Box>
  ),
};

// Combined Layout Story
export const CombinedLayout: Story = {
  render: () => (
    <Box sx={{ height: "100vh", display: "flex", backgroundColor: "#f0f0f0" }}>
      <LeftPanelContainer previewMode={false}>
        <Typography variant="h6" gutterBottom>
          Left Panel
        </Typography>
        <TabPanel>
          <Typography variant="body2" paragraph>
            Left panel content with scrolling.
          </Typography>
          {Array.from({ length: 10 }, (_, i) => (
            <Button
              key={i}
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            >
              Option {i + 1}
            </Button>
          ))}
        </TabPanel>
      </LeftPanelContainer>

      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Main Content Area
        </Typography>
        <Typography variant="body1">
          This is the main content area between the panels.
        </Typography>
      </Box>

      <RightPanelContainer previewMode={false}>
        <Typography variant="h6" gutterBottom>
          Right Panel
        </Typography>
        <TabPanel>
          <Typography variant="body2" paragraph>
            Right panel content with scrolling.
          </Typography>
          {Array.from({ length: 15 }, (_, i) => (
            <Paper key={i} sx={{ p: 1, mb: 1 }}>
              <Typography variant="caption">Item {i + 1}</Typography>
            </Paper>
          ))}
        </TabPanel>
      </RightPanelContainer>
    </Box>
  ),
};
