// Google3DTiles.tsx
"use client";
import React from "react";
import {
  TilesRenderer,
  TilesPlugin,
  TilesAttributionOverlay,
  EastNorthUpFrame,
} from "3d-tiles-renderer/r3f";
import { GoogleCloudAuthPlugin, ReorientationPlugin } from "3d-tiles-renderer";
import * as THREE from "three";

type Google3DTilesProps = {
  apiKey: string; // Your Google Maps API key (with Map Tiles API enabled)
  lat: number; // Latitude (in degrees) where you want to center the tiles
  lon: number; // Longitude (in degrees) for centering
  alt?: number; // Altitude in meters (default is 0)
  children?: React.ReactNode; // Optional React children to overlay (e.g. virtual models)
};

const Google3DTiles: React.FC<Google3DTilesProps> = ({
  apiKey,
  lat,
  lon,
  alt = 0,
  children,
}) => {
  // Convert lat/lon from degrees to radians (as required by the plugins)
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);

  return (
    <TilesRenderer
      // Optional callbacks when tiles or the full tileset have loaded
      onLoadTileset={(tileset) => {
        console.log("Tileset loaded:", tileset);
      }}
      onLoad={(tile) => {
        console.log("Tile loaded:", tile);
      }}
    >
      {/**
        1. Use GoogleCloudAuthPlugin to inject your API key into the tile requests.
           This tells the loader to fetch Google’s Photorealistic 3D Tiles.
      */}
      <TilesPlugin plugin={GoogleCloudAuthPlugin} args={{ apiToken: apiKey }} />

      {/**
        2. Use ReorientationPlugin to transform the tileset into a local “flat‐earth”
           coordinate system. The given lat/lon/alt become the origin (0,0,0)
           and the tiles are reoriented to an East–North–Up frame.
      */}
      <TilesPlugin
        plugin={ReorientationPlugin}
        args={{ lat: latRad, lon: lonRad, height: alt }}
      />

      {/**
        3. Display an attribution overlay. Google Maps terms require that you display
           appropriate attribution for map data.
      */}
      <TilesAttributionOverlay
        style={{ position: "absolute", bottom: 0, right: 0, color: "#888" }}
      />

      {/**
        4. If you want to overlay virtual models at specific geo-coordinates,
           wrap them in an EastNorthUpFrame. In this example, any children passed to
           Google3DTiles will be rendered in a local coordinate frame where (0,0,0)
           corresponds to the provided lat, lon, alt.
      */}
      {children && (
        <EastNorthUpFrame lat={latRad} lon={lonRad} height={alt}>
          {children}
        </EastNorthUpFrame>
      )}
    </TilesRenderer>
  );
};

export default Google3DTiles;
