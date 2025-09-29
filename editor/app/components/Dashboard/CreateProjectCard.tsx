import React from "react";
import { Typography } from "@mui/material";
import {
  GlassCard,
  StyledCardContent,
  AddIconWrapper,
} from "./CreateProjectCard.styles";
import AddIcon from "@mui/icons-material/Add";

const CreateProjectCard = ({ onClick, selected, onSelect: _onSelect }) => {
  const handleCardClick = (_e) => {
    _onSelect?.();
    onClick?.();
  };

  return (
    <GlassCard
      className={`glass-card ${selected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      <StyledCardContent className="glass-card-content">
        <AddIconWrapper>
          <AddIcon sx={{ fontSize: 32 }} />
        </AddIconWrapper>
        <Typography
          className="glass-card-title"
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          Create Project
        </Typography>
        <Typography
          className="glass-card-subtitle"
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          Start building your new XR experience
        </Typography>
      </StyledCardContent>
    </GlassCard>
  );
};

export default CreateProjectCard;
