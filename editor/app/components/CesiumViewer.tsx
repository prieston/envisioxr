'use client';

import { useEffect, useRef } from 'react';
import useWorldStore from '../hooks/useWorldStore';

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const world = useWorldStore((s) => s.activeWorld);
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;
    // Initialize Cesium viewer with a minimal UI.
    // Cesium is only imported client side.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Cesium = require('cesium');
    cesiumRef.current = Cesium;
    const { Viewer } = Cesium;
    viewerRef.current = new Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      fullscreenButton: false,
    });
    return () => viewerRef.current?.destroy();
  }, []);

  // Render dummy entities whenever world data changes
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium) return;
    viewer.entities.removeAll();
    const objects = (world?.sceneData?.objects as any[]) || [];
    objects.forEach((obj) => {
      const [x = 0, y = 0, z = 0] = obj.position || [];
      // Place simple points in space. Future engines can extend this logic.
      viewer.entities.add({
        position: Cesium.Cartesian3.fromElements(x, y, z),
        point: { pixelSize: 10, color: Cesium.Color.RED },
      });
    });
  }, [world]);

  return <div style={{ width: '100%', height: '100%' }} ref={containerRef} />;
}

