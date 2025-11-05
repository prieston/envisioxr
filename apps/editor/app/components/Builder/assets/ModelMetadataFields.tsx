"use client";

import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Slider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface MetadataField {
  label: string;
  value: string;
}

interface ModelMetadataFieldsProps {
  metadata: MetadataField[];
  onChange: (metadata: MetadataField[]) => void;
  isObservationModel?: boolean;
  onObservationModelChange?: (isObservationModel: boolean) => void;
  observationProperties?: {
    fov: number;
    showVisibleArea: boolean;
    visibilityRadius: number;
  };
  onObservationPropertiesChange?: (properties: {
    fov: number;
    showVisibleArea: boolean;
    visibilityRadius: number;
  }) => void;
}

const ModelMetadataFields: React.FC<ModelMetadataFieldsProps> = ({
  metadata,
  onChange,
  isObservationModel = false,
  onObservationModelChange,
  observationProperties = {
    fov: 90,
    showVisibleArea: false,
    visibilityRadius: 100,
  },
  onObservationPropertiesChange,
}) => {
  const handleAddField = () =>
    onChange([...metadata, { label: "", value: "" }]);

  const handleRemoveField = (index: number) => {
    const newMetadata = metadata.filter((_, i) => i !== index);
    onChange(newMetadata);
  };

  const handleFieldChange = (
    index: number,
    field: "label" | "value",
    newValue: string
  ) => {
    const newMetadata = metadata.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: newValue };
      }
      return item;
    });
    onChange(newMetadata);
  };

  // Memoize metadata fields list to prevent unnecessary re-renders
  const memoizedMetadataFields = useMemo(() => {
    return metadata.map((field, index) => (
      <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          id={`metadata-label-${index}`}
          name={`metadata-label-${index}`}
          label="Label"
          size="small"
          value={field.label}
          onChange={(e) =>
            handleFieldChange(index, "label", e.target.value)
          }
          sx={{ flex: 1 }}
        />
        <TextField
          id={`metadata-value-${index}`}
          name={`metadata-value-${index}`}
          label="Value"
          size="small"
          value={field.value}
          onChange={(e) =>
            handleFieldChange(index, "value", e.target.value)
          }
          sx={{ flex: 1 }}
        />
        <IconButton
          onClick={() => handleRemoveField(index)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    ));
  }, [metadata, handleFieldChange, handleRemoveField]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Model Information
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {memoizedMetadataFields}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddField}
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        >
          Add Field
        </Button>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Observation Model Properties
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isObservationModel}
                onChange={(e) => onObservationModelChange?.(e.target.checked)}
              />
            }
            label="Is Observation Model"
          />

          {isObservationModel && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Field of View (degrees)
              </Typography>
              <Slider
                value={observationProperties.fov}
                min={10}
                max={360}
                onChange={(_, value) =>
                  onObservationPropertiesChange?.({
                    ...observationProperties,
                    fov: value as number,
                  })
                }
                valueLabelDisplay="auto"
              />

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ mt: 2 }}
              >
                Visibility Radius (meters)
              </Typography>
              <Slider
                value={observationProperties.visibilityRadius}
                min={10}
                max={1000}
                onChange={(_, value) =>
                  onObservationPropertiesChange?.({
                    ...observationProperties,
                    visibilityRadius: value as number,
                  })
                }
                valueLabelDisplay="auto"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={observationProperties.showVisibleArea}
                    onChange={(e) =>
                      onObservationPropertiesChange?.({
                        ...observationProperties,
                        showVisibleArea: e.target.checked,
                      })
                    }
                  />
                }
                label="Show Visible Area"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ModelMetadataFields;
