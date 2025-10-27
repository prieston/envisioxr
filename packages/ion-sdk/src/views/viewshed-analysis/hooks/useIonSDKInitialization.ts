import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as IonSensors from "../../../vendor/cesium-ion-sdk/ion-sdk-sensors";
import * as IonGeometry from "../../../vendor/cesium-ion-sdk/ion-sdk-geometry";

async function initializeModule(
  initFn: any,
  moduleName: string
): Promise<void> {
  if (typeof initFn !== "function") return;

  try {
    await initFn();
  } catch (error: any) {
    if (!error?.message?.includes("Cannot redefine property")) {
      throw error;
    }
  }
}

export function useIonSDKInitialization(cesiumViewer: any) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        await initializeModule(
          (IonSensors as any).initializeSensors,
          "sensors"
        );
        await initializeModule(
          (IonGeometry as any).initializeGeometry,
          "geometry"
        );

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
  }, [cesiumViewer, isInitialized]);

  return isInitialized;
}
