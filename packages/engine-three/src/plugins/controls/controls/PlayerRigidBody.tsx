import React, { forwardRef } from "react";
import { RigidBody } from "@react-three/rapier";

interface PlayerRigidBodyProps {
  playerHeight: number;
  playerRadius: number;
  children?: React.ReactNode;
}

export const PlayerRigidBody = forwardRef<any, PlayerRigidBodyProps>(
  (props, ref) => {
    const { playerHeight, playerRadius, children } = props;

    return (
      <RigidBody
        ref={ref}
        type="dynamic"
        colliders="cuboid"
        position={[0, playerHeight, 0]}
        lockRotations
      >
        <mesh visible={false}>
          <capsuleGeometry args={[playerHeight / 2, playerRadius * 2]} />
        </mesh>
        {children}
      </RigidBody>
    );
  }
);
