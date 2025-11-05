import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getIonSDKModules } from "../../../index";

// Global flag to prevent multiple initializations (similar to ensureIonSDKLoaded pattern)
let isInitializedGlobally = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Hook to initialize Ion SDK modules (sensors, geometry) after SDK is loaded.
 * Note: SDK loading is handled by CesiumViewer initialization, this hook only
 * initializes the modules that require additional setup.
 *
 * This hook uses a global flag to ensure initialization only happens once,
 * even if multiple ViewshedAnalysis components are rendered.
 */
export function useIonSDKInitialization(cesiumViewer: any) {
  const [isInitialized, setIsInitialized] = useState(isInitializedGlobally);

  useEffect(() => {
    if (!cesiumViewer || isInitializedGlobally) {
      if (isInitializedGlobally && !isInitialized) {
        setIsInitialized(true);
      }
      return;
    }

    // If initialization is already in progress, wait for it
    if (initializationPromise) {
      initializationPromise.then(() => {
        setIsInitialized(true);
      });
      return;
    }

    const initializeIonSDK = async () => {
      try {
        // SDK should already be loaded by CesiumViewer, but get modules safely
        const { IonSensors, IonGeometry } = await getIonSDKModules();

        // Initialize sensors module (only if not already initialized)
        if (typeof (IonSensors as any).initializeSensors === "function") {
          await (IonSensors as any).initializeSensors();
        }

        // Initialize geometry module (only if not already initialized)
        if (typeof (IonGeometry as any).initializeGeometry === "function") {
          await (IonGeometry as any).initializeGeometry();
        }

        isInitializedGlobally = true;
        initializationPromise = null;
        setIsInitialized(true);
      } catch (err: any) {
        // If error is "Cannot redefine property", it means already initialized
        if (err?.message?.includes('Cannot redefine property')) {
          isInitializedGlobally = true;
          initializationPromise = null;
          setIsInitialized(true);
        } else {
          initializationPromise = null;
          toast.error("Failed to initialize Ion SDK modules", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      }
    };

    initializationPromise = initializeIonSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesiumViewer]); // Removed isInitialized from deps - it's only used as a guard

  return isInitialized;
}
