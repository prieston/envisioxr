import React, { useState, memo, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useSceneStore } from "@klorad/core";
import { ScrollContainer } from "../components/ScrollContainer";
import CesiumFeatureProperties from "../../CesiumFeatureProperties";

interface CesiumFeatureViewProps {
  selectedCesiumFeature: {
    properties: Record<string, any>;
  };
}

/**
 * CesiumFeatureView - Displays IFC/BIM element properties
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const CesiumFeatureView: React.FC<CesiumFeatureViewProps> = memo(
  ({ selectedCesiumFeature }) => {
    const [showEmptyFields, setShowEmptyFields] = useState(false);
    const setSelectedCesiumFeature = useSceneStore(
      (state) => state.setSelectedCesiumFeature
    );

    return (
      <ScrollContainer>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "rgba(51, 65, 85, 0.95)",
              }}
            >
              IFC Element Properties
            </Typography>
            <Button
              size="small"
              onClick={() => setSelectedCesiumFeature(null)}
              aria-label="Clear selected Cesium feature"
              sx={{
                minWidth: "auto",
                padding: "4px 8px",
                fontSize: "0.7rem",
              }}
            >
              Clear
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "rgba(100, 116, 139, 0.8)",
              }}
            >
              {useMemo(() => Object.keys(selectedCesiumFeature.properties).length, [selectedCesiumFeature.properties])} properties
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showEmptyFields}
                  onChange={(e) => setShowEmptyFields(e.target.checked)}
                  size="small"
                  sx={{
                    padding: "4px",
                  }}
                />
              }
              label="Show empty"
              sx={{
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.7rem",
                  color: "rgba(100, 116, 139, 0.9)",
                },
              }}
            />
          </Box>
        </Box>

        <CesiumFeatureProperties
          properties={selectedCesiumFeature.properties}
          showEmptyFields={showEmptyFields}
        />
      </ScrollContainer>
    );
  },
  (prevProps, nextProps) => {
    // Reference equality - assumes upstream creates new properties object on change
    return (
      prevProps.selectedCesiumFeature.properties ===
      nextProps.selectedCesiumFeature.properties
    );
  }
);

CesiumFeatureView.displayName = "CesiumFeatureView";
