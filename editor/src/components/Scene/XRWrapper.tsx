import React from "react";
import { XR, createXRStore } from "@react-three/xr";
import CameraSpringController from "./CameraSpringController";
import ObservationPointHandler from "./ObservationPointHandler";
import CameraPOVCaptureHandler from "./CameraPOVCaptureHandler";
import { OrbitControls } from "@react-three/drei";

// Create an XR store for XR usage
const xrStore = createXRStore();
// A simple XRWrapper that conditionally wraps children in an <XR> element.
const XRWrapper = ({
  enabled,
  children,
  orbitControlsRef,
}: {
  enabled: boolean;
  children: React.ReactNode;
  orbitControlsRef: React.RefObject<any>;
}) => {
  return (
    <>
      {enabled ? (
        <XR store={xrStore}>{children}</XR>
      ) : (
        <>
          <OrbitControls ref={orbitControlsRef} />
          <CameraSpringController orbitControlsRef={orbitControlsRef} />
          <ObservationPointHandler />
          <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />
          {children}
        </>
      )}
    </>
  );
};

export default XRWrapper;
