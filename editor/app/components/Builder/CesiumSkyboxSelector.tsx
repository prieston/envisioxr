import React, {
  useCallback,
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import useSceneStore from "../../hooks/useSceneStore";

// Cesium is loaded as a module, not a global variable

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SkyboxErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SkyboxErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, border: "1px solid red", borderRadius: 1 }}>
          <Typography variant="caption" color="error">
            Error in skybox selector:{" "}
            {this.state.error?.message || "Unknown error"}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));

interface CesiumSkyboxSelectorProps {
  value: "default" | "none";
  onChange: (value: "default" | "none") => void;
  disabled?: boolean;
}

const CesiumSkyboxSelector: React.FC<CesiumSkyboxSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { cesiumViewer, cesiumInstance } = useSceneStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log the current value when component renders
  useEffect(() => {
    // console.log("CesiumSkyboxSelector rendered with value:", value);
  }, [value]);

  const handleSkyboxChange = useCallback(
    (skyboxType: "default" | "none") => {
      if (!cesiumViewer) {
        setError("Cesium viewer not available");
        return;
      }

      if (!cesiumInstance) {
        setError("Cesium library not loaded yet. Please wait...");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Applying skybox change

        // Check if scene and its properties exist
        if (!cesiumViewer.scene) {
          throw new Error("Cesium scene not available");
        }

        switch (skyboxType) {
          case "default": {
            // Show both skybox (with stars) and atmosphere
            if (cesiumViewer.scene.skyBox) {
              cesiumViewer.scene.skyBox.show = true;
            }
            if (cesiumViewer.scene.skyAtmosphere) {
              cesiumViewer.scene.skyAtmosphere.show = true;
            }
            break;
          }
          case "none": {
            // Hide both skybox and atmosphere
            if (cesiumViewer.scene.skyBox) {
              cesiumViewer.scene.skyBox.show = false;
            }
            if (cesiumViewer.scene.skyAtmosphere) {
              cesiumViewer.scene.skyAtmosphere.show = false;
            }
            break;
          }
        }

        // Force a render to ensure the changes are visible
        if (cesiumViewer.scene.requestRender) {
          cesiumViewer.scene.requestRender();
        }

        // Skybox change applied successfully
        onChange(skyboxType);
      } catch (error) {
        console.error("Error changing skybox:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(`Failed to change skybox: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [cesiumViewer, cesiumInstance, onChange]
  );

  // Apply initial skybox setting when component mounts
  useEffect(() => {
    if (cesiumViewer && cesiumInstance && value) {
      // console.log("Applying initial skybox:", value);
      handleSkyboxChange(value);
    }
  }, [cesiumViewer, cesiumInstance]); // Only run when cesium is ready

  const handleSelectChange = (e: SelectChangeEvent<"default" | "none">) => {
    try {
      const newValue = e.target.value as "default" | "none";
      handleSkyboxChange(newValue);
    } catch (error) {
      console.error("Error in skybox onChange:", error);
      setError("Failed to change skybox selection");
    }
  };

  return (
    <Container>
      <SectionTitle>Skybox Type</SectionTitle>
      <FormControl
        fullWidth
        size="small"
        disabled={disabled || isLoading || !cesiumInstance}
      >
        <Select
          value={value}
          onChange={handleSelectChange}
          displayEmpty
          startAdornment={isLoading ? <CircularProgress size={16} /> : null}
        >
          <MenuItem value="default">Default Sky</MenuItem>
          <MenuItem value="none">No Sky</MenuItem>
        </Select>
      </FormControl>
      {!cesiumInstance && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Loading Cesium...
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

const CesiumSkyboxSelectorWithErrorBoundary: React.FC<
  CesiumSkyboxSelectorProps
> = (props) => {
  return (
    <SkyboxErrorBoundary>
      <CesiumSkyboxSelector {...props} />
    </SkyboxErrorBoundary>
  );
};

export default CesiumSkyboxSelectorWithErrorBoundary;
