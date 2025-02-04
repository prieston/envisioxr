"use client";

import { forwardRef, Suspense, useImperativeHandle, useRef } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  View as ViewImpl,
} from "@react-three/drei";
//  @ts-ignore-next-line
import { Three } from "@/helpers/components/Three";

export const Common = ({ color }) => (
  <Suspense fallback={null}>
    {/* @ts-ignore-next-line */}
    {color && <color attach="background" args={[color]} />}
    {/* @ts-ignore-next-line */}
    <ambientLight />
    {/* @ts-ignore-next-line */}
    <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
    {/* @ts-ignore-next-line */}
    <pointLight position={[-10, -10, -10]} color="blue" decay={0.2} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
  </Suspense>
);

interface ViewProps {
  children?: React.ReactNode;
  orbit?: boolean;
  [key: string]: any;
}

const View = forwardRef(({ children, orbit, ...props }: ViewProps, ref) => {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
        </ViewImpl>
      </Three>
    </>
  );
});
View.displayName = "View";

export { View };
