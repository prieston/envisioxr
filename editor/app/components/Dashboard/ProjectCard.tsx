import React from "react";
import { CardContent, CardActions } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  GlassCard,
  CardTitle,
  CardDescription,
  ActionButton,
  MenuButton,
  CesiumChip,
  ThreeJsChip,
} from "./ProjectCard.styles";

const ProjectCard = ({
  project,
  onGoToBuilder,
  onMenuOpen,
  selected,
  onSelect: _onSelect,
}) => {
  const getEngineLabel = (engine) => {
    return engine === "cesium" ? "Cesium" : "Three.js";
  };

  const EngineIndicator =
    project.engine === "cesium" ? CesiumChip : ThreeJsChip;

  const handleCardClick = (e) => {
    // Don't trigger navigation if clicking on menu button
    if (e.target.closest(".menu-button")) return;
    onGoToBuilder(project.id);
  };

  return (
    <GlassCard
      className={`glass-card ${selected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      <EngineIndicator
        label={getEngineLabel(project.engine || "three")}
        size="small"
      />
      <CardContent className="glass-card-content" sx={{ pb: 2, pt: 4 }}>
        <CardTitle className="glass-card-title" variant="h6">
          {project.title}
        </CardTitle>
        <CardDescription className="glass-card-subtitle" variant="body2">
          {project.description || "No description provided"}
        </CardDescription>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <ActionButton
          className="action-button"
          size="small"
          onClick={() => onGoToBuilder(project.id)}
        >
          Open Project
          <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
        </ActionButton>
        <MenuButton
          className="menu-button"
          size="small"
          onClick={(e) => onMenuOpen(e, project.id)}
        >
          <MoreVertIcon />
        </MenuButton>
      </CardActions>
    </GlassCard>
  );
};

export default ProjectCard;
