"use client";

import React from "react";
import { getModel } from "@/app/utils/api";
import { showToast } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
import { createLogger } from "@envisio/core";
import * as THREE from "three";
import { localToGeographic } from "@envisio/core";
import { Description as DescriptionIcon } from "@mui/icons-material";
import { ActionButton } from "@envisio/ui";

const logger = createLogger("ReportGenerator");

interface ReportGeneratorProps {
  onClose?: () => void;
  disabled?: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ disabled }) => {
  const { objects, tilesRenderer } = useSceneStore();

  const generateReport = async () => {
    try {
      // Create a new window for the report
      const reportWindow = window.open("", "_blank");
      if (!reportWindow) {
        showToast("Please allow popups to generate the report");
        return;
      }

      // Start writing the HTML content
      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Scene Report</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@v7.4.0/ol.css">
          <script src="https://cdn.jsdelivr.net/npm/ol@v7.4.0/dist/ol.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header-actions {
              position: fixed;
              top: 20px;
              right: 20px;
              display: flex;
              gap: 10px;
              z-index: 1000;
            }
            .action-button {
              padding: 10px 20px;
              background-color: #1f2937;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
            .action-button:hover {
              background-color: #111827;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
            }
            .stat-label {
              color: #6b7280;
              margin-top: 5px;
            }
            .chart-container {
              height: 300px;
              margin: 20px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f9fafb;
            }
            .map-container {
              width: 100%;
              height: 500px;
              margin: 20px 0;
              border: 1px solid #e5e7eb;
              border-radius: 5px;
            }
            .metadata-section {
              margin-top: 10px;
              padding: 10px;
              background-color: #f3f4f6;
              border-radius: 5px;
            }
            .metadata-section h4 {
              margin: 0 0 10px 0;
              color: #111827;
            }
            .metadata-item {
              margin: 5px 0;
              padding: 5px;
              border-bottom: 1px solid #e5e7eb;
            }
            .metadata-label {
              font-weight: bold;
              color: #374151;
            }
            @media print {
              .header-actions {
                display: none;
              }
              .map-container {
                height: 800px !important;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              table {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .stat-card {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              .chart-container {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-actions">
            <button class="action-button" onclick="window.print()">Print Report</button>
          </div>

          <h1>Scene Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>

          <h2>Scene Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${objects.length}</div>
              <div class="stat-label">Total Models</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${new Set(objects.map((obj) => obj.type)).size}</div>
              <div class="stat-label">Unique Model Types</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${objects.filter((obj) => obj.assetId).length}</div>
              <div class="stat-label">Models with Metadata</div>
            </div>
          </div>

          <div class="chart-container">
            <canvas id="modelTypeChart"></canvas>
          </div>

          <h2>Models</h2>
          <table>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Position</th>
              <th>Location</th>
              <th>Coordinate System</th>
              <th>Description</th>
            </tr>
      `);

      // Add each object to the table
      for (const obj of objects) {
        const position = obj.position
          ? `(${obj.position.map((coord) => coord.toFixed(4)).join(", ")})`
          : "N/A";
        let location = "N/A";
        let metadata = null;

        if (obj.position && obj.position.length === 3) {
          const [x, y, z] = obj.position;

          // Use coordinate system metadata if available, otherwise detect
          const isGeographic =
            obj.coordinateSystem === "geographic" ||
            (x >= -180 &&
              x <= 180 &&
              y >= -90 &&
              y <= 90 &&
              Math.abs(z) < 50000);

          if (isGeographic) {
            // Already in geographic format (longitude, latitude, height)
            location = `${y.toFixed(6)}, ${x.toFixed(6)}`;
          } else if (tilesRenderer) {
            // Convert from local coordinates to geographic using proper conversion
            const coords = localToGeographic(
              tilesRenderer,
              new THREE.Vector3(x, y, z)
            );
            location = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
          } else {
            // Fallback: assume local coordinates and use simple conversion
            const earthRadius = 6378137.0; // Earth's radius in meters
            const latOffset = (x / earthRadius) * (180 / Math.PI);
            const lonOffset =
              (z / (earthRadius * Math.cos((35 * Math.PI) / 180))) *
              (180 / Math.PI);
            const latitude = 35.6586 + latOffset; // Default reference latitude
            const longitude = 139.7454 + lonOffset; // Default reference longitude
            location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
        }

        // Fetch metadata if assetId exists
        if (obj.assetId) {
          try {
            const data = await getModel(obj.assetId);
            metadata = data.asset?.metadata;
          } catch (error) {
            logger.error("Error fetching metadata:", error);
          }
        }

        // Determine coordinate system for display
        const coordinateSystem =
          obj.coordinateSystem ||
          (obj.position && obj.position.length === 3
            ? obj.position[0] >= -180 &&
              obj.position[0] <= 180 &&
              obj.position[1] >= -90 &&
              obj.position[1] <= 90 &&
              Math.abs(obj.position[2]) < 50000
              ? "geographic"
              : "local"
            : "unknown");

        reportWindow.document.write(`
          <tr>
            <td>${obj.name || "Untitled"}</td>
            <td>${obj.type || "Unknown"}</td>
            <td>${position}</td>
            <td>${location}</td>
            <td>${coordinateSystem}</td>
            <td>
              ${obj.description || ""}
              ${
                metadata
                  ? `
                <div class="metadata-section">
                  <h4>Model Metadata</h4>
                  ${Object.entries(metadata)
                    .map(
                      ([key, value]) => `
                    <div class="metadata-item">
                      <span class="metadata-label">${key}:</span> ${value}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </td>
          </tr>
        `);
      }

      // Close the table and add the map section
      reportWindow.document.write(`
          </table>

          <h2>Model Locations</h2>
          <div id="map" class="map-container"></div>

          <script>
            // Create model type distribution chart
            const modelTypes = ${JSON.stringify(
              Object.entries(
                objects.reduce((acc, obj) => {
                  const type = obj.type || "Unknown";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {})
              )
            )};

            const ctx = document.getElementById('modelTypeChart').getContext('2d');
            new Chart(ctx, {
              type: 'pie',
              data: {
                labels: modelTypes.map(([type]) => type),
                datasets: [{
                  data: modelTypes.map(([, count]) => count),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                  ]
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: 'Model Type Distribution'
                  }
                }
              }
            });

            // Initialize map
            const mapPoints = ${JSON.stringify(
              objects
                .filter(
                  (obj) =>
                    obj.position &&
                    obj.type !== "tiles" &&
                    obj.position.length === 3
                )
                .map((obj) => {
                  const [x, y, z] = obj.position;

                  // Use coordinate system metadata if available, otherwise detect
                  const isGeographic =
                    obj.coordinateSystem === "geographic" ||
                    (x >= -180 &&
                      x <= 180 &&
                      y >= -90 &&
                      y <= 90 &&
                      Math.abs(z) < 50000);

                  let longitude, latitude;

                  if (isGeographic) {
                    // Already in geographic format (longitude, latitude, height)
                    longitude = x;
                    latitude = y;
                  } else {
                    // Convert from local coordinates to geographic
                    // This is a simplified conversion - in production you'd want to use proper geodetic conversion
                    const earthRadius = 6378137.0;
                    const latOffset = (x / earthRadius) * (180 / Math.PI);
                    const lonOffset =
                      (z / (earthRadius * Math.cos((35 * Math.PI) / 180))) *
                      (180 / Math.PI);
                    latitude = 35.6586 + latOffset; // Default reference latitude
                    longitude = 139.7454 + lonOffset; // Default reference longitude
                  }

                  return {
                    coords: [longitude, latitude],
                    title: obj.name || "Untitled Model",
                    description: obj.description || "",
                    type: "model",
                    coordinateSystem:
                      obj.coordinateSystem ||
                      (isGeographic ? "geographic" : "local"),
                  };
                })
            )};

            if (mapPoints.length > 0) {
              const map = new ol.Map({
                target: 'map',
                layers: [
                  new ol.layer.Tile({
                    source: new ol.source.OSM()
                  })
                ],
                view: new ol.View({
                  center: ol.proj.fromLonLat([mapPoints[0].coords[0], mapPoints[0].coords[1]]),
                  zoom: 10,
                  projection: 'EPSG:3857'
                })
              });

              const vectorSource = new ol.source.Vector();
              const features = mapPoints.map(point => {
                const feature = new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat(point.coords))
                });

                const popupContent = \`
                  <div class="ol-popup">
                    <h3>\${point.title}</h3>
                    <p>\${point.description}</p>
                  </div>
                \`;

                feature.set('popupContent', popupContent);
                feature.set('id', point.title);
                vectorSource.addFeature(feature);
                return feature;
              });

              const vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                  image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({ color: 'blue' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                  })
                })
              });

              map.addLayer(vectorLayer);

              const popup = new ol.Overlay({
                element: document.createElement('div'),
                positioning: 'bottom-center',
                stopEvent: false
              });
              map.addOverlay(popup);

              map.on('click', function(evt) {
                const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                  return feature;
                });

                if (feature) {
                  const coordinates = feature.getGeometry().getCoordinates();
                  popup.setPosition(coordinates);
                  popup.getElement().innerHTML = feature.get('popupContent');
                } else {
                  popup.setPosition(undefined);
                }
              });

              const extent = vectorSource.getExtent();
              map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                maxZoom: 18,
                duration: 1000
              });
            }
          </script>
        </body>
      </html>
      `);

      reportWindow.document.close();
    } catch (error) {
      logger.error("Error generating report:", error);
      showToast("Error generating report");
    }
  };

  return (
    <ActionButton
      icon={<DescriptionIcon />}
      label="Report"
      onClick={generateReport}
      disabled={disabled}
    />
  );
};

export default ReportGenerator;
