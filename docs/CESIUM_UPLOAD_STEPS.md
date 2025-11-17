# Cesium Ion Upload Steps for Big Models

## Current Upload Process

The upload process for big models to Cesium Ion follows these steps:

### Step 1: Asset Creation (10% progress)

**Location**: `apps/editor/app/api/ion-upload/route.ts` (POST)

- User provides Cesium Ion access token
- Backend creates asset on Cesium Ion API (`https://api.cesium.com/v1/assets`)
- Cesium Ion returns:
  - `assetId` / `assetMetadata.id`
  - `uploadLocation` (S3 credentials: endpoint, bucket, prefix, accessKey, secretAccessKey, sessionToken)
  - `onComplete` (URL and method to notify completion)

**Code**: `useCesiumIon.ts` lines 125-177

### Step 2: File Upload to S3 (20-90% progress)

**Location**: `packages/engine-cesium/src/hooks/useCesiumIonUpload.ts` (`uploadToS3` function)

**Current Implementation**:

```typescript
const fileBuffer = await file.arrayBuffer(); // ⚠️ Loads entire file into memory
const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

await s3Client.send(
  new PutObjectCommand({
    Bucket: uploadLocation.bucket,
    Key: s3Key,
    Body: new Uint8Array(fileBuffer), // ⚠️ Single upload, no chunking
    ContentType: file.type || "application/octet-stream",
  })
);
```

**Issues for Large Files**:

- ❌ Entire file loaded into memory (`arrayBuffer()`)
- ❌ Single `PutObjectCommand` upload (not multipart)
- ❌ No progress tracking during S3 upload
- ❌ AWS S3 recommends multipart upload for files > 5MB
- ❌ Risk of timeout or memory issues for very large files

**Code**: `useCesiumIonUpload.ts` lines 137-169

### Step 3: Upload Completion Notification (90-100% progress)

**Location**: `apps/editor/app/api/ion-upload/route.ts` (PUT)

- Backend notifies Cesium Ion that upload is complete
- Triggers asset processing/tiling on Cesium Ion

**Code**: `useCesiumIon.ts` line 204

### Step 4: Status Polling

**Location**: `packages/engine-cesium/src/hooks/useCesiumIonUpload.ts` (`pollAssetStatus`)

- Polls Cesium Ion API every 3 seconds
- Maximum 40 attempts (2 minutes total)
- Waits for status to become `COMPLETE`
- Tracks tiling progress (`percentComplete`)

**Code**: `useCesiumIonUpload.ts` lines 46-98

### Step 5: Save to Library

**Location**: `apps/editor/app/components/AppBar/BuilderActions/hooks/useCesiumIon.ts` (`saveCesiumIonAssetToLibrary`)

- Saves asset metadata to database
- Includes asset ID, API key, name, description, and metadata
- Refreshes library view

**Code**: `useCesiumIon.ts` lines 71-102, 214-225

## Progress Tracking

Current progress breakdown:

- **0-10%**: Initializing
- **10-20%**: Creating asset on Cesium Ion
- **20-90%**: Uploading file to S3 (currently jumps to 90% immediately)
- **90-100%**: Completing upload notification
- **After 100%**: Polling for tiling status (background)

## Potential Issues with Large Files

1. **Memory Consumption**: Entire file loaded into memory
2. **No Multipart Upload**: Single PUT request may timeout for very large files
3. **No Upload Progress**: Progress callback not used during S3 upload
4. **Browser Limits**: Large files may hit browser memory limits
5. **Network Timeout**: Single large request more prone to timeout

## Recommended Improvements

### 1. Implement Multipart Upload for Large Files

For files > 5MB, use AWS S3 multipart upload:

```typescript
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";

const uploadToS3Multipart = async (
  file: File,
  uploadLocation: any,
  onProgress?: (percent: number) => void
) => {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const {
    S3Client,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
  } = await import("@aws-sdk/client-s3");

  const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: uploadLocation.endpoint,
    credentials: {
      accessKeyId: uploadLocation.accessKey,
      secretAccessKey: uploadLocation.secretAccessKey,
      sessionToken: uploadLocation.sessionToken,
    },
  });

  const s3Key = `${uploadLocation.prefix}${file.name}`;

  // Initiate multipart upload
  const createResponse = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: uploadLocation.bucket,
      Key: s3Key,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const uploadId = createResponse.UploadId!;
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const parts: Array<{ ETag: string; PartNumber: number }> = [];

  // Upload parts
  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const uploadResponse = await s3Client.send(
      new UploadPartCommand({
        Bucket: uploadLocation.bucket,
        Key: s3Key,
        PartNumber: partNumber,
        UploadId: uploadId,
        Body: await chunk.arrayBuffer(),
      })
    );

    parts.push({
      ETag: uploadResponse.ETag!,
      PartNumber: partNumber,
    });

    // Update progress
    if (onProgress) {
      const progress = Math.round((partNumber / totalParts) * 70) + 20; // 20-90%
      onProgress(progress);
    }
  }

  // Complete multipart upload
  await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: uploadLocation.bucket,
      Key: s3Key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );

  if (onProgress) {
    onProgress(90);
  }
};
```

### 2. Add File Size Check

```typescript
const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5MB

if (file.size > MULTIPART_THRESHOLD) {
  await uploadToS3Multipart(file, uploadLocation, onProgress);
} else {
  await uploadToS3(file, uploadLocation, onProgress);
}
```

### 3. Better Error Handling

- Handle partial upload failures
- Implement retry logic for failed parts
- Clean up incomplete multipart uploads on error

## File Size Limits

- **Cesium Ion**: Depends on subscription tier (free tier has limits)
- **Browser**: Varies by browser (typically 2-4GB max)
- **AWS S3**:
  - Single PUT: 5GB max
  - Multipart: 5TB max (recommended for > 5MB)

## Related Files

- `apps/editor/app/components/AppBar/BuilderActions/hooks/useCesiumIon.ts` - Main upload handler
- `apps/editor/app/api/ion-upload/route.ts` - Backend API routes
- `packages/engine-cesium/src/hooks/useCesiumIonUpload.ts` - Core upload logic
- `apps/editor/app/(protected)/library/geospatial/components/UploadToIonDrawer.tsx` - UI component
