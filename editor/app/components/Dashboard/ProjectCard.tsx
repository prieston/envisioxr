import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";

const GlassCard = styled(Card)(() => ({
  width: 300,
  position: "relative",
  background: "#1e1e1e",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: "rgba(255, 255, 255, 0.1)",
  "&:hover": {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: theme.palette.text.primary,
  },
}));

const ProjectCard = ({ project, onGoToBuilder, onMenuOpen }) => {
  return (
    <GlassCard>
      <CardContent sx={{ pb: 2 }}>
        <CardTitle variant="h6">{project.title}</CardTitle>
        <CardDescription variant="body2">
          {project.description || "No description provided"}
        </CardDescription>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <ActionButton
          size="small"
          variant="outlined"
          onClick={() => onGoToBuilder(project.id)}
        >
          Open Project
        </ActionButton>
        <MenuButton size="small" onClick={(e) => onMenuOpen(e, project.id)}>
          <MoreVertIcon />
        </MenuButton>
      </CardActions>
    </GlassCard>
  );
};

export default ProjectCard;
