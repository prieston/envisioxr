import React from "react";
import { TilesRenderer, TilesPlugin } from "3d-tiles-renderer/r3f";
import { GoogleCloudAuthPlugin } from "3d-tiles-renderer";

interface GoogleTilesRendererProps {
  apiKey: string;
}

const GoogleTilesRenderer: React.FC<GoogleTilesRendererProps> = ({
  apiKey,
}) => {
  return (
    <TilesRenderer>
      <TilesPlugin plugin={GoogleCloudAuthPlugin} args={{ apiKey }} />
    </TilesRenderer>
  );
};

export default GoogleTilesRenderer;
