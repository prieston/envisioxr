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

const ProjectCard = ({ project, onGoToBuilder, onMenuOpen }) => {
  return (
    <Card sx={{ width: 300, position: "relative" }}>
      <CardContent>
        <Typography variant="h6">{project.title}</Typography>
        <Typography variant="body2">
          {project.description || "No description provided"}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onGoToBuilder(project.id)}>
          Go To Builder
        </Button>
        <IconButton
          onClick={(e) => onMenuOpen(e, project.id)}
          sx={{ position: "absolute", top: 4, right: 4 }}
        >
          <MoreVertIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
