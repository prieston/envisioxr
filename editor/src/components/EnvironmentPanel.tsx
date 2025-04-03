import React, { useState } from "react";
import useSceneStore from "../../app/hooks/useSceneStore";
import LocationSearch from "../../app/components/LocationSearch";

const EnvironmentPanel: React.FC = () => {
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const {
    gridEnabled,
    setGridEnabled,
    skyboxType,
    setSkyboxType,
    ambientLightIntensity,
    setAmbientLightIntensity,
    addGoogleTiles,
    addCesiumIonTiles,
    selectedAssetId,
    selectedLocation,
    showTiles,
    setShowTiles,
  } = useSceneStore((state) => ({
    gridEnabled: state.gridEnabled,
    setGridEnabled: state.setGridEnabled,
    skyboxType: state.skyboxType,
    setSkyboxType: state.setSkyboxType,
    ambientLightIntensity: state.ambientLightIntensity,
    setAmbientLightIntensity: state.setAmbientLightIntensity,
    addGoogleTiles: state.addGoogleTiles,
    addCesiumIonTiles: state.addCesiumIonTiles,
    selectedAssetId: state.selectedAssetId,
    selectedLocation: state.selectedLocation,
    showTiles: state.showTiles,
    setShowTiles: state.setShowTiles,
  }));

  const handleAssetSelect = (
    assetId: string,
    latitude: number,
    longitude: number
  ) => {
    useSceneStore.getState().setSelectedAssetId(assetId);
    useSceneStore.getState().setSelectedLocation({ latitude, longitude });
  };

  const handleTilesToggle = () => {
    if (!showTiles) {
      // If enabling tiles, check which type to add
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        addGoogleTiles(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
      } else {
        addCesiumIonTiles();
      }
    }
    setShowTiles(!showTiles);
  };

  const handleGoogleTilesAdd = () => {
    if (googleApiKey) {
      addGoogleTiles(googleApiKey);
      setShowApiKeyInput(false);
      setShowTiles(true);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Environment Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Environment Settings</h3>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={(e) => setGridEnabled(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>Show Grid</span>
          </label>

          <div className="space-y-2">
            <label className="block">Skybox</label>
            <select
              value={skyboxType}
              onChange={(e) =>
                setSkyboxType(e.target.value as "default" | "none")
              }
              className="w-full bg-gray-700 rounded-md px-3 py-2"
            >
              <option value="default">Default Sky</option>
              <option value="none">No Sky</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block">Ambient Light</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ambientLightIntensity}
              onChange={(e) => setAmbientLightIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 3D Tiles Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3D Tiles</h3>

        <div className="space-y-4">
          {/* Tiles Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showTiles}
              onChange={handleTilesToggle}
              className="form-checkbox h-4 w-4 text-blue-500"
            />
            <span>Enable 3D Tiles</span>
          </label>

          {/* Location Search - Only show when tiles are enabled */}
          {showTiles && (
            <div className="space-y-3">
              <h4 className="font-medium">Location Search</h4>
              <LocationSearch onAssetSelect={handleAssetSelect} />
              {selectedLocation && (
                <div className="text-sm text-gray-400">
                  <div>Latitude: {selectedLocation.latitude}</div>
                  <div>Longitude: {selectedLocation.longitude}</div>
                  <div>Asset ID: {selectedAssetId}</div>
                </div>
              )}
            </div>
          )}

          {/* Google Maps Option - Only show when tiles are disabled */}
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && !showTiles && (
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Use Google Maps Tiles
            </button>
          )}

          {showApiKeyInput && !showTiles && (
            <div className="space-y-2">
              <input
                type="text"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                placeholder="Enter Google Maps API Key"
                className="w-full px-3 py-2 bg-gray-700 rounded-md"
              />
              <button
                onClick={handleGoogleTilesAdd}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md transition-colors"
              >
                Add Google Tiles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPanel;
