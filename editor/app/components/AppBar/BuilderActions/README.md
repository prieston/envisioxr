# BuilderActions Component

A modular, well-architected implementation following proper package separation principles.

## Quick Start

```tsx
import BuilderActions from "@/app/components/AppBar/BuilderActions";

<BuilderActions
  onSave={handleSave}
  onPublish={handlePublish}
  setSelectingPosition={setSelectingPosition}
  setSelectedPosition={setSelectedPosition}
  setPendingModel={setPendingModel}
/>;
```

## Architecture Overview

This component demonstrates proper separation of concerns across packages:

```
┌─────────────────────────────────┐
│        Editor App               │
│  ┌──────────────────────────┐   │
│  │  BuilderActions          │   │
│  │  useAssetManager         │   │
│  │  useCesiumIon            │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
         │              │
         ▼              ▼
┌──────────────┐  ┌────────────────┐
│ @envisio/ui  │  │ engine-cesium  │
│ • ActionBtn  │  │ • IonUpload    │
│ • FileUtils  │  │ • Polling      │
└──────────────┘  └────────────────┘
```

## Package Distribution

### `@envisio/ui` - Generic UI Components

- **ActionButton** - Reusable toolbar button
- **dataURLtoBlob** - File conversion utility
- **uploadFileWithProgress** - Generic upload with progress

### `@envisio/engine-cesium` - Pure Engine Logic

- **useCesiumIonUpload** - Core Cesium Ion operations
- Asset polling, S3 uploads, type mapping
- No app-specific dependencies

### Editor App - Business Logic

- **BuilderActions** - Main component orchestration
- **useAssetManager** - Asset CRUD with API integration
- **useCesiumIon** - Wraps engine hook with app APIs

## File Structure

```
BuilderActions/
├── index.tsx                  # Main component
├── hooks/
│   ├── useAssetManager.ts    # Asset management + API
│   ├── useCesiumIon.ts       # Ion integration + API
│   └── index.ts
└── README.md                  # This file
```

## Key Benefits

✅ **Reusable** - UI components work anywhere
✅ **Testable** - Each layer tested independently
✅ **Maintainable** - Clear boundaries, easy changes
✅ **Type-safe** - Full TypeScript support

## Usage Examples

### Using Components from Packages

```tsx
// From @envisio/ui
import { ActionButton } from "@envisio/ui";

<ActionButton icon={<SaveIcon />} label="Save" onClick={handleSave} />;

// From @envisio/engine-cesium
import { useCesiumIonUpload } from "@envisio/engine-cesium";

const { ionUploading, uploadToS3 } = useCesiumIonUpload();
```

## Migration Notes

**Before:** 827-line monolithic file
**After:** Well-organized across 3 packages

- Deleted 948 lines of redundant code
- Added proper package boundaries
- Zero linter errors
- No breaking changes

## Dependencies

- `@envisio/core` - State management
- `@envisio/ui` - UI components
- `@envisio/engine-cesium` - Cesium logic
- `@mui/material` - Material-UI
- `@aws-sdk/client-s3` - S3 uploads
