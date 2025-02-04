import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const CreateProjectCard = ({ onClick }) => {
  return (
    <Card
      sx={{
        width: 300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        border: "2px dashed #aaa",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="h4" align="center">
          +
        </Typography>
        <Typography variant="subtitle1" align="center">
          Create Project
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CreateProjectCard;
