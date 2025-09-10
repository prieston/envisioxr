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
    <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-75 rounded-lg p-3 text-white">
      <h3 className="text-sm font-semibold mb-2">Basemap</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleBasemapChange("cesium")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "cesium"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          Cesium World Imagery
        </button>
        <button
          onClick={() => handleBasemapChange("google")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "google"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          Google Satellite
        </button>
        <button
          onClick={() => handleBasemapChange("none")}
          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            selectedBasemap === "none"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          No Basemap
        </button>
      </div>
    </div>
  );
}
