"use client";

import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AdminAppBar from "@/app/components/AppBar/AdminAppBarNew";
import LeftPanel from "./LeftPanelNew";
import RightPanel from "./RightPanelNew";
import BottomPanel from "./BottomPanelNew";

// Styled components for animated background
const AnimatedBackground = styled(Box)(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: -1,
  overflow: "hidden",
  background: "transparent",
}));

const GlowingContainer = styled(Box)(() => ({
  position: "relative",
  transformOrigin: "right",
  animation: "colorChange 5s linear infinite",
  "&:nth-of-type(even)": {
    transformOrigin: "left",
  },
  "@keyframes colorChange": {
    "0%": {
      filter: "hue-rotate(0deg)",
      transform: "rotate(0deg)",
    },
    "100%": {
      filter: "hue-rotate(360deg)",
      transform: "rotate(360deg)",
    },
  },
}));

const GlowingSpan = styled(Box)<{ index: number }>(({ index }) => ({
  position: "absolute",
  top: `calc(80px * ${index})`,
  left: `calc(80px * ${index})`,
  bottom: `calc(80px * ${index})`,
  right: `calc(80px * ${index})`,
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "-8px",
    width: "15px",
    height: "15px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "50%",
    boxShadow:
      "0 0 20px rgba(255, 255, 255, 0.05), " +
      "0 0 40px rgba(255, 255, 255, 0.03), " +
      "0 0 60px rgba(255, 255, 255, 0.02), " +
      "0 0 80px rgba(255, 255, 255, 0.01), " +
      "0 0 0 8px rgba(255, 255, 255, 0.01)",
  },
  "&:nth-of-type(3n + 1)": {
    animation: "animate 10s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.08)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.04), " +
        "0 0 40px rgba(255, 255, 255, 0.03), " +
        "0 0 60px rgba(255, 255, 255, 0.02), " +
        "0 0 80px rgba(255, 255, 255, 0.01), " +
        "0 0 0 8px rgba(255, 255, 255, 0.01)",
    },
  },
  "&:nth-of-type(3n + 2)": {
    animation: "animate-reverse 3s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.06)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.03), " +
        "0 0 40px rgba(255, 255, 255, 0.02), " +
        "0 0 60px rgba(255, 255, 255, 0.01), " +
        "0 0 80px rgba(255, 255, 255, 0.005), " +
        "0 0 0 8px rgba(255, 255, 255, 0.005)",
    },
  },
  "&:nth-of-type(3n + 3)": {
    animation: "animate 8s alternate infinite",
    "&::before": {
      background: "rgba(255, 255, 255, 0.05)",
      boxShadow:
        "0 0 20px rgba(255, 255, 255, 0.02), " +
        "0 0 40px rgba(255, 255, 255, 0.015), " +
        "0 0 60px rgba(255, 255, 255, 0.01), " +
        "0 0 80px rgba(255, 255, 255, 0.005), " +
        "0 0 0 8px rgba(255, 255, 255, 0.005)",
    },
  },
  "@keyframes animate": {
    "0%": {
      transform: "rotate(180deg)",
    },
    "50%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
  "@keyframes animate-reverse": {
    "0%": {
      transform: "rotate(360deg)",
    },
    "50%": {
      transform: "rotate(180deg)",
    },
    "100%": {
      transform: "rotate(0deg)",
    },
  },
}));

const LayoutContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
  padding: "16px",
  paddingTop: "96px", // Account for fixed header height + margin
  gap: "16px",
  zIndex: 1200,
  pointerEvents: "none", // Allow canvas interactions to pass through
}));

const MainContent = styled(Box)(() => ({
  display: "flex",
  flexGrow: 1,
  overflow: "hidden",
  gap: "16px",
  position: "relative",
  pointerEvents: "none", // Allow canvas interactions to pass through
}));

const CenterContainer = styled(Box)(() => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
  zIndex: 1,
  pointerEvents: "none",
}));

const SceneContainer = styled(Box)(() => ({
  flexGrow: 1,
  display: "flex",
  overflow: "hidden",
  position: "relative",
  pointerEvents: "none",
}));

const BottomContainer = styled(Box)(() => ({
  flexShrink: 0,
  position: "relative",
  zIndex: 10,
  pointerEvents: "none", // Allow canvas interactions to pass through
}));

const CanvasContainer = styled(Box)(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 1,
  pointerEvents: "auto", // Allow panning and interaction with Cesium canvas
}));

const AdminLayout = ({ children, onSave, onPublish }) => {
  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      {/* Full viewport canvas background */}
      <CanvasContainer>{children}</CanvasContainer>

      {/* Glass panels overlay */}
      <LayoutContainer className="glass-layout">
        {/* App Bar with the onSave and onPublish props */}
        <AdminAppBar mode="builder" onSave={onSave} onPublish={onPublish} />

        {/* Main Content: Left Panel | Builder (Scene) | Right Panel */}
        <MainContent>
          <LeftPanel />
          <CenterContainer>
            <SceneContainer>
              {/* This will be empty since canvas is now full viewport */}
            </SceneContainer>
          </CenterContainer>
          <RightPanel />
        </MainContent>

        {/* Bottom Panel */}
        <BottomContainer>
          <BottomPanel />
        </BottomContainer>
      </LayoutContainer>
    </>
  );
};

export default AdminLayout;
