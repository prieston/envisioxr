"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useSceneStore from "../../hooks/useSceneStore";

// Container for the left panel with conditional styling based on previewMode
interface LeftPanelContainerProps {
  previewMode: boolean;
}

const LeftPanelContainer = styled(Box)<LeftPanelContainerProps>(
  ({ theme, previewMode }) => ({
    width: "250px",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    userSelect: "none",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    cursor: previewMode ? "not-allowed" : "default",
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.3s ease, filter 0.3s ease",
  })
);

// Styled ListItem for objects, using a prop (selectedItem) to determine styles
interface ObjectListItemProps {
  selectedItem: boolean;
}

const ObjectListItem = styled(ListItem)<ObjectListItemProps>(
  ({ theme, selectedItem }) => ({
    cursor: "pointer",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    backgroundColor: selectedItem ? theme.palette.primary.main : "transparent",
    color: selectedItem ? "white" : "inherit",
    "&:hover": {
      backgroundColor: selectedItem
        ? theme.palette.primary.dark
        : "rgba(255, 255, 255, 0.1)",
    },
  })
);

const LeftPanel = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);
  const previewMode = useSceneStore((state) => state.previewMode);

  return (
    <LeftPanelContainer previewMode={previewMode}>
      <List>
        {objects.map((obj, index) => (
          <ObjectListItem
            key={index}
            selectedItem={selectedObject?.id === obj.id}
            onClick={() =>
              selectObject(selectedObject?.id === obj.id ? null : obj.id)
            }
          >
            <ListItemText primary={obj.name} />
          </ObjectListItem>
        ))}
      </List>
    </LeftPanelContainer>
  );
};

export default LeftPanel;
