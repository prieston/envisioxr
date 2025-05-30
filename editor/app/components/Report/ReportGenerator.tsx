import React from "react";
import { showToast } from "@/app/utils/toastUtils";
import useSceneStore from "@/app/hooks/useSceneStore";
import * as THREE from "three";
import { localToGeographic } from "@/app/utils/coordinateUtils";
import { MinimalButton } from "../AppBar/StyledComponents";
import { Description as DescriptionIcon } from "@mui/icons-material";
import { Typography } from "@mui/material";

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
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
            .action-button:hover {
              background-color: #0056b3;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
            }
            .stat-label {
              color: #666;
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
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .map-container {
              width: 100%;
              height: 500px;
              margin: 20px 0;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .metadata-section {
              margin-top: 10px;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            .metadata-section h4 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .metadata-item {
              margin: 5px 0;
              padding: 5px;
              border-bottom: 1px solid #eee;
            }
            .metadata-label {
              font-weight: bold;
              color: #555;
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
              <th>Description</th>
            </tr>
      `);

      // Add each object to the table
      for (const obj of objects) {
        const position = obj.position ? `(${obj.position.join(", ")})` : "N/A";
        let location = "N/A";
        let metadata = null;

        if (obj.position && tilesRenderer) {
          const coords = localToGeographic(
            tilesRenderer,
            new THREE.Vector3(...obj.position)
          );
          location = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        }

        // Fetch metadata if assetId exists
        if (obj.assetId) {
          try {
            const response = await fetch(`/api/models/${obj.assetId}`);
            const data = await response.json();
            metadata = data.asset?.metadata;
          } catch (error) {
            console.error("Error fetching metadata:", error);
          }
        }

        reportWindow.document.write(`
          <tr>
            <td>${obj.name || "Untitled"}</td>
            <td>${obj.type || "Unknown"}</td>
            <td>${position}</td>
            <td>${location}</td>
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
                .filter((obj) => obj.position && obj.type !== "tiles")
                .map((obj) => {
                  const coords = localToGeographic(
                    tilesRenderer,
                    new THREE.Vector3(...obj.position)
                  );
                  return {
                    coords: [coords.longitude, coords.latitude],
                    title: obj.name || "Untitled Model",
                    description: obj.description || "",
                    type: "model",
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
      console.error("Error generating report:", error);
      showToast("Error generating report");
    }
  };

  return (
    <MinimalButton onClick={generateReport} disabled={disabled}>
      <DescriptionIcon />
      <Typography variant="caption">Report</Typography>
    </MinimalButton>
  );
};

export default ReportGenerator;
