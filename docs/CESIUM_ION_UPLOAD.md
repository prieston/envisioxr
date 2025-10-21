# Cesium Ion Upload Integration

This document describes how to use the Cesium Ion upload feature in the EnvisioXR editor.

## Overview

The Cesium Ion upload feature allows users to upload 3D models, tilesets, and other geospatial data directly to their own Cesium Ion accounts from within the EnvisioXR editor. Users provide their own Cesium Ion access token when uploading, ensuring data is uploaded to their personal Ion account.

## Architecture

The upload process consists of three main steps:

1. **Asset Creation**: The backend creates a new asset on Cesium Ion using the user's token and receives upload credentials
2. **File Upload**: The frontend uploads the file directly to AWS S3 using the provided credentials
3. **Upload Completion**: The backend notifies Cesium Ion that the upload is complete

### Components

- **Frontend**: `editor/app/components/AppBar/BuilderActions.tsx` - `handleUploadToIon` function
- **Backend API**: `editor/app/api/ion-upload/route.ts` - Handles Cesium Ion API communication
- **UI Component**: `packages/ui/src/components/modals/tabs/UploadToIonTab.tsx` - User interface for upload

## Configuration

### Getting a Cesium Ion Access Token

Each user needs their own Cesium Ion access token to upload assets:

1. Go to [Cesium Ion](https://ion.cesium.com/)
2. Sign in or create an account (free tier available)
3. Navigate to **Access Tokens** in your account settings
4. Click **Create Token**
5. Give your token a name (e.g., "EnvisioXR Upload")
6. Ensure the following scopes are enabled:
   - `assets:write` - **Required** for creating and uploading assets
   - `assets:read` - Optional, for reading asset information
7. Copy the generated token to use when uploading

### Important Security Notes

- Each user uploads to their own Cesium Ion account using their own token
- Tokens are sent securely through the backend API and are never stored
- Never share your access token with others
- The token is only used during the upload process and is not persisted
- You can revoke tokens at any time from your Ion account settings

## Usage

### From the Editor

1. Open a project in the EnvisioXR editor
2. Click the **Asset Manager** button in the toolbar
3. Navigate to the **Upload to Ion** tab
4. Fill in the required fields:
   - **File**: Select a 3D model file (.glb, .gltf, or .zip)
   - **Name**: Give your asset a descriptive name
   - **Description**: (Optional) Add a description
   - **Cesium Ion Access Token**: Enter your personal Ion access token (see above for how to get one)
   - **Source Type**: Select the type of asset (3D Model, Point Cloud, etc.)
   - **Position**: (Optional) Set geographic coordinates
5. Click **Upload to Ion**
6. Wait for the upload to complete - progress will be displayed
7. Once complete, you'll receive an Asset ID that can be used to reference the uploaded asset in your Ion account

### Supported File Types and Asset Types

When uploading, you select an **Output Asset Type** which determines how Cesium Ion processes your file:

- **3D Tiles**: Converts 3D models to optimized streaming tilesets
  - Best for: Large models, photogrammetry, BIM data
  - Input formats: `.glb`, `.gltf`, `.fbx`, `.obj`, `.dae`, `.zip`

- **glTF**: Keeps models in glTF format
  - Best for: Small to medium models, maintaining original format
  - Input formats: `.glb`, `.gltf`

- **Imagery**: Raster imagery layers
  - Input formats: `.zip` (containing GeoTIFF or image tiles)

- **Terrain**: Quantized mesh terrain
  - Input formats: `.zip` (containing terrain data)

- **GeoJSON**: Vector geographic data
  - Input formats: `.geojson`, `.json`

- **KML/KMZ**: Google Earth format
  - Input formats: `.kml`, `.kmz`

### Programmatic Usage

You can also trigger uploads programmatically:

```typescript
const result = await handleUploadToIon({
  file: myFile,
  name: "My Asset",
  description: "Description of my asset",
  sourceType: "3D_MODEL",
  accessToken: "your_cesium_ion_token_here",
  longitude: -122.4194,
  latitude: 37.7749,
  height: 0,
});

console.log(`Asset uploaded with ID: ${result.assetId}`);
```

## API Reference

### POST /api/ion-upload

Creates a new asset on Cesium Ion using the user's access token and returns upload credentials.

**Request Body:**

```json
{
  "name": "Asset Name",
  "description": "Asset Description",
  "type": "3D_MODEL",
  "accessToken": "your_cesium_ion_access_token",
  "options": {
    "sourceType": "3D_MODEL",
    "position": {
      "longitude": -122.4194,
      "latitude": 37.7749,
      "height": 0
    }
  }
}
```

**Response:**

```json
{
  "assetId": 123456,
  "uploadLocation": "https://s3.amazonaws.com/cesium-ion-assets/uploads/...",
  "onComplete": {
    "method": "POST",
    "url": "https://api.cesium.com/v1/assets/123456/uploadComplete",
    "fields": {}
  }
}
```

### PUT /api/ion-upload

Notifies Cesium Ion that the upload is complete.

**Request Body:**

```json
{
  "onComplete": {
    "method": "POST",
    "url": "https://...",
    "fields": {}
  }
}
```

**Response:**

```json
{
  "success": true
}
```

## Asset Processing

After uploading, Cesium Ion will process your asset:

1. The asset status will be `AWAITING_FILES` initially
2. Once processing starts, it changes to `IN_PROGRESS`
3. When complete, the status becomes `COMPLETE`
4. You can check the status at: `https://ion.cesium.com/assets/{assetId}`

Processing time varies based on:

- Asset size
- Asset complexity
- Current Ion server load

## Troubleshooting

### "Missing Cesium Ion access token"

**Problem**: No access token was provided in the upload form.

**Solution**: Enter your Cesium Ion access token in the "Cesium Ion Access Token" field before uploading.

### "Failed to create asset on Cesium Ion: 401"

**Problem**: The access token is invalid, expired, or doesn't have the required permissions.

**Solution**:

1. Verify the token you entered is correct (check for copy-paste errors)
2. Check that the token hasn't been revoked at https://ion.cesium.com/tokens
3. Ensure the token has the required `assets:write` scope
4. Try creating a new token with the correct permissions

### "S3 upload failed"

**Problem**: The file upload to AWS S3 failed.

**Solution**:

1. Check your internet connection
2. Verify the file is not corrupted
3. Ensure the file size doesn't exceed Ion's limits
4. Try uploading a smaller file to test

### "Failed to complete upload"

**Problem**: Cesium Ion couldn't be notified that the upload finished.

**Solution**:

1. Check the Ion service status at https://status.cesium.com/
2. The asset may still process successfully - check your Ion dashboard
3. Contact Cesium support if the issue persists

## Limitations

- **File Size**: Cesium Ion has file size limits based on your subscription tier
- **Rate Limiting**: The Ion API has rate limits; avoid uploading too many assets simultaneously
- **Network**: Large uploads require stable internet connectivity

## Next Steps

After uploading an asset to Cesium Ion:

1. Wait for processing to complete
2. Use the Asset ID to add the asset to your scene
3. Configure visualization settings (optional)
4. The asset will be available in your Cesium Ion account for use in other projects

## References

- [Cesium Ion REST API Documentation](https://cesium.com/learn/ion/rest-api/)
- [Cesium Ion Dashboard](https://ion.cesium.com/)
- [Cesium Ion Supported Data Types](https://cesium.com/learn/ion/uploading-data/)
