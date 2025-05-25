import { TilesRenderer } from "3d-tiles-renderer/r3f";

interface TilesViewerProps {
  apiKey: string;
}

export default function TilesViewer({ apiKey: _apiKey }: TilesViewerProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <TilesRenderer url="https://assets.ion.cesium.com/1/" />
    </>
  );
}
