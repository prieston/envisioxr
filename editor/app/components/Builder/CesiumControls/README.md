# Cesium Controls Module

A modular, performant, and maintainable control system for Cesium 3D navigation.

## 📁 Structure

```
CesiumControls/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript interfaces and types
├── constants.ts                # Configuration constants
├── CesiumViewModeControls.tsx  # Main component
├── README.md                   # This file
├── components/
│   └── StyledComponents.tsx    # MUI styled components
└── hooks/
    ├── useSimulationParams.ts  # Simulation configuration
    ├── useKeyboardControls.ts  # Keyboard input management
    ├── useGroundDetection.ts   # Terrain interaction
    ├── useMovementUtils.ts     # Movement calculations
    ├── useCarSimulation.ts     # Car-specific logic
    ├── useSimulation.ts        # Main simulation loop
    └── useMouseControls.ts     # Mouse input handling
```

## 🎯 Features

### Simulation Modes

- **Orbit**: Standard Cesium camera controls
- **Explore**: Free camera exploration
- **First Person**: FPS-style movement with ground detection
- **Car**: Vehicle simulation with realistic steering
- **Flight**: 3D aerial navigation
- **Settings**: Configuration mode

### Key Features

- ✅ **Ground Detection**: Realistic terrain following
- ✅ **Slope Prevention**: Prevents climbing steep terrain
- ✅ **Mouse Look**: First-person camera control
- ✅ **Car Steering**: Realistic vehicle physics
- ✅ **Performance Optimized**: 60fps animation loop
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Modular**: Reusable hooks and components

## 🚀 Usage

```tsx
import { CesiumViewModeControls } from "./CesiumControls";

const MyComponent = () => {
  const [viewMode, setViewMode] = useState("orbit");

  return (
    <CesiumViewModeControls viewMode={viewMode} setViewMode={setViewMode} />
  );
};
```

## 🎮 Controls

### First Person Mode

- **WASD**: Movement
- **Mouse**: Look around
- **Space/Shift**: Jump/crouch

### Car Mode

- **W**: Forward
- **S**: Reverse
- **W+A**: Turn left
- **W+D**: Turn right

### Flight Mode

- **WASD**: Movement
- **Arrow Keys**: Rotation
- **Space/Shift**: Climb/descend

## 🔧 Customization

### Simulation Parameters

```tsx
import { useSimulationParams } from "./hooks/useSimulationParams";

const params = useSimulationParams();
// Modify params.walkSpeed, params.carSpeed, etc.
```

### Ground Detection

```tsx
import { useGroundDetection } from "./hooks/useGroundDetection";

const { getGroundHeight } = useGroundDetection(cesiumViewer);
```

## 🧪 Testing

### Unit Tests

```tsx
// Test keyboard controls
describe("useKeyboardControls", () => {
  it("should track pressed keys correctly");
  it("should clear keys on cleanup");
});

// Test ground detection
describe("useGroundDetection", () => {
  it("should handle terrain data correctly");
  it("should prevent movement on steep slopes");
});
```

### Integration Tests

```tsx
// Test component integration
describe("CesiumViewModeControls", () => {
  it("should switch modes correctly");
  it("should handle keyboard input");
  it("should integrate with Cesium viewer");
});
```

## 📈 Performance

- **Optimized Animation Loop**: 60fps with proper cleanup
- **Memoized Calculations**: Prevents unnecessary re-renders
- **Efficient Ground Detection**: Cached terrain queries
- **Production Mode**: Debug logging only in development

## 🔄 Migration

To migrate from the old single-file component:

1. Replace the import:

   ```tsx
   // Old
   import CesiumViewModeControls from "./CesiumViewModeControls";

   // New
   import { CesiumViewModeControls } from "./CesiumControls";
   ```

2. Update any direct hook usage to use the new modular hooks

## 🤝 Contributing

When adding new features:

1. **Create new hooks** in the `hooks/` directory
2. **Add types** to `types.ts`
3. **Add constants** to `constants.ts`
4. **Update documentation** in this README
5. **Add tests** for new functionality

## 📝 License

This module is part of the EnvisioXR project.
