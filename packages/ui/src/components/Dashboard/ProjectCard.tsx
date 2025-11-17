import React from "react";
import {
  CardContent,
  Chip,
  IconButton,
  Card,
  Typography,
  Box,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    engine?: string;
    thumbnail?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
  onGoToBuilder: (id: string) => void;
  onMenuOpen: (e: React.MouseEvent, id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export default function ProjectCard({
  project,
  onGoToBuilder,
  onMenuOpen,
  selected,
  onSelect: _onSelect,
}: ProjectCardProps) {
  const getEngineLabel = (engine?: string) =>
    engine === "cesium" ? "Cesium" : "Three.js";

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".menu-button")) return;
    onGoToBuilder(project.id);
  };

  const chipStyles =
    project.engine === "cesium"
      ? {
          backgroundColor: "rgba(99, 102, 241, 0.15)",
          color: "#6366f1",
          border: "1px solid rgba(99, 102, 241, 0.4)",
        }
      : {
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          color: "#f59e0b",
          border: "1px solid rgba(245, 158, 11, 0.4)",
        };

  return (
    <Card
      className={`glass-card ${selected ? "selected" : ""}`}
      onClick={handleCardClick}
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
        {/* Badge overlay */}
        <Chip
          label={getEngineLabel(project.engine || "three")}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            fontSize: "0.7rem",
            height: 22,
            fontWeight: 500,
            "& .MuiChip-label": { p: "0 8px" },
            zIndex: 2,
            ...chipStyles,
          }}
        />
        {/* Menu button */}
        <IconButton
          className="menu-button"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, project.id);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "rgba(255, 255, 255, 0.6)",
            zIndex: 2,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        {/* Thumbnail image or placeholder */}
        {project.thumbnail ? (
          <Box
            component="img"
            src={project.thumbnail}
            alt={project.title}
            loading="lazy"
            onError={() => {
              console.error(
                `Failed to load thumbnail for ${project.title}:`,
                project.thumbnail
              );
            }}
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
          <FolderIcon
            sx={{ fontSize: 48, color: "#6B9CD8", opacity: 0.5, zIndex: 0 }}
          />
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
            fontSize: "16px",
            mb: 0.5,
            color: "text.primary",
            lineHeight: 1.3,
          }}
        >
          {project.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.875rem",
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description || "No description provided"}
        </Typography>
        {/* Owner and Last Modified */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: "auto",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PersonIcon
              sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.4)" }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Theo
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            {project.updatedAt
              ? new Date(project.updatedAt).toLocaleDateString() ===
                new Date().toLocaleDateString()
                ? "Today"
                : new Date(project.updatedAt).toLocaleDateString() ===
                    new Date(Date.now() - 86400000).toLocaleDateString()
                  ? "Yesterday"
                  : `${Math.floor(
                      (Date.now() - new Date(project.updatedAt).getTime()) /
                        (1000 * 60 * 60)
                    )} hours ago`
              : project.createdAt
                ? new Date(project.createdAt).toLocaleDateString() ===
                  new Date().toLocaleDateString()
                  ? "Today"
                  : `${Math.floor(
                      (Date.now() - new Date(project.createdAt).getTime()) /
                        (1000 * 60 * 60)
                    )} hours ago`
                : ""}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
