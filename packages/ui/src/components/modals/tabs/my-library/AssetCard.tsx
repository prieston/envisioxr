import React from "react";
import { Card, CardContent, CardMedia, Typography, Chip, Box } from "@mui/material";
import { Public, ViewInAr } from "@mui/icons-material";
import type { LibraryAsset } from "../MyLibraryTab";

interface AssetCardProps {
  asset: LibraryAsset;
  isSelected: boolean;
  onClick: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={(theme) => ({
        cursor: "pointer",
        borderRadius: "4px",
        boxShadow: "none",
        border: isSelected
          ? `2px solid ${theme.palette.primary.main}`
          : "2px solid rgba(255, 255, 255, 0.08)",
        transition: "all 0.2s ease",
        backgroundColor: theme.palette.background.paper,
        "&:hover": {
          borderColor: isSelected
            ? theme.palette.primary.main
            : "rgba(107, 156, 216, 0.5)",
        },
      })}
    >
      {asset.thumbnailUrl || asset.thumbnail ? (
        <CardMedia
          component="img"
          height="80"
          image={asset.thumbnailUrl || asset.thumbnail}
          alt={asset.name || asset.originalFilename}
          sx={{
            objectFit: "cover",
            backgroundColor: "rgba(248, 250, 252, 0.8)",
          }}
        />
      ) : (
        <Box
          sx={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(248, 250, 252, 0.8)",
          }}
        >
          {asset.assetType === "cesiumIonAsset" ? (
            <Public
              sx={{
                fontSize: "2.5rem",
                color: "var(--color-primary, #6B9CD8)",
              }}
            />
          ) : (
            <ViewInAr
              sx={{
                fontSize: "2.5rem",
                color: "rgba(100, 116, 139, 0.4)",
              }}
            />
          )}
        </Box>
      )}
      <CardContent sx={{ padding: "8px !important" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            minHeight: "42px",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            noWrap
            sx={{
              fontSize: "0.75rem",
              color: "rgba(51, 65, 85, 0.95)",
            }}
          >
            {asset.name || asset.originalFilename}
          </Typography>
          {asset.assetType === "cesiumIonAsset" && (
            <Chip
              icon={<Public />}
              label="Cesium Ion"
              size="small"
              sx={{
                height: "18px",
                fontSize: "0.625rem",
                fontWeight: 500,
                color: "var(--color-primary, #6B9CD8)",
                backgroundColor: "rgba(107, 156, 216, 0.12)",
                "& .MuiChip-icon": {
                  fontSize: "0.75rem",
                  color: "var(--color-primary, #6B9CD8)",
                },
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

