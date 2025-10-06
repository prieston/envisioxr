"use client";

import React from "react";
import { XR, createXRStore } from "@react-three/xr";
import { CameraPOVCaptureHandler, ObservationPointHandler } from "./Scene";
import CameraSpringController from "../plugins/spring/CameraSpringController";

const xrStore = createXRStore();

export interface XRWrapperProps {
  enabled: boolean;
  children: React.ReactNode;
}

export default function XRWrapper({ enabled, children }: XRWrapperProps) {
  return enabled ? (
    <XR store={xrStore}>{children}</XR>
  ) : (
    <>
      <CameraSpringController />
      <ObservationPointHandler />
      <CameraPOVCaptureHandler />
      {children}
    </>
  );
}
