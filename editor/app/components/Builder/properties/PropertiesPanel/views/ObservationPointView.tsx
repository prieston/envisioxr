import React, { memo, useCallback } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Camera, FlightTakeoff } from "@mui/icons-material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { flyToCesiumPosition } from "@envisio/engine-cesium";
import { textFieldStyles } from "@envisio/ui";
import {
  SettingContainer,
  SettingLabel,
} from "../../../SettingRenderer.styles";
import { ScrollContainer } from "../components/ScrollContainer";
import { InputLabel, InfoText } from "../components/PropertyComponents";
import { ObservationPoint } from "../../types";

// Tuple type: [latitude, longitude, altitude]
type LatLonAlt = [lat: number, lon: number, alt: number];

interface ObservationPointViewProps {
  selectedObservation: ObservationPoint;
  updateObservationPoint: (
    id: number,
    update: Partial<ObservationPoint>
  ) => void;
  setCapturingPOV: (val: boolean) => void;
}

// Type guard for valid 3D vector
const hasVec3 = (v?: number[] | null): v is LatLonAlt =>
  Array.isArray(v) && v.length === 3 && v.every((n) => Number.isFinite(n));

/**
 * ObservationPointView - Displays and edits observation point properties
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const ObservationPointView: React.FC<ObservationPointViewProps> = memo(
  ({ selectedObservation, updateObservationPoint, setCapturingPOV }) => {
    const engine = useWorldStore((s) => s.engine);
    const cesiumViewer = useSceneStore((s) => s.cesiumViewer);

    // Type-safe property updates
    type ObsKey = "title" | "description" | "position" | "target";
    const handleObservationChange = useCallback(
      <K extends ObsKey>(key: K, value: ObservationPoint[K]) => {
        updateObservationPoint(selectedObservation.id, {
          [key]: value,
        } as Pick<ObservationPoint, K>);
      },
      [selectedObservation.id, updateObservationPoint]
    );

    const handleFlyToObservation = useCallback(() => {
      if (!hasVec3(selectedObservation.position)) {
        console.warn("Invalid observation position");
        return;
      }

      if (engine === "cesium" && cesiumViewer) {
        // Position is LatLonAlt: [lat, lon, alt]
        // flyToCesiumPosition expects: (viewer, lon, lat, height)
        const [lat, lon, alt] = selectedObservation.position;
        flyToCesiumPosition(cesiumViewer, lon, lat, alt);
      }
    }, [engine, cesiumViewer, selectedObservation.position]);

    const handleCapturePosition = useCallback(
      () => setCapturingPOV(true),
      [setCapturingPOV]
    );

    return (
      <ScrollContainer>
        {/* Observation Point Actions */}
        <SettingContainer>
          <SettingLabel>Observation Point Actions</SettingLabel>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleFlyToObservation}
              disabled={!hasVec3(selectedObservation.position)}
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
              onClick={handleCapturePosition}
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
              sx={textFieldStyles}
            />
          </Box>

          {/* Position Info - Display Only */}
          <InfoText
            label="Camera Position"
            value={
              hasVec3(selectedObservation.position)
                ? `Lat: ${selectedObservation.position[0].toFixed(
                    6
                  )}, Lon: ${selectedObservation.position[1].toFixed(
                    6
                  )}, Alt: ${selectedObservation.position[2].toFixed(2)}m`
                : "Not captured"
            }
          />

          {/* Target Info - Display Only */}
          <InfoText
            label="Camera Target"
            value={
              hasVec3(selectedObservation.target)
                ? `Lat: ${selectedObservation.target[0].toFixed(
                    6
                  )}, Lon: ${selectedObservation.target[1].toFixed(
                    6
                  )}, Alt: ${selectedObservation.target[2].toFixed(2)}m`
                : "Not captured"
            }
          />
        </SettingContainer>
      </ScrollContainer>
    );
  }
);

ObservationPointView.displayName = "ObservationPointView";
