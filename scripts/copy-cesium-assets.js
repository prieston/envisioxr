const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const cesiumSource = path.join(__dirname, '../node_modules/cesium/Build/Cesium');
const cesiumDest = path.join(__dirname, '../public/cesium');

const folders = ['Workers', 'Assets', 'ThirdParty', 'Widgets'];

folders.forEach(folder => {
  fse.copySync(path.join(cesiumSource, folder), path.join(cesiumDest, folder));
  console.log(`Copied ${folder} to public/cesium/${folder}`);
});