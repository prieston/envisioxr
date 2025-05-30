"use client";

import React from "react";
import { XR, createXRStore } from "@react-three/xr";
import {
  CameraSpringController,
  ObservationPointHandler,
  CameraPOVCaptureHandler,
} from ".";

// Create an XR store for XR usage
const xrStore = createXRStore();

interface XRWrapperProps {
  enabled: boolean;
  children: React.ReactNode;
}

const XRWrapper: React.FC<XRWrapperProps> = ({ enabled, children }) => {
  return (
    <>
      {enabled ? (
        <XR store={xrStore}>{children}</XR>
      ) : (
        <>
          <CameraSpringController />
          <ObservationPointHandler />
          <CameraPOVCaptureHandler />
          {children}
        </>
      )}
    </>
  );
};

export default XRWrapper;
