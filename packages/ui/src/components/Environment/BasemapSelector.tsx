"use client";

import React, { useState, useMemo } from "react";
import { Button, Box, Typography, ButtonGroup } from "@mui/material";
import { styled } from "@mui/material/styles";

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

export type BasemapType =
  | "cesium"
  | "google"
  | "google-photorealistic"
  | "none";

export interface BasemapOption {
  value: BasemapType;
  label: string;
}

export interface BasemapSelectorProps {
  onBasemapChange: (basemapType: BasemapType) => void;
  currentBasemap?: BasemapType;
  disabled?: boolean;
  options?: BasemapOption[];
  title?: string;
}

const defaultOptions: BasemapOption[] = [
  { value: "cesium", label: "Cesium World Imagery" },
  { value: "google", label: "Google Satellite" },
  { value: "google-photorealistic", label: "Google Photorealistic" },
  { value: "none", label: "No Basemap" },
];

export default function BasemapSelector({
  onBasemapChange,
  currentBasemap = "none",
  disabled = false,
  options = defaultOptions,
  title = "Basemap",
}: BasemapSelectorProps) {
  const [selectedBasemap, setSelectedBasemap] =
    useState<BasemapType>(currentBasemap);

  const handleBasemapChange = (basemapType: BasemapType) => {
    setSelectedBasemap(basemapType);
    onBasemapChange(basemapType);
  };

  if (disabled) {
    return null;
  }

  // Memoize options list to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => {
    return options.map((option) => (
      <Button
        key={option.value}
        onClick={() => handleBasemapChange(option.value)}
        variant={selectedBasemap === option.value ? "contained" : "outlined"}
      >
        {option.label}
      </Button>
    ));
  }, [options, selectedBasemap, handleBasemapChange]);

  return (
    <Container>
      <SectionTitle>{title}</SectionTitle>
      <StyledButtonGroup
        orientation="vertical"
        variant="outlined"
        size="small"
        disabled={disabled}
      >
        {memoizedOptions}
      </StyledButtonGroup>
    </Container>
  );
}
