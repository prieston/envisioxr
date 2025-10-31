import React from "react";
interface CesiumBasemapSelectorProps {
    onBasemapChange: (basemapType: "cesium" | "google" | "google-photorealistic" | "none") => void;
    currentBasemap?: string;
    disabled?: boolean;
}
declare const CesiumBasemapSelector: React.FC<CesiumBasemapSelectorProps>;
export default CesiumBasemapSelector;
//# sourceMappingURL=CesiumBasemapSelector.d.ts.map