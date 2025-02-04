import React from "react";
import { Box, Typography, Button } from "@mui/material";

const InfoBox = ({ onDismiss }) => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 1,
        marginBottom: 3,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Typography variant="h6">Welcome to EnvisioXR Dashboard!</Typography>
      <Typography variant="body1">
        Learn how to build immersive scenes with our video tutorials and guided
        walkthroughs.
      </Typography>
      <br />
      <Button variant="outlined" onClick={onDismiss}>
        Dismiss
      </Button>
    </Box>
  );
};

export default InfoBox;
