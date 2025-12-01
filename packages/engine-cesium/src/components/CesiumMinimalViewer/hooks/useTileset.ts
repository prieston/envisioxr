import { useRef, useState, useEffect } from "react";
import {
  loadTilesetWithTransform,
  waitForTilesetReady,
  reapplyTransformAfterReady,
  extractTilesetGeoreferencing,
  findExistingTileset,
  type TilesetTransformData,
} from "../../../utils/tileset-operations";
import {
  isGaussianSplattingError,
  createGaussianSplattingError,
  setupConsoleErrorInterceptor,
  setupTilesetErrorHandlers,
} from "../utils/error-handlers";
import type { CesiumModule } from "../types";

interface UseTilesetOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  cesiumAssetId: string;
  metadata?: Record<string, unknown> | null;
  initialTransform?: number[];
  enableLocationEditing?: boolean;
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
  enableLocationEditing = false,
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
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!viewer || !Cesium || !cesiumAssetId) {
      return;
    }

    // If we're already loading a tileset, don't start another load
    // This prevents duplicate tilesets when React StrictMode runs effects twice
    if (isLoadingRef.current) {
      return;
    }

    // Check if a tileset for this asset already exists in the scene
    // This prevents duplicate tilesets from being loaded (important for React StrictMode)
    if (
      tilesetRef.current &&
      viewer &&
      viewer.scene &&
      !(viewer.isDestroyed && viewer.isDestroyed())
    ) {
      const isInScene = viewer.scene.primitives.contains(tilesetRef.current);
      if (isInScene) {
        return;
      }
    }

    // Also check if any tileset with this asset ID is already in the scene
    // This handles the case where tilesetRef might not be set yet
    const existingTileset = findExistingTileset(viewer, cesiumAssetId);
    if (existingTileset) {
      tilesetRef.current = existingTileset;

      // Extract transform and georeferencing using utility function
      const { computedTransform, isGeoreferenced } =
        extractTilesetGeoreferencing(
          Cesium,
          existingTileset,
          metadata,
          initialTransform
        );

      setTransformToApply(computedTransform);
      setIsGeoreferenced(isGeoreferenced);

      // Notify tileset ready
      if (onTilesetReady) {
        onTilesetReady(existingTileset);
      }

      setIsReady(true);
      isLoadingRef.current = false;

      return;
    }

    // Set loading flag to prevent concurrent loads
    isLoadingRef.current = true;

    let cleanupConsoleInterceptor: (() => void) | null = null;
    let cleanupErrorHandlers: (() => void) | null = null;

    const loadTileset = async () => {
      try {
        gaussianSplatErrorShown.current = false;

        // Setup console error interceptor
        cleanupConsoleInterceptor = setupConsoleErrorInterceptor((err) => {
          // Check if viewer is still valid before reporting errors
          if (
            !viewer ||
            (viewer.isDestroyed && viewer.isDestroyed()) ||
            !viewer.scene
          ) {
            // Viewer is destroyed or scene is not available - ignore errors
            console.warn(
              "[useTileset] Error during cleanup (ignored):",
              err.message
            );
            return;
          }

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

        // Add custom property to track asset ID for duplicate detection
        tileset._kloradAssetId = cesiumAssetId;

        // Check if a tileset with this assetId is already in the scene
        // This prevents duplicates when React StrictMode runs effects twice
        const existingTileset = findExistingTileset(viewer, cesiumAssetId);

        // If a tileset with this assetId already exists, reuse it instead of adding the new one
        if (existingTileset) {
          tilesetRef.current = existingTileset;

          // Destroy the new tileset we just created to prevent memory leaks
          try {
            tileset.destroy();
          } catch (destroyErr) {
            console.warn(
              "[useTileset] Error destroying duplicate tileset:",
              destroyErr
            );
          }

          // Extract transform and georeferencing using utility function
          const { computedTransform, isGeoreferenced } =
            extractTilesetGeoreferencing(
              Cesium,
              existingTileset,
              metadata,
              initialTransform
            );

          setTransformToApply(computedTransform);
          setIsGeoreferenced(isGeoreferenced);

          // Notify tileset ready
          if (onTilesetReady) {
            onTilesetReady(existingTileset);
          }

          setIsReady(true);
          isLoadingRef.current = false;

          return; // Exit early, don't continue with the new tileset
        }

        // No existing tileset found, add the new one
        tilesetRef.current = tileset;

        // Check if viewer and scene are valid before adding tileset
        if (
          viewer &&
          viewer.scene &&
          !(viewer.isDestroyed && viewer.isDestroyed())
        ) {
          viewer.scene.primitives.add(tileset);
        }

        // Set up error handlers using utility function
        cleanupErrorHandlers = setupTilesetErrorHandlers(
          tileset,
          gaussianSplatErrorShown,
          (err) => {
            // Check if viewer is still valid before reporting errors
            if (
              !viewer ||
              (viewer.isDestroyed && viewer.isDestroyed()) ||
              !viewer.scene
            ) {
              // Viewer is destroyed or scene is not available - ignore errors
              console.warn(
                "[useTileset] Error during cleanup (ignored):",
                err.message
              );
              return;
            }

            setError(err);
            setIsReady(false);
            if (onError) {
              onError(err);
            }
          }
        );

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

        // Extract transform and georeferencing using utility function
        const { computedTransform, isGeoreferenced } =
          extractTilesetGeoreferencing(
            Cesium,
            tileset,
            metadata,
            initialTransform
          );

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
              if (
                viewer &&
                viewer.scene &&
                !(viewer.isDestroyed && viewer.isDestroyed())
              ) {
                viewer.scene.requestRender();
              }
            }, i * 100);
          }
        }

        // Check if viewer and scene are valid before requesting render
        if (
          viewer &&
          viewer.scene &&
          !(viewer.isDestroyed && viewer.isDestroyed())
        ) {
          viewer.scene.requestRender();
        }

        setIsGeoreferenced(isGeoreferenced);

        // Notify tileset ready
        if (onTilesetReady) {
          onTilesetReady(tileset);
        }

        setIsReady(true);

        // Clear loading flag after successful load
        isLoadingRef.current = false;
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

        // Check if viewer is still valid before reporting errors
        if (
          !viewer ||
          (viewer.isDestroyed && viewer.isDestroyed()) ||
          !viewer.scene
        ) {
          // Viewer is destroyed or scene is not available - ignore errors
          console.warn(
            "[useTileset] Error during cleanup (ignored):",
            errorObj.message
          );
          return;
        }

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
      // Clear loading flag on cleanup
      isLoadingRef.current = false;

      if (cleanupConsoleInterceptor) {
        cleanupConsoleInterceptor();
      }

      if (cleanupErrorHandlers) {
        cleanupErrorHandlers();
      }

      if (tilesetRef.current && viewer?.scene) {
        try {
          // In location editing mode, don't remove tileset on cleanup
          // It should persist across re-renders
          if (!enableLocationEditing) {
            viewer.scene.primitives.remove(tilesetRef.current);
          }
        } catch (err) {
          console.error("[useTileset] Error during cleanup:", err);
        }

        // Only clear ref if we actually removed it
        if (!enableLocationEditing) {
          tilesetRef.current = null;
        }
      }

      gaussianSplatErrorShown.current = false;
    };
  }, [
    viewer,
    Cesium,
    cesiumAssetId,
    enableLocationEditing,
    // In location editing mode, exclude metadata and initialTransform from dependencies
    // to prevent tileset reloads when transforms are applied manually
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(enableLocationEditing ? [] : [metadata, initialTransform]),
  ]);

  return {
    tileset: tilesetRef.current,
    isReady,
    error,
    transformToApply,
    isGeoreferenced,
  };
}
