"use client";

import React, { useState } from "react";
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
import { BottomPanel, LeftPanel, RightPanel } from "./panels";
import ModelPositioningManager from "./ModelPositioningManager";
import { useSceneStore } from "@envisio/core";
import { showToast } from "@envisio/core/utils";

const AdminLayout = ({ children, onSave, onPublish }) => {
  const [selectingPosition, setSelectingPosition] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number, number] | null
  >(null);
  const [pendingModel, setPendingModel] = useState<any>(null);

  const addModel = useSceneStore((state) => state.addModel);
  const bottomPanelVisible = useSceneStore((state) => state.bottomPanelVisible);

  const handlePositionSelected = (position: [number, number, number]) => {
    setSelectedPosition(position);
  };

  const handleConfirmPlacement = () => {
    if (pendingModel && selectedPosition) {
      addModel({
        ...pendingModel,
        position: selectedPosition,
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });
      showToast(`Added ${pendingModel.name} to scene`);

      // Reset state
      setPendingModel(null);
      setSelectedPosition(null);
      setSelectingPosition(false);
    }
  };

  const handleCancelPlacement = () => {
    setPendingModel(null);
    setSelectedPosition(null);
    setSelectingPosition(false);
    showToast("Model placement cancelled");
    // TODO: Reopen asset modal - need to pass callback from AdminAppBar
  };

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

      {/* Model Positioning Overlay */}
      <ModelPositioningManager
        selectingPosition={selectingPosition}
        selectedPosition={selectedPosition}
        pendingModel={pendingModel}
        onPositionSelected={handlePositionSelected}
        onConfirm={handleConfirmPlacement}
        onCancel={handleCancelPlacement}
      />

      {/* Glass panels overlay */}
      <LayoutContainer className="glass-layout">
        {/* Main Content: Left Panel (full height) | Center (Scene + Bottom) | Right Panel (full height) */}
        <MainContent>
          <LeftPanel />
          <CenterContainer>
            <SceneContainer>
              {/* This will be empty since canvas is now full viewport */}
            </SceneContainer>
            {/* Bottom Panel - now inside center container, conditionally rendered */}
            {bottomPanelVisible && (
              <BottomContainer>
                <BottomPanel />
              </BottomContainer>
            )}
          </CenterContainer>
          <RightPanel
            onSave={onSave}
            onPublish={onPublish}
            selectingPosition={selectingPosition}
            setSelectingPosition={setSelectingPosition}
            selectedPosition={selectedPosition}
            setSelectedPosition={setSelectedPosition}
            pendingModel={pendingModel}
            setPendingModel={setPendingModel}
          />
        </MainContent>
      </LayoutContainer>
    </>
  );
};

export default AdminLayout;
