import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography, Button, ButtonGroup } from "@mui/material";

const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  width: "100%",
  "& .MuiButton-root": {
    flex: 1,
    fontSize: "0.8rem",
    padding: theme.spacing(1),
    textTransform: "none",
  },
}));

interface BasemapSelectorProps {
  onBasemapChange: (
    basemapType: "cesium" | "google" | "google-photorealistic" | "bing" | "none"
  ) => void;
  currentBasemap?: string;
  disabled?: boolean;
}

const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  onBasemapChange,
  currentBasemap = "cesium",
  disabled = false,
}) => {
  const [selectedBasemap, setSelectedBasemap] = useState(currentBasemap);

  const handleBasemapChange = (
    basemapType: "cesium" | "google" | "google-photorealistic" | "bing" | "none"
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
          onClick={() => handleBasemapChange("bing")}
          variant={selectedBasemap === "bing" ? "contained" : "outlined"}
        >
          Bing Maps
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
