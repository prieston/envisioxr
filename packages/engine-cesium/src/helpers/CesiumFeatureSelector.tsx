import { useEffect, useRef } from "react";
import { useSceneStore } from "@envisio/core";

/**
 * Handles selection of Cesium 3D Tiles features to extract metadata/properties
 *
 * Features:
 * - Supports both legacy Cesium3DTileFeature and modern ModelFeature (3D Tiles 1.1)
 * - Merges metadata from per-feature properties, inherited properties, and group/content metadata tables
 * - Duck-typing instead of instanceof to avoid double-bundled Cesium issues
 * - Left-click: Select topmost feature
 * - Shift+Left-click: Drill pick through overlapping features
 * - Captures world position for UI anchoring
 * - Clears selection on empty clicks
 */
const CesiumFeatureSelector: React.FC = () => {
  const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
  const cesiumInstance = useSceneStore((s) => s.cesiumInstance);
  const previewMode = useSceneStore((s) => s.previewMode);
  const setSelectedCesiumFeature = useSceneStore(
    (s) => s.setSelectedCesiumFeature
  );
  const deselectObject = useSceneStore((s) => s.deselectObject);
  const handlerRef = useRef<any>(null);

  useEffect(() => {
    if (!cesiumViewer || !cesiumInstance || previewMode) {
      return;
    }

    // cleanup old handler
    if (handlerRef.current) {
      try {
        handlerRef.current.destroy();
      } catch {
        // Ignore cleanup errors
      }
      handlerRef.current = null;
    }

    const scene = cesiumViewer.scene;
    const canvas = scene?.canvas;
    if (!canvas) return;

    const handler = new cesiumInstance.ScreenSpaceEventHandler(canvas);

    const isFeatureLike = (obj: any) =>
      obj &&
      typeof obj.getProperty === "function" &&
      typeof obj.getPropertyIds === "function";

    const mergeMetadata = (feature: any) => {
      const out: Record<string, any> = {};

      // Per-feature properties (old + new)
      try {
        const ids = feature.getPropertyIds?.() || [];
        for (const id of ids) {
          try {
            out[id] = feature.getProperty(id);
          } catch {
            // Skip properties that can't be read
          }
        }
      } catch {
        // Ignore top-level errors
      }

      // Inherited (3D Tiles 1.1) – sometimes holds IFC-ish fields
      const candidates = [
        "IfcGuid",
        "ElementId",
        "Category",
        "Level",
        "Family",
        "name",
        "id",
        "type",
      ];
      for (const k of candidates) {
        try {
          const v =
            feature.getProperty?.(k) ?? feature.getPropertyInherited?.(k);
          if (v !== undefined && out[k] === undefined) out[k] = v;
        } catch {
          // Skip if property doesn't exist
        }
      }

      // Group/content metadata tables (3D Tiles 1.1)
      try {
        const groupMd = feature?.content?.group?.metadata;
        const contentMd = feature?.content?.metadata;
        const addFromMd = (md: any) => {
          if (!md) return;
          const keys = md.getPropertyIds?.() || [];
          for (const k of keys) {
            try {
              const v = md.getProperty(k);
              if (v !== undefined && out[k] === undefined) out[k] = v;
            } catch {
              // Skip if property doesn't exist
            }
          }
        };
        addFromMd(groupMd);
        addFromMd(contentMd);
      } catch {
        // Ignore metadata table errors
      }

      return out;
    };

    // Primary click: pick topmost feature
    handler.setInputAction((movement: any) => {
      try {
        const picked = scene.pick(movement.position);

        if (picked && isFeatureLike(picked)) {
          const properties = mergeMetadata(picked);
          const worldPos = scene.pickPosition?.(movement.position);

          // Clear any selected scene object when selecting a Cesium feature
          deselectObject();

          setSelectedCesiumFeature({
            properties,
            worldPosition: worldPos ?? null,
          });
          return;
        }
        // Clicked empty or non-feature: clear selection
        setSelectedCesiumFeature(null);
      } catch (err) {
        console.error("Error picking Cesium feature:", err);
        setSelectedCesiumFeature(null);
      }
    }, cesiumInstance.ScreenSpaceEventType.LEFT_CLICK);

    // Shift+click: drill pick (all features under cursor)
    handler.setInputAction(
      (movement: any) => {
        try {
          const pickedArray = scene.drillPick(movement.position) || [];
          const features = pickedArray.filter(isFeatureLike).map((f: any) => ({
            properties: mergeMetadata(f),
          }));
          if (features.length > 0) {
            const worldPos = scene.pickPosition?.(movement.position);

            // Clear any selected scene object when selecting a Cesium feature
            deselectObject();

            // For drill pick, show the first feature's properties (can be extended to show all)
            setSelectedCesiumFeature({
              properties: features[0].properties,
              worldPosition: worldPos ?? null,
              drillPickCount: features.length,
            });
            return;
          }
          setSelectedCesiumFeature(null);
        } catch (err) {
          console.error("Drill pick error:", err);
          setSelectedCesiumFeature(null);
        }
      },
      cesiumInstance.ScreenSpaceEventType.LEFT_CLICK,
      cesiumInstance.KeyboardEventModifier.SHIFT
    );

    handlerRef.current = handler;

    return () => {
      if (handlerRef.current) {
        try {
          handlerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        handlerRef.current = null;
      }
    };
  }, [
    cesiumViewer,
    cesiumInstance,
    previewMode,
    setSelectedCesiumFeature,
    deselectObject,
  ]);

  return null;
};

export default CesiumFeatureSelector;
