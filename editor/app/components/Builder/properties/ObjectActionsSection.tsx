import React from "react";
import { Box, Button } from "@mui/material";
import { FlightTakeoff, LocationOn } from "@mui/icons-material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";

interface ObjectActionsSectionProps {
  onFlyToObject: () => void;
  onReposition: () => void;
  repositioning: boolean;
}

const ObjectActionsSection: React.FC<ObjectActionsSectionProps> = ({
  onFlyToObject,
  onReposition,
  repositioning,
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
          Fly to Object
        </Button>
        <Button
          variant="outlined"
          onClick={onReposition}
          startIcon={<LocationOn />}
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
          disabled={repositioning}
          data-testid="reposition-button"
        >
          {repositioning ? "Repositioning..." : "Reposition"}
        </Button>
      </Box>
    </SettingContainer>
  );
};

export default ObjectActionsSection;
