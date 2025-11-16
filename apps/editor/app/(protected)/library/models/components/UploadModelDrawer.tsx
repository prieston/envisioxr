"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { UploadModelTab } from "@envisio/ui";
import { showToast, dataURLtoBlob } from "@envisio/ui";

interface UploadModelDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModelDrawer: React.FC<UploadModelDrawerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (data: {
    file: File;
    friendlyName: string;
    description?: string;
    metadata: Array<{ label: string; value: string }>;
    screenshot: string | null;
  }) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL for model file
      const { signedUrl, key, acl } = await getModelUploadUrl({
        fileName: data.file.name,
        fileType: data.file.type,
      });

      // Step 2: Upload model file directly to S3 using presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", data.file.type);
        if (acl) {
          xhr.setRequestHeader("x-amz-acl", acl);
        }
        xhr.send(data.file);
      });

      // Upload thumbnail if available (using presigned URL)
      let thumbnailUrl = null;
      if (data.screenshot) {
        const thumbnailBlob = dataURLtoBlob(data.screenshot);
        const thumbnailFileName = `${data.friendlyName}-thumbnail.png`;

        // Get presigned URL for thumbnail
        const {
          signedUrl: thumbSignedUrl,
          acl: thumbAcl,
        } = await getThumbnailUploadUrl({
          fileName: thumbnailFileName,
          fileType: "image/png",
        });

        // Upload thumbnail directly to S3
        await uploadToSignedUrl(thumbSignedUrl, thumbnailBlob, {
          contentType: "image/png",
          acl: thumbAcl,
        });

        // Extract thumbnail URL from signed URL (remove query parameters)
        thumbnailUrl = thumbSignedUrl.split("?")[0];
      }

      // Step 3: Save model metadata to database
      await createModelAsset({
        key: key,
        originalFilename: data.file.name,
        name: data.friendlyName,
        fileType: data.file.type,
        thumbnail: thumbnailUrl,
        metadata: data.metadata, // Send as array - API will convert to object
        description: data.description,
      });

      showToast("Model uploaded successfully!", "success");
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error instanceof Error ? error.message : "An error occurred during upload.",
        "error"
      );
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500,
        "& .MuiBackdrop-root": {
          zIndex: 1499,
        },
      }}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
      }}
      PaperProps={{
        sx: (theme) => ({
          width: { xs: "100%", sm: "600px" },
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A !important"
              : theme.palette.background.paper,
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 1500,
          "&.MuiPaper-root": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        }),
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A"
              : theme.palette.background.paper,
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Upload Model
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={uploading}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
          }}
        >
          <UploadModelTab
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

