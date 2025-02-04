"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AdminAppBar from "../AppBar";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import BottomPanel from "./BottomPanel";

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  overflow: "hidden",
}));

const CenterContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const SceneContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  overflow: "hidden",
}));

const BottomContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
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
