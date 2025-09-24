"use client";

import React, { useEffect, useRef } from "react";
import useSceneStore from "../../hooks/useSceneStore";

type WeatherData3DDisplayProps = {
  objectId: string | number;
  position: [number, number, number]; // [lon, lat, height] in WGS84
  weatherData: null | {
    temperature?: number;
    windSpeed?: number;
    windDirection?: number;
    humidity?: number;
    pressure?: number;
    description?: string;
    lastUpdated?: Date | string;
  };
  displayFormat?: "compact" | "detailed" | "minimal";
  showInScene?: boolean;
};

const WeatherData3DDisplay: React.FC<WeatherData3DDisplayProps> = ({
  objectId,
  position,
  weatherData,
  displayFormat = "compact",
  showInScene = true,
}) => {
  const viewer = useSceneStore((s) => s.cesiumViewer);
  const Cesium = useSceneStore((s) => s.cesiumInstance);
  const entityIdRef = useRef(`iot-${objectId}`);

  useEffect(() => {
    if (!viewer || !Cesium || !showInScene || !position) return;

    const id = entityIdRef.current;
    const [lon, lat, h] = position;

    // Format text (guard against undefined values)
    const t =
      weatherData?.temperature != null
        ? `${weatherData.temperature.toFixed(1)}°C`
        : "--";
    const rh =
      weatherData?.humidity != null
        ? `${Math.round(weatherData.humidity)}%`
        : "--";
    const p =
      weatherData?.pressure != null
        ? `${Math.round(weatherData.pressure)} hPa`
        : "--";
    const w =
      weatherData?.windSpeed != null
        ? `${Math.round(weatherData.windSpeed)} m/s`
        : "--";
    const status = weatherData?.description ?? "";
    const updated = weatherData?.lastUpdated
      ? (() => {
          const date = weatherData.lastUpdated;
          // Handle both Date objects and string dates (from serialization)
          if (date instanceof Date) {
            return date.toLocaleTimeString();
          } else if (typeof date === "string") {
            return new Date(date).toLocaleTimeString();
          }
          return "";
        })()
      : "";

    const text =
      displayFormat === "compact"
        ? `${t}${status ? `  |  ${status}` : ""}`
        : displayFormat === "detailed"
          ? `Temp: ${t}\nHumidity: ${rh}\nPressure: ${p}\nWind: ${w}${status ? `\n${status}` : ""}${updated ? `\n⏱ ${updated}` : ""}`
          : `${t}`;

    // Build safe colors (ALWAYS provide these to avoid DeveloperError)
    const labelFill = Cesium.Color.WHITE;
    const labelOutline = Cesium.Color.BLACK;
    const bgColor = Cesium.Color.fromBytes(25, 30, 40, 200); // dark slate w/ alpha
    const pinColor = Cesium.Color.SKYBLUE;

    // Position
    const pos = Cesium.Cartesian3.fromDegrees(lon, lat, h);

    // Create or update a single entity
    let entity = viewer.entities.getById(id);
    if (!entity) {
      entity = viewer.entities.add({
        id,
        position: pos,
        // Small icon anchor (uses a colored pin with a cloud glyph)
        billboard: {
          image: (() => {
            try {
              // some Cesium builds require explicit size; emoji may fail on some systems
              return new Cesium.PinBuilder()
                .fromText("☁︎", pinColor, 32) // text, color, size
                .toDataURL();
            } catch {
              // robust fallback: plain colored pin
              return new Cesium.PinBuilder()
                .fromColor(pinColor, 32) // color, size
                .toDataURL();
            }
          })(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 0.6, // ✅ required - explicit scale
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          // optional scale by distance to reduce clutter
          scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 0.6),
        },
        // Readable label with explicit colors and size
        label: {
          text: text || "--",
          font: "bold 13px sans-serif",
          fillColor: labelFill, // ✅ required
          outlineColor: labelOutline, // ✅ safe
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          showBackground: true,
          backgroundColor: bgColor, // ✅ safe
          backgroundPadding: new Cesium.Cartesian2(8, 6),
          scale: 1.0, // ✅ explicit scale for labels
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 0.8),
        },
      });
    } else {
      entity.position = pos;
      if (entity.billboard) {
        // reassign image defensively if it was ever invalidated
        try {
          (entity.billboard as any).image = new Cesium.PinBuilder()
            .fromText("☁︎", pinColor, 32)
            .toDataURL();
        } catch {
          (entity.billboard as any).image = new Cesium.PinBuilder()
            .fromColor(pinColor, 32)
            .toDataURL();
        }
        (entity.billboard as any).scale = 0.6; // ✅ maintain scale
        (entity.billboard as any).disableDepthTestDistance =
          Number.POSITIVE_INFINITY;
      }
      if (entity.label) {
        (entity.label as any).text = text || "--";
        (entity.label as any).fillColor = labelFill;
        (entity.label as any).outlineColor = labelOutline;
        (entity.label as any).backgroundColor = bgColor;
        (entity.label as any).scale = 1.0; // ✅ maintain scale
        (entity.label as any).disableDepthTestDistance =
          Number.POSITIVE_INFINITY;
      }
    }

    // Since requestRenderMode is on, ask for a frame
    viewer.scene.requestRender();

    // Cleanup when unmounting or toggling off
    return () => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
      viewer.scene.requestRender();
    };
  }, [
    viewer,
    Cesium,
    objectId,
    position,
    showInScene,
    displayFormat,
    weatherData,
  ]);

  return null;
};

export default WeatherData3DDisplay;
