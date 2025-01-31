import React from "react";
import { Box, Typography } from "@mui/material";
import useSceneStore from "../hooks/useSceneStore";

const BottomPanel = () => {
  const observationPoints = useSceneStore((state) => state.observationPoints);

  return (
    <Box
      sx={{
        width: "100%",
        height: "150px", // Fixed height
        backgroundColor: "background.paper",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: 2,
      }}
    >
      {observationPoints.length > 0 ? (
        <Typography variant="body1">Observation Points Panel</Typography>
      ) : (
        <Typography variant="body2">No observation points added.</Typography>
      )}
    </Box>
  );
};

export default BottomPanel;
