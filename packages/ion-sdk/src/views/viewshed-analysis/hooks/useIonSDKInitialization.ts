import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getIonSDKModules } from "../../../index";

/**
 * Hook to initialize Ion SDK modules (sensors, geometry) after SDK is loaded.
 * Note: SDK loading is handled by CesiumViewer initialization, this hook only
 * initializes the modules that require additional setup.
 */
export function useIonSDKInitialization(cesiumViewer: any) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        // SDK should already be loaded by CesiumViewer, but get modules safely
        const { IonSensors, IonGeometry } = await getIonSDKModules();

        // Initialize sensors module
        if (typeof (IonSensors as any).initializeSensors === "function") {
          await (IonSensors as any).initializeSensors();
        }

        // Initialize geometry module
        if (typeof (IonGeometry as any).initializeGeometry === "function") {
          await (IonGeometry as any).initializeGeometry();
        }

        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize Ion SDK modules:", err);
        toast.error("Failed to initialize Ion SDK modules", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    initializeIonSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesiumViewer]); // Removed isInitialized from deps - it's only used as a guard

  return isInitialized;
}
