import { Canvas } from "@react-three/fiber";
import { TilesRenderer } from "3d-tiles-renderer/r3f";

interface TilesViewerProps {
  tilesetUrl: string;
  cameraPosition?: [number, number, number];
}

export default function TilesViewer({
  tilesetUrl,
  cameraPosition = [0, 0, 5],
}: TilesViewerProps) {
  // console.info("TilesViewer", TilesRenderer);
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas camera={{ position: cameraPosition }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <TilesRenderer url={tilesetUrl} />
      </Canvas>
    </div>
  );
}
