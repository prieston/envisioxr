import React from "react";
import { Box, Typography } from "@mui/material";
import { SettingContainer, SettingLabel } from "../SettingRenderer.styles";
import ModelMetadata from "./ModelMetadata";
import { ModelObject } from "./types";

interface ModelInformationSectionProps {
  object: ModelObject;
}

const ModelInformationSection: React.FC<ModelInformationSectionProps> = ({
  object,
}) => {
  return (
    <SettingContainer>
      <SettingLabel>Model Information</SettingLabel>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(100, 116, 139, 0.8)",
              mb: 0.5,
            }}
          >
            Name
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(51, 65, 85, 0.9)",
            }}
          >
            {object.name || "Untitled"}
          </Typography>
        </Box>
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(100, 116, 139, 0.8)",
              mb: 0.5,
            }}
          >
            Type
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(51, 65, 85, 0.9)",
            }}
          >
            {object.type || "Unknown"}
          </Typography>
        </Box>

        {/* Metadata */}
        <Box sx={{ mt: 1 }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "rgba(100, 116, 139, 0.8)",
              mb: 0.75,
            }}
          >
            Metadata
          </Typography>
          <ModelMetadata assetId={object.assetId} />
        </Box>
      </Box>
    </SettingContainer>
  );
};

export default ModelInformationSection;
