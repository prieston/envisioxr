import React from "react";
import { Box, List, ListItem, ListItemText } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";

const LeftPanel = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);

  return (
    <Box
      sx={{
        width: "250px", // Fixed width like before
        height: "100%", // Full height
        backgroundColor: "background.paper", // Ensure it matches theme
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        padding: 2,
      }}
    >
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
