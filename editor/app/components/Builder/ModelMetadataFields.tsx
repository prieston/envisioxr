"use client";

import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
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
}

const ModelMetadataFields: React.FC<ModelMetadataFieldsProps> = ({
  metadata,
  onChange,
}) => {
  const handleAddField = () => {
    onChange([...metadata, { label: "", value: "" }]);
  };

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

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Model Information
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {metadata.map((field, index) => (
          <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              label="Label"
              size="small"
              value={field.label}
              onChange={(e) =>
                handleFieldChange(index, "label", e.target.value)
              }
              sx={{ flex: 1 }}
            />
            <TextField
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
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddField}
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        >
          Add Field
        </Button>
      </Paper>
    </Box>
  );
};

export default ModelMetadataFields;
