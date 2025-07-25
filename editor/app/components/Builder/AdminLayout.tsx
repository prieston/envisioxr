"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AdminAppBar from "@/app/components/AppBar/AdminAppBar";
import LeftPanel from "./LeftPanelNew";
import RightPanel from "./RightPanelNew";
import BottomPanel from "./BottomPanelNew";

const LayoutContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
}));

const MainContent = styled(Box)(() => ({
  display: "flex",
  flexGrow: 1,
  overflow: "hidden",
  marginTop: "64px",
}));

const CenterContainer = styled(Box)(() => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
  zIndex: 1,
}));

const SceneContainer = styled(Box)(() => ({
  flexGrow: 1,
  display: "flex",
  overflow: "hidden",
}));

const BottomContainer = styled(Box)(() => ({
  flexShrink: 0,
  position: "relative",
  zIndex: 1,
}));

const AdminLayout = ({ children, onSave, onPublish }) => {
  return (
    <LayoutContainer>
      {/* App Bar with the onSave and onPublish props */}
      <AdminAppBar mode="builder" onSave={onSave} onPublish={onPublish} />

      {/* Main Content: Left Panel | Builder (Scene) | Right Panel */}
      <MainContent>
        <LeftPanel />
        <CenterContainer>
          <SceneContainer>{children}</SceneContainer>
        </CenterContainer>
        <RightPanel />
      </MainContent>

      {/* Bottom Panel */}
      <BottomContainer>
        <BottomPanel />
      </BottomContainer>
    </LayoutContainer>
  );
};

export default AdminLayout;
