"use client";

import React, { useEffect, useRef } from "react";
import { useSceneStore } from "@klorad/core";

type WeatherData3DDisplayProps = {
  objectId: string | number;
  position: [number, number, number];
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

const CesiumWeatherData3DDisplay: React.FC<WeatherData3DDisplayProps> = ({
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
    const posArray = Array.isArray(position) ? position : [0, 0, 0];
    const [lon, lat, h] = posArray;

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
          if (date instanceof Date) return date.toLocaleTimeString();
          if (typeof date === "string")
            return new Date(date).toLocaleTimeString();
          return "";
        })()
      : "";

    const text =
      displayFormat === "compact"
        ? `${t}${status ? `  |  ${status}` : ""}`
        : displayFormat === "detailed"
          ? `Temp: ${t}\nHumidity: ${rh}\nPressure: ${p}\nWind: ${w}${status ? `\n${status}` : ""}${updated ? `\n⏱ ${updated}` : ""}`
          : `${t}`;

    const labelFill = Cesium.Color.WHITE;
    const labelOutline = Cesium.Color.BLACK;
    const bgColor = Cesium.Color.fromBytes(25, 30, 40, 200);
    const pinColor = Cesium.Color.SKYBLUE;

    const pos = Cesium.Cartesian3.fromDegrees(lon, lat, h);

    let entity = viewer.entities.getById(id);
    if (!entity) {
      entity = viewer.entities.add({
        id,
        position: pos,
        billboard: {
          image: (() => {
            try {
              return new Cesium.PinBuilder()
                .fromText("☁︎", pinColor, 32)
                .toDataURL();
            } catch {
              return new Cesium.PinBuilder()
                .fromColor(pinColor, 32)
                .toDataURL();
            }
          })(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 0.6,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 0.6),
        },
        label: {
          text: text || "--",
          font: "bold 13px sans-serif",
          fillColor: labelFill,
          outlineColor: labelOutline,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          showBackground: true,
          backgroundColor: bgColor,
          backgroundPadding: new Cesium.Cartesian2(8, 6),
          scale: 1.0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(100, 1.0, 2000, 0.8),
        },
      });
    } else {
      entity.position = pos;
      if (entity.billboard) {
        try {
          (entity.billboard as any).image = new Cesium.PinBuilder()
            .fromText("☁︎", pinColor, 32)
            .toDataURL();
        } catch {
          (entity.billboard as any).image = new Cesium.PinBuilder()
            .fromColor(pinColor, 32)
            .toDataURL();
        }
        (entity.billboard as any).scale = 0.6;
        (entity.billboard as any).disableDepthTestDistance =
          Number.POSITIVE_INFINITY;
      }
      if (entity.label) {
        (entity.label as any).text = text || "--";
        (entity.label as any).fillColor = labelFill;
        (entity.label as any).outlineColor = labelOutline;
        (entity.label as any).backgroundColor = bgColor;
        (entity.label as any).scale = 1.0;
        (entity.label as any).disableDepthTestDistance =
          Number.POSITIVE_INFINITY;
      }
    }

    viewer.scene.requestRender();

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

export default CesiumWeatherData3DDisplay;
