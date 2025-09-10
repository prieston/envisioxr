# Cesium Advanced Positioning Guide

This guide explains how to use the new advanced positioning system for accurate 3D model placement in Cesium.

## Overview

The new positioning system provides multiple picking strategies to achieve the most accurate positioning for different surface types:

- **3D Tiles**: Buildings, structures, and detailed 3D content
- **Terrain**: Ground surfaces with elevation data
- **Ellipsoid**: Fallback for basic globe positioning

## Key Features

### 1. Multi-Strategy Picking

The system tries multiple picking methods in order of accuracy:

1. **3D Tiles Picking** (highest accuracy for buildings)
2. **Terrain Ray Casting** (accurate ground placement)
3. **Ellipsoid Intersection** (fallback method)

### 2. Surface Type Detection

Each positioning result includes:

- `surfaceType`: The type of surface detected
- `accuracy`: High/Medium/Low accuracy level
- `confidence`: Confidence score (0-1)

### 3. Adaptive Strategy

The system automatically chooses the best strategy based on:

- Camera height
- Available terrain data
- Surface type preferences

## Usage Examples

### Basic Positioning

```typescript
import { getPositionAtScreenPoint } from "./cesiumPositioningUtils";

// Get position at screen coordinates
const result = getPositionAtScreenPoint(viewer, mouseX, mouseY);

if (result) {
  const [longitude, latitude, height] = result.position;
  console.log(`Position: ${longitude}, ${latitude}, ${height}`);
  console.log(`Surface: ${result.surfaceType}, Accuracy: ${result.accuracy}`);
}
```

### Custom Positioning Options

```typescript
const result = getPositionAtScreenPoint(viewer, mouseX, mouseY, {
  prefer3DTiles: true, // Prefer 3D tiles for buildings
  preferTerrain: true, // Also try terrain
  maxTerrainDistance: 1000, // Max distance for terrain picking
  fallbackToEllipsoid: true, // Use ellipsoid as fallback
});
```

### Surface-Specific Positioning

```typescript
import { CesiumPositioningUtils } from "./cesiumPositioningUtils";

const positioningUtils = new CesiumPositioningUtils(viewer);

// For ground placement
const groundOptions =
  positioningUtils.getPositioningOptionsForSurfaceType("ground");

// For building placement
const buildingOptions =
  positioningUtils.getPositioningOptionsForSurfaceType("building");

// For mixed environments
const mixedOptions =
  positioningUtils.getPositioningOptionsForSurfaceType("mixed");
```

## Positioning Strategies

### Ground Placement

Best for placing models on terrain:

```typescript
{
  preferTerrain: true,
  prefer3DTiles: false,
  maxTerrainDistance: 2000,
  fallbackToEllipsoid: true
}
```

### Building Placement

Best for placing models on buildings/structures:

```typescript
{
  prefer3DTiles: true,
  preferTerrain: false,
  maxTerrainDistance: 100,
  fallbackToEllipsoid: true
}
```

### Mixed Environment

Best for general use:

```typescript
{
  prefer3DTiles: true,
  preferTerrain: true,
  maxTerrainDistance: 1000,
  fallbackToEllipsoid: true
}
```

## Integration with Right Panel

The Right Panel now uses this advanced positioning system automatically. When you:

1. **Select a model** from the asset library
2. **Click "Select Position"**
3. **Click on the map**

The system will:

- Try to pick from 3D tiles first (for buildings)
- Fall back to terrain picking (for ground)
- Use ellipsoid intersection as final fallback
- Show you the surface type and accuracy in the toast message

## Tips for Best Results

### For Google Photorealistic Tiles

- Use `prefer3DTiles: true` for building placement
- Use `preferTerrain: true` for ground placement
- Set `maxTerrainDistance` based on your camera height

### For Cesium World Terrain

- Use `preferTerrain: true` for accurate ground placement
- The system will automatically use terrain height data

### For Private Tiles

- The system works with any 3D tiles loaded in Cesium
- Adjust `maxTerrainDistance` based on your tile resolution

### For Globe-Only Positioning

- Use `prefer3DTiles: false, preferTerrain: false`
- This will use ellipsoid intersection only

## Troubleshooting

### No Position Detected

- Check if you're clicking on a visible surface
- Try adjusting camera height
- Verify terrain data is loaded

### Inaccurate Positioning

- Check the accuracy level in the result
- Try different positioning options
- Adjust `maxTerrainDistance` based on camera height

### Performance Issues

- The system is optimized for real-time use
- Multiple picking attempts are cached
- Terrain sampling is asynchronous

## API Reference

### PositioningResult

```typescript
interface PositioningResult {
  position: [number, number, number]; // [longitude, latitude, height]
  surfaceType: "3d_tiles" | "terrain" | "ellipsoid" | "none";
  accuracy: "high" | "medium" | "low";
  confidence: number; // 0-1
}
```

### PositioningOptions

```typescript
interface PositioningOptions {
  prefer3DTiles?: boolean;
  preferTerrain?: boolean;
  maxTerrainDistance?: number;
  fallbackToEllipsoid?: boolean;
}
```

### Main Functions

- `getPositionAtScreenPoint(viewer, x, y, options?)`: Get position at screen coordinates
- `createPositioningUtils(viewer)`: Create positioning utility instance
- `CesiumPositioningUtils.getOptimalPositioningStrategy()`: Get optimal strategy for current view
- `CesiumPositioningUtils.getPositioningOptionsForSurfaceType(type)`: Get options for specific surface type
