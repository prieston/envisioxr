"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Asset {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface LocationSearchProps {
  onAssetSelect: (assetId: string, latitude: number, longitude: number) => void;
}

export default function LocationSearch({ onAssetSelect }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setLocations([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=10`,
        {
          method: "GET",
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setLocations(
        data.map((result: any) => ({
          id: `${result.lat}-${result.lon}`,
          name: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        }))
      );
    } catch (err: any) {
      setError(err.message || "Failed to search locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async (_location: Location) => {
    setLoading(true);
    setError(null);
    try {
      const predefinedAssets: Asset[] = [
        {
          id: "2275207",
          name: "Google Photorealistic 3D",
          description: "Global photorealistic tiles",
          type: "3d-tiles",
        },
        {
          id: "2",
          name: "Cesium World Imagery",
          description: "Base imagery",
          type: "imagery",
        },
      ];
      setAssets(predefinedAssets);
    } catch (err: any) {
      setError(err.message || "Failed to fetch available assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setLocations([]);
    setSearchQuery("");
    fetchAvailableAssets(location);
  };

  const handleAssetSelect = (asset: Asset) => {
    if (selectedLocation) {
      onAssetSelect(
        asset.id,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      setSelectedLocation(null);
      setAssets([]);
    }
  };

  useEffect(() => {
    if (assets.length > 0 && selectedLocation) {
      handleAssetSelect(assets[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, selectedLocation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".location-search-paper")) {
        setLocations([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Paper
      elevation={0}
      className="location-search-paper"
      sx={{
        width: "100%",
        maxHeight: "80vh",
        overflow: "auto",
        backgroundColor: "transparent",
      }}
    >
      <Box sx={{ p: 0 }}>
        <Input
          fullWidth
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startAdornment={
            <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
          }
        />
      </Box>

      {error && (
        <Box sx={{ p: 0 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading && (
        <Box sx={{ p: 0, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {locations.length > 0 && (
        <List>
          {locations.map((location) => (
            <ListItem key={location.id}>
              <ListItemButton onClick={() => handleLocationSelect(location)}>
                <ListItemText
                  primary={location.name}
                  secondary={`${location.latitude}, ${location.longitude}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {selectedLocation && assets.length > 0 && (
        <List>
          <ListItem>
            <ListItemText
              primary="Available 3D Tiles"
              secondary={`Near ${selectedLocation.name}`}
            />
          </ListItem>
          {assets.map((asset) => (
            <ListItem key={asset.id}>
              <ListItemButton onClick={() => handleAssetSelect(asset)}>
                <ListItemText
                  primary={asset.name}
                  secondary={asset.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {selectedLocation && assets.length === 0 && !loading && (
        <Box sx={{ p: 0 }}>
          <Typography color="text.secondary">
            No 3D tiles available for this location
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
