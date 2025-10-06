import React from "react";
import {
  CardContent,
  CardActions,
  Chip,
  Button,
  IconButton,
  Card,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export interface ProjectCardProps {
  project: { id: string; title: string; description?: string; engine?: string };
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
      sx={{
        width: 300,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px) saturate(130%)",
        WebkitBackdropFilter: "blur(20px) saturate(130%)",
        border: "1px solid rgba(37, 99, 235, 0.3)",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
          background: "rgba(37, 99, 235, 0.1)",
        },
        "&.selected": {
          background: "rgba(37, 99, 235, 0.12)",
          borderColor: "#2563eb",
          boxShadow:
            "0 20px 25px -5px rgba(37, 99, 235, 0.15), 0 10px 10px -5px rgba(37, 99, 235, 0.06), 0 0 0 2px rgba(37, 99, 235, 0.2)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
          opacity: 0,
          transform: "scale(0.95)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
          zIndex: 1,
        },
        "&:hover::before": {
          opacity: 1,
          transform: "scale(1)",
        },
      }}
    >
      <Chip
        label={getEngineLabel(project.engine || "three")}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: "0.7rem",
          height: 20,
          "& .MuiChip-label": { p: "0 6px" },
          ...chipStyles,
        }}
      />
      <CardContent className="glass-card-content" sx={{ pb: 2, pt: 4 }}>
        <Typography
          className="glass-card-title"
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          {project.title}
        </Typography>
        <Typography
          className="glass-card-subtitle"
          variant="body2"
          sx={{
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description || "No description provided"}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          className="action-button"
          size="small"
          onClick={() => onGoToBuilder(project.id)}
          sx={{
            color: "#2563eb",
            textTransform: "none",
            position: "relative",
            overflow: "hidden",
            px: 0,
            pt: 2,
            pb: 0.5,
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 0,
              height: 1,
              background: "#2563eb",
              transition: "width 0.3s ease",
            },
            "&:hover::after": { width: "100%" },
          }}
        >
          Open Project
          <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </Button>
        <IconButton
          className="menu-button"
          size="small"
          onClick={(e) => onMenuOpen(e, project.id)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
