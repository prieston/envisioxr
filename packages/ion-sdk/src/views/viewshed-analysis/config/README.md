# Viewshed Throttling Configuration

This module provides a centralized configuration system for controlling viewshed analysis update throttling.

## Overview

When multiple viewshed analyses are active, inactive (non-selected) viewsheds are throttled to reduce computational load and prevent performance issues. The selected viewshed always updates at full speed for smooth interaction.

## Configuration

### Default Settings

```typescript
{
  enabled: true,                    // Enable/disable throttling
  inactiveUpdateIntervalMs: 1000   // Update interval for inactive viewsheds (1 second)
}
```

### Configuration Options

- **`enabled`**: `boolean` - When `false`, all viewsheds update at full RAF speed (~60fps). When `true`, inactive viewsheds are throttled.
- **`inactiveUpdateIntervalMs`**: `number` - Milliseconds between updates for inactive viewsheds. Lower values = more frequent updates (better visuals, higher CPU). Higher values = less frequent updates (worse visuals, lower CPU).

## Usage

### Get Current Configuration

```typescript
import { getThrottleConfig } from "@envisio/ion-sdk";

const config = getThrottleConfig();
console.log(config); // { enabled: true, inactiveUpdateIntervalMs: 1000 }
```

### Update Configuration

```typescript
import { updateThrottleConfig } from "@envisio/ion-sdk";

// Disable throttling (all viewsheds update at full speed)
updateThrottleConfig({ enabled: false });

// Change throttle interval to 500ms
updateThrottleConfig({ inactiveUpdateIntervalMs: 500 });

// Change both
updateThrottleConfig({
  enabled: true,
  inactiveUpdateIntervalMs: 2000
});
```

### Reset to Defaults

```typescript
import { resetThrottleConfig } from "@envisio/ion-sdk";

resetThrottleConfig();
```

## Examples

### Disable Throttling for High-End Devices

```typescript
import { updateThrottleConfig } from "@envisio/ion-sdk";

// Disable throttling to allow all viewsheds to update smoothly
// Only recommended for powerful devices with few viewsheds
updateThrottleConfig({ enabled: false });
```

### Aggressive Throttling for Many Viewsheds

```typescript
import { updateThrottleConfig } from "@envisio/ion-sdk";

// Throttle inactive viewsheds to update every 2 seconds
// Useful when you have 10+ viewsheds active
updateThrottleConfig({ inactiveUpdateIntervalMs: 2000 });
```

### Balanced Performance (Recommended)

```typescript
import { updateThrottleConfig } from "@envisio/ion-sdk";

// Default: 1 second updates for inactive viewsheds
// Good balance between performance and visual quality
updateThrottleConfig({
  enabled: true,
  inactiveUpdateIntervalMs: 1000
});
```

### Fine-Tuned Updates

```typescript
import { updateThrottleConfig } from "@envisio/ion-sdk";

// Update inactive viewsheds every 500ms for smoother visuals
// Better for presentations/demos, uses more CPU
updateThrottleConfig({ inactiveUpdateIntervalMs: 500 });
```

## Performance Guidelines

- **1-5 viewsheds**: Can disable throttling (`enabled: false`) or use 500ms interval
- **6-10 viewsheds**: Use default 1000ms interval
- **10+ viewsheds**: Use 1500-2000ms interval or ensure only 1-2 have `showViewshed: true`

## Notes

- Configuration changes take effect immediately for all viewsheds
- Active (selected) viewsheds always update at full speed regardless of configuration
- Configuration is global and affects all viewshed analysis instances
- The configuration persists for the lifetime of the application unless reset

