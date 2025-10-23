import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ThemeModeProvider, { useThemeMode } from "../theme/ThemeModeProvider";
import { createAppTheme } from "../theme/theme";

const meta: Meta<typeof ThemeModeProvider> = {
  title: "Theme/Theme System",
  component: ThemeModeProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The EnvisioXR theme system with light and dark modes, including the ThemeModeProvider and theme utilities.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Theme Toggle Component
const ThemeToggle = () => {
  const { mode, toggle } = useThemeMode();

  return (
    <FormControlLabel
      control={<Switch checked={mode === "dark"} onChange={toggle} />}
      label={`${mode === "dark" ? "Dark" : "Light"} Mode`}
    />
  );
};

// Sample Content Component
const SampleContent = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Theme System Demo
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <ThemeToggle />
    </Box>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 2,
        mb: 3,
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Primary Colors
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button variant="contained">Primary</Button>
            <Button variant="outlined">Secondary</Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Primary and secondary button variants
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Text Variants
          </Typography>
          <Typography variant="h1" gutterBottom>
            H1 Heading
          </Typography>
          <Typography variant="h2" gutterBottom>
            H2 Heading
          </Typography>
          <Typography variant="h3" gutterBottom>
            H3 Heading
          </Typography>
          <Typography variant="body1" paragraph>
            Body text with primary color
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Secondary body text
          </Typography>
        </CardContent>
      </Card>
    </Box>

    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Glass Morphism Panel
      </Typography>
      <Typography variant="body2" paragraph>
        This demonstrates how the theme works with glass-morphism panels.
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button variant="contained" size="small">
          Action
        </Button>
        <Button variant="outlined" size="small">
          Cancel
        </Button>
      </Box>
    </Paper>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Card {i + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sample card content to demonstrate theme consistency.
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

export const ThemeProvider: Story = {
  render: () => (
    <ThemeModeProvider>
      <SampleContent />
    </ThemeModeProvider>
  ),
};

export const LightTheme: Story = {
  render: () => (
    <ThemeModeProvider>
      <Box
        sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}
      >
        <Typography variant="h4" gutterBottom>
          Light Theme Preview
        </Typography>
        <Typography variant="body1" paragraph>
          This shows how components look in light mode.
        </Typography>
        <SampleContent />
      </Box>
    </ThemeModeProvider>
  ),
};

export const DarkTheme: Story = {
  render: () => {
    const darkTheme = createAppTheme("dark");

    return (
      <ThemeModeProvider>
        <Box
          sx={{
            p: 3,
            backgroundColor: "background.default",
            minHeight: "100vh",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Dark Theme Preview
          </Typography>
          <Typography variant="body1" paragraph>
            This shows how components look in dark mode.
          </Typography>
          <SampleContent />
        </Box>
      </ThemeModeProvider>
    );
  },
};

// Theme Colors Story
export const ThemeColors: Story = {
  render: () => {
    const lightTheme = createAppTheme("light");
    const darkTheme = createAppTheme("dark");

    const ColorSwatch = ({ name, color }: { name: string; color: string }) => (
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            backgroundColor: color,
            borderRadius: 1,
            mb: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
        <Typography variant="caption" display="block">
          {name}
        </Typography>
      </Box>
    );

    return (
      <ThemeModeProvider>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Theme Color Palette
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Light Theme Colors
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <ColorSwatch
                name="Primary"
                color={lightTheme.palette.primary.main}
              />
              <ColorSwatch
                name="Secondary"
                color={lightTheme.palette.secondary.main}
              />
              <ColorSwatch
                name="Background"
                color={lightTheme.palette.background.default}
              />
              <ColorSwatch
                name="Paper"
                color={lightTheme.palette.background.paper}
              />
              <ColorSwatch
                name="Text Primary"
                color={lightTheme.palette.text.primary}
              />
              <ColorSwatch
                name="Text Secondary"
                color={lightTheme.palette.text.secondary}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Dark Theme Colors
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <ColorSwatch
                name="Primary"
                color={darkTheme.palette.primary.main}
              />
              <ColorSwatch
                name="Secondary"
                color={darkTheme.palette.secondary.main}
              />
              <ColorSwatch
                name="Background"
                color={darkTheme.palette.background.default}
              />
              <ColorSwatch
                name="Paper"
                color={darkTheme.palette.background.paper}
              />
              <ColorSwatch
                name="Text Primary"
                color={darkTheme.palette.text.primary}
              />
              <ColorSwatch
                name="Text Secondary"
                color={darkTheme.palette.text.secondary}
              />
            </Box>
          </Box>
        </Box>
      </ThemeModeProvider>
    );
  },
};
