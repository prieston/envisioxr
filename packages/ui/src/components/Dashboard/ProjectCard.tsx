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
import { alpha } from "@mui/material/styles";
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
      sx={(theme) => {
        const base = theme.palette.primary.main;
        const hoverTone = alpha(base, 0.14);
        const borderTone = alpha(base, theme.palette.mode === "dark" ? 0.35 : 0.4);
        const shadowTone = alpha(base, 0.18);

        return {
        width: 300,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        background:
          theme.palette.mode === "dark"
            ? "rgba(22, 24, 26, 0.85)"
            : "#14171A",
        backdropFilter: "blur(20px) saturate(130%)",
        WebkitBackdropFilter: "blur(20px) saturate(130%)",
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255, 255, 255, 0.08)"
            : `1px solid ${alpha(base, 0.35)}`,
        borderRadius: "4px",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 1px 3px rgba(0, 0, 0, 0.35)"
            : `0 8px 32px ${alpha(base, 0.18)}`,
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          background:
            theme.palette.mode === "dark"
              ? "rgba(28, 31, 34, 0.9)"
              : hoverTone,
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.18)"
              : borderTone,
          // Trigger button underline animation on card hover
          "& .action-button::after": {
            maxWidth: "100%",
          },
        },
        "&.selected": {
          background:
            theme.palette.mode === "dark"
              ? alpha(base, 0.18)
              : alpha(base, 0.16),
          borderColor: base,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 1px 3px rgba(0, 0, 0, 0.5), 0 0 0 1px ${alpha(base, 0.35)}`
              : `0 20px 25px -5px ${shadowTone}, 0 10px 10px -5px ${alpha(base, 0.09)}, 0 0 0 2px ${alpha(base, 0.28)}`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
          opacity: 0,
          transition: "opacity 0.15s ease",
          pointerEvents: "none",
          zIndex: 1,
        },
        "&:hover::before": {
          opacity: 1,
        },
        };
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
          sx={(theme) => ({
            color: theme.palette.primary.main,
            textTransform: "none",
            position: "relative",
            overflow: "visible",
            px: 0,
            pt: 2,
            pb: 0.5,
            "&:hover": {
              backgroundColor: "transparent",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: 0,
              height: "1px",
              background: theme.palette.primary.main,
              transition: "max-width 0.3s ease",
              borderRadius: 0,
            },
            "&:hover::after": { maxWidth: "100%" },
          })}
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
