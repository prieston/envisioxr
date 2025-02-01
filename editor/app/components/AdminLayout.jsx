"use client";

import React from "react";
import { Box } from "@mui/material";
import AdminAppBar from "./AppBar";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import BottomPanel from "./BottomPanel";

const AdminLayout = ({ children, onSave }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* App Bar with the onSave prop */}
      <AdminAppBar mode="builder" onSave={onSave} />

      {/* Main Content: Left Panel | Builder (Scene) | Right Panel */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <LeftPanel />
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex" }}>
            {children}
          </Box>
        </Box>
        <RightPanel />
      </Box>

      {/* Bottom Panel */}
      <Box sx={{ flexShrink: 0 }}>
        <BottomPanel />
      </Box>
    </Box>
  );
};

export default AdminLayout;
