import path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cesiumSource = path.join(__dirname, '../node_modules/cesium/Build/Cesium');
const cesiumDest = path.join(__dirname, '../public/cesium');

const folders = ['Workers', 'Assets', 'ThirdParty', 'Widgets'];

console.log('Starting Cesium assets copy...');
console.log('Source:', cesiumSource);
console.log('Destination:', cesiumDest);

// Ensure destination directory exists
fse.ensureDirSync(cesiumDest);

folders.forEach(folder => {
  const sourcePath = path.join(cesiumSource, folder);
  const destPath = path.join(cesiumDest, folder);

  try {
    if (fse.existsSync(sourcePath)) {
      fse.copySync(sourcePath, destPath, { overwrite: true });
      console.log(`✓ Copied ${folder} to public/cesium/${folder}`);
    } else {
      console.warn(`⚠ Source folder not found: ${sourcePath}`);
    }
  } catch (error) {
    console.error(`✗ Error copying ${folder}:`, error.message);
  }
});

console.log('Cesium assets copy completed!');

