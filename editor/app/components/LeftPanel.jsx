// app/components/LeftPanel.jsx
"use client";

import React from "react";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";

const LeftPanel = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: "background.paper",
        padding: 2,
        borderRight: "1px solid rgba(255,255,255,0.1)", // Subtle border
      }}
    >
      <Typography variant="h6" sx={{ color: "text.primary", mb: 2 }}>
        Scene Objects
      </Typography>
      <List>
        {objects.map((obj, index) => (
          <ListItem button key={index} onClick={() => selectObject(obj.id)}>
            <ListItemText primary={obj.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LeftPanel;
