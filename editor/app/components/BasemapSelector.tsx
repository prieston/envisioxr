"use client";

import { useState } from "react";

interface BasemapSelectorProps {
  onBasemapChange: (basemapType: "cesium" | "google" | "bing" | "none") => void;
  currentBasemap?: string;
  disabled?: boolean;
}

export default function BasemapSelector({
  onBasemapChange,
  currentBasemap = "none",
  disabled = false,
}: BasemapSelectorProps) {
  const [selectedBasemap, setSelectedBasemap] = useState(currentBasemap);

  const handleBasemapChange = (basemapType: "cesium" | "google" | "none") => {
    setSelectedBasemap(basemapType);
    onBasemapChange(basemapType);
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10 bg-surface-2/80 rounded-lg p-3 text-text-primary backdrop-blur">
      <h3 className="text-sm font-semibold mb-2">Basemap</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleBasemapChange("cesium")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "cesium"
              ? "bg-primary text-white"
              : "bg-surface-1 hover:bg-surface-2 text-text-secondary"
          }`}
        >
          Cesium World Imagery
        </button>
        <button
          onClick={() => handleBasemapChange("google")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "google"
              ? "bg-primary text-white"
              : "bg-surface-1 hover:bg-surface-2 text-text-secondary"
          }`}
        >
          Google Satellite
        </button>
        <button
          onClick={() => handleBasemapChange("none")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "none"
              ? "bg-primary text-white"
              : "bg-surface-1 hover:bg-surface-2 text-text-secondary"
          }`}
        >
          No Basemap
        </button>
      </div>
    </div>
  );
}
