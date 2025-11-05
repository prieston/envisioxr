import type { Model } from "./types";
import { createDefaultObservationProperties, createDefaultIotProperties } from "./model-helpers";

export function updateObjectInArray(
  objects: Model[],
  id: string,
  property: string,
  value: any
): Model[] {
  return objects.map((obj) => {
    if (obj.id !== id) return obj;

    if (property.includes(".")) {
      const [parent, child] = property.split(".");

      if (parent === "observationProperties" && !obj.observationProperties) {
        const observationProps = createDefaultObservationProperties() as any;
        if (
          child === "sensorType" &&
          (value === "cone" || value === "rectangle")
        ) {
          observationProps.sensorType = value as "cone" | "rectangle";
        } else if (
          child === "analysisQuality" &&
          (value === "low" || value === "medium" || value === "high")
        ) {
          observationProps.analysisQuality = value as
            | "low"
            | "medium"
            | "high";
        } else {
          observationProps[child] = value;
        }
        return { ...obj, observationProperties: observationProps };
      }

      if (parent === "iotProperties" && !obj.iotProperties) {
        const iotProps = {
          ...createDefaultIotProperties(),
          [child]: value,
        } as any;
        return { ...obj, iotProperties: iotProps };
      }

      return {
        ...obj,
        [parent]: { ...(obj[parent] || {}), [child]: value },
      } as any;
    }

    if (
      property === "isObservationModel" &&
      value === true &&
      !obj.observationProperties
    ) {
      return {
        ...obj,
        [property]: value,
        observationProperties: {
          ...createDefaultObservationProperties(),
          ...(obj.observationProperties || {}),
        },
      } as any;
    }

    return { ...obj, [property]: value } as any;
  });
}

