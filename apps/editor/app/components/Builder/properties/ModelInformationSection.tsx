import React, { useState, useEffect } from "react";
import { Box, Typography, TextField } from "@mui/material";
import { SettingContainer, SettingLabel } from "@envisio/ui";
import { textFieldStyles } from "@envisio/ui";
import ModelMetadata from "./ModelMetadata";
import { ModelObject } from "./types";

interface ModelInformationSectionProps {
  object: ModelObject;
  onPropertyChange?: (property: string, value: any) => void;
}

const ModelInformationSection: React.FC<ModelInformationSectionProps> = ({
  object,
  onPropertyChange,
}) => {
  const [localName, setLocalName] = useState(object.name || "Untitled");

  // Sync local state when object changes (but not while editing)
  useEffect(() => {
    // Only sync if we're not currently focused on the input
    setLocalName(object.name || "Untitled");
  }, [object.id]); // Only sync when object changes, not on every name change

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setLocalName(newName);
  };

  const handleNameBlur = () => {
    // Update the scene only when user finishes editing (loses focus)
    if (onPropertyChange && localName !== object.name) {
      onPropertyChange("name", localName);
    }
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Also update on Enter key
    if (event.key === "Enter") {
      event.currentTarget.blur(); // This will trigger handleNameBlur
    }
  };

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
          <TextField
            value={localName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            placeholder="Untitled"
            size="small"
            fullWidth
            sx={textFieldStyles}
          />
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
