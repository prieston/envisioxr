# Cesium Camera Control System

A comprehensive, reusable camera control system for Cesium.js that provides different simulation modes with realistic physics and intuitive controls.

## Features

### 🚶 Walk Simulation (First Person)

- **Mouse Look**: Pointer lock for natural head movement
- **WASD Movement**: Forward/back/strafe with physics
- **Jumping**: Space key with gravity and ground detection
- **Crouching**: Shift key for lower height
- **Ground Following**: Automatic terrain collision detection

### 🚗 Car Simulation

- **Realistic Steering**: Arrow keys for turning with speed-based physics
- **WASD Movement**: Forward/back with acceleration/deceleration
- **Ground Following**: Stays on terrain with proper height
- **No Mouse Look**: Camera follows car direction naturally

### ✈️ Flight Simulation

- **6DOF Movement**: Full 3D movement with WASD + Space/Shift
- **Mouse Look**: Optional pointer lock for camera control
- **Arrow Keys**: Pitch/yaw rotation
- **Physics**: Momentum and friction for realistic flight
- **Free Flight**: No ground collision, true 3D navigation

### 🎯 Orbit/Explore

- **Standard Cesium Controls**: Default camera behavior
- **Smooth Transitions**: Seamless switching between modes

## Architecture

### Base System

- **BaseCameraController**: Abstract base class for all controllers
- **CameraControllerManager**: Manages switching between modes
- **useCameraControllerManager**: React hook for easy integration

### Controllers

- **FirstPersonWalkController**: Walk simulation with physics
- **CarController**: Vehicle simulation with steering
- **FlightController**: 3D flight with 6DOF movement

## Usage

### Basic Integration

```tsx
import { useCameraControllerManager } from "./CesiumControls/hooks/useCameraControllerManager";

function MyCesiumComponent() {
  const { cesiumViewer } = useSceneStore();
  const { switchToMode, isModeActive } =
    useCameraControllerManager(cesiumViewer);

  return (
    <div>
      <button onClick={() => switchToMode("firstPerson")}>Walk Mode</button>
      <button onClick={() => switchToMode("car")}>Drive Mode</button>
      <button onClick={() => switchToMode("flight")}>Fly Mode</button>
    </div>
  );
}
```

### Advanced Configuration

```tsx
const { updateControllerConfig } = useCameraControllerManager(cesiumViewer);

// Configure walk simulation
updateControllerConfig("firstPerson", {
  speed: 8,
  maxSpeed: 15,
  jumpForce: 10,
  sensitivity: 0.001,
  debugMode: true,
});

// Configure car simulation
updateControllerConfig("car", {
  maxSpeed: 25,
  acceleration: 20,
  height: 2.0,
});
```

## Controls

### Walk Mode

- **WASD**: Movement
- **Mouse**: Look around (with pointer lock)
- **Space**: Jump
- **Shift**: Crouch

### Car Mode

- **WASD**: Forward/back movement
- **Arrow Keys**: Steering
- **No Mouse**: Camera follows car direction

### Flight Mode

- **WASD**: Forward/back/strafe
- **Space/Shift**: Up/down
- **Arrow Keys**: Pitch/yaw rotation
- **Mouse**: Optional look around (with pointer lock)

## Configuration Options

```typescript
interface CameraControllerConfig {
  speed: number; // Base movement speed
  maxSpeed: number; // Maximum speed limit
  acceleration: number; // Acceleration rate
  friction: number; // Friction coefficient (0-1)
  jumpForce: number; // Jump strength (walk mode)
  gravity: number; // Gravity strength (walk mode)
  height: number; // Height above ground
  sensitivity: number; // Mouse sensitivity
  debugMode: boolean; // Enable debug logging
}
```

## Benefits

### ✅ Reusable Architecture

- Extensible base system
- Easy to add new simulation modes
- Consistent API across all controllers

### ✅ Realistic Physics

- Proper momentum and acceleration
- Ground collision detection
- Gravity and jumping mechanics

### ✅ Intuitive Controls

- Mode-specific control schemes
- Pointer lock for first-person modes
- Smooth transitions between modes

### ✅ Performance Optimized

- Efficient animation loops
- Minimal memory footprint
- Smooth 60fps operation

## Extending the System

### Adding a New Controller

```typescript
export class MyCustomController extends BaseCameraController {
  initialize(): void {
    // Set up your controller
  }

  update(deltaTime: number): void {
    // Update logic here
  }

  dispose(): void {
    // Cleanup
  }
}
```

### Registering with Manager

```typescript
// In CameraControllerManager
this.controllers.set(
  "myMode",
  new MyCustomController(this.cesiumViewer, config)
);
```

## Troubleshooting

### Common Issues

1. **Pointer Lock Not Working**

   - Ensure user interaction (click) before requesting pointer lock
   - Check browser security policies

2. **Ground Detection Issues**

   - Verify terrain is loaded
   - Check ground height calculation

3. **Performance Issues**
   - Reduce update frequency
   - Disable debug mode in production

### Debug Mode

Enable debug logging:

```typescript
updateControllerConfig("firstPerson", { debugMode: true });
```

This will log detailed information about controller state and physics calculations.
