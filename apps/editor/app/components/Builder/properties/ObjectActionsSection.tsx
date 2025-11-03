import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  FlightTakeoff,
  LocationOn,
  OpenWith,
  RotateRight,
} from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";

interface ObjectActionsSectionProps {
  onFlyToObject: () => void;
  onReposition?: () => void;
  repositioning: boolean;
  showGizmoControls?: boolean;
  transformMode?: "translate" | "rotate" | "scale";
  onTransformModeChange?: (mode: "translate" | "rotate" | "scale") => void;
}

const ObjectActionsSection: React.FC<ObjectActionsSectionProps> = ({
  onFlyToObject,
  onReposition,
  repositioning,
  showGizmoControls = false,
  transformMode = "translate",
  onTransformModeChange,
}) => {
  return (
    <SettingContainer>
      <SettingLabel>Object Actions</SettingLabel>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onFlyToObject}
          startIcon={<FlightTakeoff />}
          sx={{
            flex: 1,
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.75rem",
            borderColor: "rgba(95, 136, 199, 0.3)",
            color: "var(--color-primary, #6B9CD8)",
            padding: "6px 16px",
            "&:hover": {
              borderColor: "var(--color-primary, #6B9CD8)",
              backgroundColor: "rgba(95, 136, 199, 0.08)",
            },
          }}
        >
          Fly to Object
        </Button>
        {onReposition && (
          <Button
            variant="outlined"
            onClick={onReposition}
            startIcon={<LocationOn />}
            sx={{
              flex: 1,
              borderRadius: "4px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              borderColor: "rgba(95, 136, 199, 0.3)",
              color: "var(--color-primary, #6B9CD8)",
              padding: "6px 16px",
              "&:hover": {
                borderColor: "var(--color-primary, #6B9CD8)",
                backgroundColor: "rgba(95, 136, 199, 0.08)",
              },
            }}
            disabled={repositioning}
            data-testid="reposition-button"
          >
            {repositioning ? "Repositioning..." : "Reposition"}
          </Button>
        )}
      </Box>

      {/* Gizmo Transform Controls */}
      {showGizmoControls && onTransformModeChange && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(51, 65, 85, 0.7)",
              display: "block",
              mb: 1,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            Transform Mode
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => onTransformModeChange("translate")}
              startIcon={<OpenWith />}
              sx={{
                flex: 1,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor: "rgba(95, 136, 199, 0.3)",
                color: "var(--color-primary, #6B9CD8)",
                padding: "6px 16px",
                "&:hover": {
                  borderColor: "var(--color-primary, #6B9CD8)",
                  backgroundColor: "rgba(95, 136, 199, 0.08)",
                },
                ...(transformMode === "translate" && {
                  backgroundColor: "rgba(95, 136, 199, 0.2)",
                  borderColor: "var(--color-primary, #6B9CD8)",
                }),
              }}
            >
              Move
            </Button>
            <Button
              variant="outlined"
              onClick={() => onTransformModeChange("rotate")}
              startIcon={<RotateRight />}
              sx={{
                flex: 1,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                borderColor: "rgba(95, 136, 199, 0.3)",
                color: "var(--color-primary, #6B9CD8)",
                padding: "6px 16px",
                "&:hover": {
                  borderColor: "var(--color-primary, #6B9CD8)",
                  backgroundColor: "rgba(95, 136, 199, 0.08)",
                },
                ...(transformMode === "rotate" && {
                  backgroundColor: "rgba(95, 136, 199, 0.2)",
                  borderColor: "var(--color-primary, #6B9CD8)",
                }),
              }}
            >
              Rotate
            </Button>
          </Box>
        </Box>
      )}
    </SettingContainer>
  );
};

export default ObjectActionsSection;
