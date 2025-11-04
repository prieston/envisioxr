import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { loadIonSDK, getIonSDKModules } from "../../../index";

export function useIonSDKInitialization(cesiumViewer: any) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        // Load vendor modules (client-only, SSR-safe)
        await loadIonSDK();

        // Initialize modules after loading
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
