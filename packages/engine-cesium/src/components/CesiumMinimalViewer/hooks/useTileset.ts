import { useRef, useState, useEffect } from "react";
import {
  loadTilesetWithTransform,
  waitForTilesetReady,
  reapplyTransformAfterReady,
  extractTransformFromMetadata,
  extractTransformFromTileset,
  type TilesetTransformData,
} from "../../../utils/tileset-operations";
import {
  isGaussianSplattingError,
  createGaussianSplattingError,
  setupConsoleErrorInterceptor,
} from "../utils/error-handlers";
import type { CesiumModule } from "../types";

interface UseTilesetOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  cesiumAssetId: string;
  metadata?: Record<string, unknown> | null;
  initialTransform?: number[];
  onTilesetReady?: (tileset: any) => void;
  onError?: (error: Error) => void;
}

interface UseTilesetReturn {
  tileset: any | null;
  isReady: boolean;
  error: Error | null;
  transformToApply: TilesetTransformData | undefined;
  isGeoreferenced: boolean;
}

/**
 * Hook to manage tileset loading and lifecycle
 */
export function useTileset({
  viewer,
  Cesium,
  cesiumAssetId,
  metadata,
  initialTransform,
  onTilesetReady,
  onError,
}: UseTilesetOptions): UseTilesetReturn {
  const tilesetRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transformToApply, setTransformToApply] = useState<
    TilesetTransformData | undefined
  >(undefined);
  const [isGeoreferenced, setIsGeoreferenced] = useState(false);
  const gaussianSplatErrorShown = useRef(false);

  useEffect(() => {
    if (!viewer || !Cesium || !cesiumAssetId) {
      return;
    }

    let cleanupConsoleInterceptor: (() => void) | null = null;

    const loadTileset = async () => {
      try {
        gaussianSplatErrorShown.current = false;

        // Setup console error interceptor
        cleanupConsoleInterceptor = setupConsoleErrorInterceptor((err) => {
          if (!gaussianSplatErrorShown.current) {
            gaussianSplatErrorShown.current = true;
            setError(err);
            setIsReady(false);
            if (onError) {
              onError(err);
            }
          }
        });

        // Convert initialTransform array to TilesetTransformData if provided
        const transform: TilesetTransformData | undefined =
          initialTransform && initialTransform.length === 16
            ? { matrix: initialTransform }
            : undefined;

        const tileset = await loadTilesetWithTransform(
          Cesium,
          cesiumAssetId,
          metadata,
          transform,
          { log: false }
        );
        tilesetRef.current = tileset;

        viewer.scene.primitives.add(tileset);

        // Set up error handler for tileset tile failures
        const handleTileError = (tile: any, tileError: any) => {
          if (gaussianSplatErrorShown.current) {
            return;
          }

          if (isGaussianSplattingError(tileError)) {
            gaussianSplatErrorShown.current = true;
            const friendlyError = createGaussianSplattingError();
            setError(friendlyError);
            setIsReady(false);
            if (onError) {
              onError(friendlyError);
            }
          }
        };

        tileset.tileFailed.addEventListener(handleTileError);

        // Listen for general tileset errors
        if (tileset.readyPromise) {
          tileset.readyPromise.catch((readyError: any) => {
            if (gaussianSplatErrorShown.current) {
              return;
            }

            if (isGaussianSplattingError(readyError)) {
              gaussianSplatErrorShown.current = true;
              const friendlyError = createGaussianSplattingError();
              setError(friendlyError);
              setIsReady(false);
              if (onError) {
                onError(friendlyError);
              }
            }
          });
        }

        // Wait for ready
        try {
          await waitForTilesetReady(tileset);

          // Check for failed tiles after a moment
          setTimeout(() => {
            if (gaussianSplatErrorShown.current) {
              return;
            }

            if (
              tileset.statistics &&
              tileset.statistics.numberOfTilesWithContentFailed > 0
            ) {
              console.warn(
                "[useTileset] Some tiles failed to load. Check for Gaussian splatting errors."
              );
            }
          }, 2000);
        } catch (readyError: any) {
          if (isGaussianSplattingError(readyError)) {
            gaussianSplatErrorShown.current = true;
            const friendlyError = createGaussianSplattingError();
            setError(friendlyError);
            setIsReady(false);
            if (onError) {
              onError(friendlyError);
            }
            return;
          }
          throw readyError;
        }

        // Extract transform from metadata or use initialTransform
        const transformFromMetadata = extractTransformFromMetadata(metadata);

        // If no transform from metadata but tileset has a modelMatrix, extract it
        let transformFromTileset: TilesetTransformData | undefined = undefined;
        if (
          !transformFromMetadata &&
          !initialTransform &&
          tileset.modelMatrix
        ) {
          try {
            const extracted = extractTransformFromTileset(Cesium, tileset);
            if (extracted) {
              transformFromTileset = extracted;
            }
          } catch (err) {
            console.warn(
              "[useTileset] Failed to extract transform from tileset:",
              err
            );
          }
        }

        const computedTransform: TilesetTransformData | undefined =
          initialTransform && initialTransform.length === 16
            ? { matrix: initialTransform }
            : transformFromMetadata || transformFromTileset;

        setTransformToApply(computedTransform);

        // Re-apply transform after ready
        if (computedTransform) {
          reapplyTransformAfterReady(Cesium, tileset, computedTransform, {
            viewer,
            log: false,
          });

          // Force multiple renders
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              if (viewer && !viewer.isDestroyed()) {
                viewer.scene.requestRender();
              }
            }, i * 100);
          }
        }

        viewer.scene.requestRender();

        // Determine if georeferenced
        let georeferencedByDefault = false;

        // Check modelMatrix translation
        if (tileset.modelMatrix) {
          const translation = new Cesium.Cartesian3(
            tileset.modelMatrix[12],
            tileset.modelMatrix[13],
            tileset.modelMatrix[14]
          );
          const magnitude = Cesium.Cartesian3.magnitude(translation);
          if (magnitude > 1e-6) {
            georeferencedByDefault = true;
          }
        }

        // Check bounding sphere center
        if (!georeferencedByDefault && tileset.boundingSphere) {
          const centerMagnitude = Cesium.Cartesian3.magnitude(
            tileset.boundingSphere.center
          );
          if (centerMagnitude > 1000000) {
            georeferencedByDefault = true;
          }
        }

        const georeferenced = !!computedTransform || georeferencedByDefault;
        setIsGeoreferenced(georeferenced);

        // Notify tileset ready
        if (onTilesetReady) {
          onTilesetReady(tileset);
        }

        setIsReady(true);
      } catch (loadError: any) {
        if (isGaussianSplattingError(loadError)) {
          gaussianSplatErrorShown.current = true;
          const friendlyError = createGaussianSplattingError();
          setError(friendlyError);
          setIsReady(false);
          if (onError) {
            onError(friendlyError);
          }
          return;
        }

        // Re-throw other errors
        const errorObj =
          loadError instanceof Error ? loadError : new Error(String(loadError));
        setError(errorObj);
        setIsReady(false);
        if (onError) {
          onError(errorObj);
        }
      }
    };

    loadTileset();

    // Cleanup
    return () => {
      if (cleanupConsoleInterceptor) {
        cleanupConsoleInterceptor();
      }

      if (tilesetRef.current && viewer?.scene) {
        try {
          viewer.scene.primitives.remove(tilesetRef.current);
        } catch (err) {
          // Ignore
        }
        tilesetRef.current = null;
      }

      gaussianSplatErrorShown.current = false;
    };
  }, [viewer, Cesium, cesiumAssetId, metadata, initialTransform]);

  return {
    tileset: tilesetRef.current,
    isReady,
    error,
    transformToApply,
    isGeoreferenced,
  };
}

