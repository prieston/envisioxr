#!/usr/bin/env node

/**
 * Copy Cesium Ion SDK packages from public folder to node_modules
 * This allows us to use proper ES6 imports instead of manual script loading
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../public/cesium-ion-sdk');
const targetDir = path.join(__dirname, '../node_modules/@cesiumgs');

// Ion SDK packages to copy
const packages = [
  'ion-sdk-sensors',
  'ion-sdk-measurements', 
  'ion-sdk-geometry'
];

async function copyIonSDK() {
  try {
    console.log('🔄 Copying Cesium Ion SDK packages to node_modules...');
    
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    
    for (const packageName of packages) {
      const sourcePath = path.join(sourceDir, packageName);
      const targetPath = path.join(targetDir, packageName);
      
      if (await fs.pathExists(sourcePath)) {
        // Remove existing package if it exists
        if (await fs.pathExists(targetPath)) {
          await fs.remove(targetPath);
        }
        
        // Copy the package
        await fs.copy(sourcePath, targetPath);
        console.log(`✅ Copied ${packageName} to node_modules`);
      } else {
        console.warn(`⚠️  Source package ${packageName} not found in public folder`);
      }
    }
    
    console.log('🎉 Ion SDK packages copied successfully!');
    console.log('📦 You can now use proper ES6 imports:');
    console.log('   import { ConicSensor, RectangularSensor } from "@cesiumgs/ion-sdk-sensors"');
    console.log('   import { TransformEditor, MeasureUnits } from "@cesiumgs/ion-sdk-measurements"');
    console.log('   import { initializeGeometry } from "@cesiumgs/ion-sdk-geometry"');
    
  } catch (error) {
    console.error('❌ Error copying Ion SDK packages:', error);
    process.exit(1);
  }
}

// Run the copy function
copyIonSDK();
