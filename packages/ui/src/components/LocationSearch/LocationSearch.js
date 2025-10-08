"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Input, List, ListItem, ListItemText, ListItemButton, Paper, CircularProgress, Box, Typography, Alert, } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { inputStyles } from "../../styles/inputStyles";
const LocationSearch = ({ onAssetSelect, boxPadding = 2, }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [locations, setLocations] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const searchLocations = async (query) => {
        if (!query.trim()) {
            setLocations([]);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`, {
                method: "GET",
                headers: {
                    "Accept-Language": "en-US,en;q=0.9",
                    "User-Agent": "EnvisioXR/1.0",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid response format");
            }
            setLocations(data.map((result) => ({
                id: `${result.lat}-${result.lon}`,
                name: result.display_name,
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
            })));
        }
        catch (error) {
            console.error("Error searching locations:", error);
            setError(error.message || "Failed to search locations");
            setLocations([]);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchAvailableAssets = async (_location) => {
        setLoading(true);
        setError(null);
        try {
            // Predefined list of assets
            const predefinedAssets = [
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
        }
        catch (error) {
            console.error("Error fetching assets:", error);
            setError(error.message || "Failed to fetch available assets");
            setAssets([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            searchLocations(searchQuery);
        }, 300);
        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);
    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setLocations([]);
        setSearchQuery("");
        fetchAvailableAssets(location);
    };
    const handleAssetSelect = (asset) => {
        if (selectedLocation) {
            onAssetSelect(asset.id, selectedLocation.latitude, selectedLocation.longitude);
            setSelectedLocation(null);
            setAssets([]);
        }
    };
    // Auto-select first asset when assets are loaded
    useEffect(() => {
        if (assets.length > 0 && selectedLocation) {
            handleAssetSelect(assets[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assets, selectedLocation]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest(".location-search-paper")) {
                setLocations([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (_jsxs(Paper, { elevation: 0, className: "location-search-paper", sx: {
            width: "100%",
            maxHeight: "80vh",
            overflow: "auto",
            backgroundColor: "transparent",
        }, children: [_jsx(Box, { children: _jsx(Input, { fullWidth: true, placeholder: "Search for a location...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), startAdornment: _jsx(SearchIcon, { sx: { mr: 1, color: "text.secondary" } }), sx: Object.assign(Object.assign({}, inputStyles), { paddingLeft: "8px" }) }) }), error && (_jsx(Box, { sx: { p: boxPadding }, children: _jsx(Alert, { severity: "error", children: error }) })), loading && (_jsx(Box, { sx: { p: boxPadding, display: "flex", justifyContent: "center" }, children: _jsx(CircularProgress, { size: 24 }) })), locations.length > 0 && (_jsx(List, { children: locations.map((location) => (_jsx(ListItem, { children: _jsx(ListItemButton, { onClick: () => handleLocationSelect(location), children: _jsx(ListItemText, { primary: location.name, secondary: `${location.latitude}, ${location.longitude}` }) }) }, location.id))) })), selectedLocation && assets.length > 0 && (_jsxs(List, { children: [_jsx(ListItem, { children: _jsx(ListItemText, { primary: "Available 3D Tiles", secondary: `Near ${selectedLocation.name}` }) }), assets.map((asset) => (_jsx(ListItem, { children: _jsx(ListItemButton, { onClick: () => handleAssetSelect(asset), children: _jsx(ListItemText, { primary: asset.name, secondary: asset.description }) }) }, asset.id)))] })), selectedLocation && assets.length === 0 && !loading && (_jsx(Box, { sx: { p: boxPadding }, children: _jsx(Typography, { color: "text.secondary", children: "No 3D tiles available for this location" }) }))] }));
};
export default LocationSearch;
//# sourceMappingURL=LocationSearch.js.map