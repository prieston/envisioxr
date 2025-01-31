import React from "react";
import { Box } from "@mui/material";
import AdminAppBar from "./AppBar";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import BottomPanel from "./BottomPanel";

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* App Bar at the Top */}
      <AdminAppBar />

      {/* Main Content: Left Panel | SceneCanvas | Right Panel */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <LeftPanel />

        {/* SceneCanvas Wrapper */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex" }}>
            {children} {/* SceneCanvas goes here */}
          </Box>
        </Box>

        <RightPanel />
      </Box>

      {/* Bottom Panel (Fixed at Bottom) */}
      <Box sx={{ flexShrink: 0 }}>
        <BottomPanel />
      </Box>
    </Box>
  );
};

export default AdminLayout;
