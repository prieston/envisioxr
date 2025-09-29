import React, { useState } from "react";
import { Button } from "@mui/material";
import {
  Container,
  SectionTitle,
  StyledButtonGroup,
} from "./BasemapSelector.styles";

interface BasemapSelectorProps {
  onBasemapChange: (
    basemapType: "cesium" | "google" | "google-photorealistic" | "none"
  ) => void;
  currentBasemap?: string;
  disabled?: boolean;
}

const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  onBasemapChange,
  currentBasemap = "none",
  disabled = false,
}) => {
  const [selectedBasemap, setSelectedBasemap] = useState(currentBasemap);

  const handleBasemapChange = (
    basemapType: "cesium" | "google" | "google-photorealistic" | "none"
  ) => {
    setSelectedBasemap(basemapType);
    onBasemapChange(basemapType);
  };

  if (disabled) {
    return null;
  }

  return (
    <Container>
      <SectionTitle>Basemap</SectionTitle>
      <StyledButtonGroup
        orientation="vertical"
        variant="outlined"
        size="small"
        disabled={disabled}
      >
        <Button
          onClick={() => handleBasemapChange("cesium")}
          variant={selectedBasemap === "cesium" ? "contained" : "outlined"}
        >
          Cesium World Imagery
        </Button>
        <Button
          onClick={() => handleBasemapChange("google")}
          variant={selectedBasemap === "google" ? "contained" : "outlined"}
        >
          Google Satellite
        </Button>
        <Button
          onClick={() => handleBasemapChange("google-photorealistic")}
          variant={
            selectedBasemap === "google-photorealistic"
              ? "contained"
              : "outlined"
          }
        >
          Google Photorealistic
        </Button>
        <Button
          onClick={() => handleBasemapChange("none")}
          variant={selectedBasemap === "none" ? "contained" : "outlined"}
        >
          No Basemap
        </Button>
      </StyledButtonGroup>
    </Container>
  );
};

export default BasemapSelector;
