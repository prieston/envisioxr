import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";
import { useCameraControllerManager } from "./CesiumControls/hooks/useCameraControllerManager";
import { SimulationMode } from "./CesiumControls/types";

/**
 * Test component to verify the new camera controller system works
 */
const CesiumControlsTest: React.FC = () => {
  const { cesiumViewer } = useSceneStore();
  const [currentMode, setCurrentMode] = useState<SimulationMode>("orbit");
  const { switchToMode, isModeActive, isInitialized } =
    useCameraControllerManager(cesiumViewer);

  const modes: SimulationMode[] = ["orbit", "firstPerson", "car", "flight"];

  return (
    <Box sx={{ p: 2, backgroundColor: "rgba(0,0,0,0.8)", color: "white" }}>
      <Typography variant="h6" gutterBottom>
        Cesium Controls Test
      </Typography>

      <Typography variant="body2" gutterBottom>
        Status: {isInitialized ? "✅ Initialized" : "❌ Not Initialized"}
      </Typography>

      <Typography variant="body2" gutterBottom>
        Current Mode: {currentMode}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
        {modes.map((mode) => (
          <Button
            key={mode}
            variant={isModeActive(mode) ? "contained" : "outlined"}
            onClick={() => {
              switchToMode(mode);
              setCurrentMode(mode);
            }}
            disabled={!isInitialized}
            sx={{ textTransform: "capitalize" }}
          >
            {mode}
          </Button>
        ))}
      </Box>

      {currentMode === "firstPerson" && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" gutterBottom>
            🚶 Walk Mode Active
          </Typography>
          <Typography variant="caption" display="block">
            • Click on Cesium canvas to enable pointer lock
          </Typography>
          <Typography variant="caption" display="block">
            • Use WASD to move around
          </Typography>
          <Typography variant="caption" display="block">
            • Press Space to jump
          </Typography>
          <Typography variant="caption" display="block">
            • Move mouse to look around
          </Typography>
        </Box>
      )}

      {currentMode === "car" && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" gutterBottom>
            🚗 Car Mode Active
          </Typography>
          <Typography variant="caption" display="block">
            • Use WASD to move forward/back
          </Typography>
          <Typography variant="caption" display="block">
            • Use Arrow Keys to steer
          </Typography>
        </Box>
      )}

      {currentMode === "flight" && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" gutterBottom>
            ✈️ Flight Mode Active
          </Typography>
          <Typography variant="caption" display="block">
            • Use WASD to move forward/back/strafe
          </Typography>
          <Typography variant="caption" display="block">
            • Use Space/Shift for up/down
          </Typography>
          <Typography variant="caption" display="block">
            • Use Arrow Keys to rotate
          </Typography>
          <Typography variant="caption" display="block">
            • Click to toggle mouse look
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CesiumControlsTest;
