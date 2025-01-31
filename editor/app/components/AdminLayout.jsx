// app/components/AdminLayout.jsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import AdminAppBar from "./AppBar";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import SceneCanvas from "./SceneCanvas";
import BottomPanel from "./BottomPanel";

const AdminLayout = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* App Bar at the top */}
      <AdminAppBar />

      {/* Main Layout - Left Panel | Scene | Right Panel */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Left Panel (Always Visible) */}
        <LeftPanel />

        {/* Scene Canvas (Takes Remaining Space) */}
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <SceneCanvas />
        </Box>

        {/* Right Panel (Always Visible) */}
        <RightPanel />
      </Box>

      {/* Bottom Panel (For Observation Points) */}
      <BottomPanel />
    </Box>
  );
};

export default AdminLayout;
