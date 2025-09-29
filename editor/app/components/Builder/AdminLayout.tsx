"use client";

import React from "react";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
  LayoutContainer,
  MainContent,
  CenterContainer,
  SceneContainer,
  BottomContainer,
  CanvasContainer,
} from "./AdminLayout.styles";
import AdminAppBar from "@/app/components/AppBar/AdminAppBarNew";
import LeftPanel from "./LeftPanelNew";
import RightPanel from "./RightPanelNew";
import BottomPanel from "./BottomPanelNew";

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
