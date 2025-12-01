import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
      className={`glass-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      sx={(theme) => {
        return {
          width: "100%",
          height: 260,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: "#161B20",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "4px",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: alpha(theme.palette.primary.main, 0.5),
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          "&.selected": {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        };
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          width: "100%",
          height: "140px",
          backgroundColor: "rgba(107, 156, 216, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {asset.thumbnailUrl || asset.thumbnail ? (
          <Box
            component="img"
            src={asset.thumbnailUrl || asset.thumbnail}
            alt={asset.name || asset.originalFilename}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          />
        ) : (
          <>
            {asset.assetType === "cesiumIonAsset" ? (
              <Public
                sx={{ fontSize: 48, color: "#6B9CD8", opacity: 0.5, zIndex: 0 }}
              />
            ) : (
              <ViewInAr
                sx={{ fontSize: 48, color: "#6B9CD8", opacity: 0.5, zIndex: 0 }}
              />
            )}
          </>
        )}
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          pb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            mb: 0.5,
            color: "text.primary",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-all",
          }}
        >
          {asset.name || asset.originalFilename}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.75rem",
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {asset.description || (asset.assetType === "cesiumIonAsset" ? "Cesium Ion Asset" : "3D Model")}
        </Typography>
      </CardContent>
    </Card>
  );
};

