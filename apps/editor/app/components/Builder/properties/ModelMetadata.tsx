import React from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import useSWR from "swr";
import { modelFetcher } from "@/app/utils/api";

interface ModelMetadataProps {
  assetId?: string;
}

const ModelMetadata: React.FC<ModelMetadataProps> = ({ assetId }) => {
  const { data, error, isLoading } = useSWR(
    assetId ? `/api/models/${assetId}` : null,
    modelFetcher
  );

  if (!assetId) {
    return (
      <Box
        sx={{
          backgroundColor: "rgba(248, 250, 252, 0.4)",
          borderRadius: 4,
          border: "1px dashed rgba(226, 232, 240, 0.6)",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.7)",
            fontStyle: "italic",
          }}
        >
          No metadata available
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
        Failed to load metadata
      </Alert>
    );
  }

  // Check if there's any actual content to display
  const hasContent =
    data && (data.description || data.tags?.length > 0 || data.category);

  if (!data || !hasContent) {
    return (
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "rgba(100, 116, 139, 0.7)",
          fontStyle: "italic",
        }}
      >
        No metadata available
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "rgba(248, 250, 252, 0.4)",
        borderRadius: 4,
        border: "1px solid rgba(226, 232, 240, 0.6)",
        padding: "14px",
      }}
    >
      {data.description && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(51, 65, 85, 0.9)",
            lineHeight: 1.5,
            mb: data.tags || data.category ? 1.5 : 0,
          }}
        >
          {data.description}
        </Typography>
      )}

      {(data.tags || data.category) && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {data.category && (
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: "4px",
                backgroundColor: "rgba(95, 136, 199, 0.1)",
                border: "1px solid rgba(95, 136, 199, 0.2)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.688rem",
                  fontWeight: 500,
                  color: "var(--color-primary, #6B9CD8)",
                }}
              >
                {data.category}
              </Typography>
            </Box>
          )}

          {data.tags?.map((tag: string) => (
            <Box
              key={tag}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: "4px",
                backgroundColor: "rgba(100, 116, 139, 0.08)",
                border: "1px solid rgba(100, 116, 139, 0.15)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.688rem",
                  fontWeight: 400,
                  color: "rgba(51, 65, 85, 0.8)",
                }}
              >
                {tag}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ModelMetadata;
