# Configuration-Based Panel System

This directory contains the configuration-based approach for managing panel settings across different rendering engines (ThreeJS and Cesium).

## Overview

The new system uses a factory pattern and configuration objects to dynamically generate panel settings based on the current rendering engine. This allows for:

- **Engine-specific settings**: Different configurations for ThreeJS vs Cesium
- **Easy maintenance**: Settings are defined in configuration objects rather than hardcoded in components
- **Extensibility**: Easy to add new settings, panels, or engines
- **Type safety**: Full TypeScript support with proper interfaces

## File Structure

```
config/
├── leftPanelConfig.ts      # Configuration for left panel settings
├── panelConfigFactory.ts   # Factory functions to get configurations
└── README.md              # This file

types/
└── panelConfig.ts         # TypeScript interfaces and types
```

## Components

```
components/Builder/
├── SettingRenderer.tsx        # Generic component to render any setting type
├── SceneObjectsList.tsx       # Custom component for scene objects list
├── LocationSearchSection.tsx  # Custom component for location/tiles management
└── LeftPanelNew.tsx          # New refactored left panel using configuration
```

## Configuration Types

### PanelSetting

Defines a single setting with properties like:

- `id`: Unique identifier
- `type`: Component type (switch, slider, dropdown, button, text, number, color, list, custom)
- `label`: Display label
- `description`: Optional description
- `defaultValue`: Default value
- `options`: For dropdown components
- `min/max/step`: For slider/number components
- `onChange`: Callback function
- `customComponent`: For custom components

### PanelTab

Defines a tab within a panel:

- `id`: Unique identifier
- `label`: Display label
- `icon`: Optional icon component
- `settings`: Array of PanelSetting objects

### PanelConfiguration

Defines a complete panel:

- `id`: Unique identifier
- `name`: Display name
- `tabs`: Array of PanelTab objects

## Usage

### Getting a Configuration

```typescript
import { getLeftPanelConfig } from "../config/panelConfigFactory";

const config = getLeftPanelConfig(); // Automatically detects engine
```

### Using the New Left Panel

```typescript
import LeftPanelNew from "./components/Builder/LeftPanelNew";

// Replace the old LeftPanel with LeftPanelNew in AdminLayout.tsx
```

### Adding New Settings

1. Update the configuration in `leftPanelConfig.ts`
2. Add any new custom components if needed
3. The SettingRenderer will automatically handle the new setting

### Adding New Engines

1. Create a new configuration function in `leftPanelConfig.ts`
2. Update the factory function in `panelConfigFactory.ts`
3. Add the new engine type to the world types

## Current ThreeJS Configuration

The ThreeJS configuration includes:

### Assets Tab

- Scene Objects List (custom component)

### Environment Tab

- Show Grid (switch)
- Skybox Type (dropdown)
- Ambient Light (slider)
- Location & Tiles (custom component with location search and Cesium Ion assets)

## Migration Steps

1. **Test the new system**: Temporarily replace `LeftPanel` with `LeftPanelNew` in `AdminLayout.tsx`
2. **Verify functionality**: Ensure all settings work as expected
3. **Add Cesium-specific settings**: Extend the Cesium configuration with basemap selector
4. **Apply to other panels**: Use the same pattern for RightPanel and BottomPanel
5. **Remove old components**: Once verified, remove the old LeftPanel.tsx and EnvironmentPanel.tsx

## Benefits

- **Maintainability**: Settings are centralized in configuration files
- **Flexibility**: Easy to add/remove/modify settings without touching components
- **Engine Support**: Automatic switching between ThreeJS and Cesium configurations
- **Type Safety**: Full TypeScript support prevents configuration errors
- **Reusability**: The SettingRenderer can be used for any panel
