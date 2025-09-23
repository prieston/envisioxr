/*eslint-env node*/

import {
  writeFileSync,
  copyFileSync,
  readFileSync,
  existsSync,
  createReadStream,
} from "fs";
import { readFile, writeFile } from "fs/promises";
import { join, basename, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { exec, execSync } from "child_process";
import { createRequire } from "module";
import showdown from "showdown";
import { createInterface } from "readline";
import { finished } from "stream/promises";

import gulp from "gulp";
import gulpTap from "gulp-tap";
import gulpZip from "gulp-zip";
import gulpRename from "gulp-rename";
import { globby } from "globby";
import open from "open";
import { rimraf } from "rimraf";
import { mkdirp } from "mkdirp";
import karma from "karma";
import yargs from "yargs";
import { build as esbuild } from "esbuild";
import { createInstrumenter } from "istanbul-lib-instrument";

import {
  glslToJavaScript,
  createCombinedSpecList,
  createJsHintOptions,
  createGalleryList,
  buildWorkspace,
  bundleCombinedSpecs,
  globalCesiumResolvePlugin,
} from "./scripts/build.js";

// Determines the scope of the workspace packages. If the scope is set to cesium, the workspaces should be @cesium/engine.
// This should match the scope of the dependencies of the root level package.json.
const scope = "cesiumgs";

const require = createRequire(import.meta.url);

const packageJson = require("./package.json");
let ionSdkVersion = packageJson.version;
if (/\.0$/.test(ionSdkVersion)) {
  // trim off trailing ".0"
  ionSdkVersion = ionSdkVersion.substring(0, ionSdkVersion.length - 2);
}

const ossPackageJson = require("./cesium/package.json");
let ossVersion = ossPackageJson.version;
if (/\.0$/.test(ossVersion)) {
  // trim off trailing ".0"
  ossVersion = ossVersion.substring(0, ossVersion.length - 2);
}

const geometryVersion =
  require("./packages/ion-sdk-geometry/package.json").version;
const measurementsVersion =
  require("./packages/ion-sdk-measurements/package.json").version;
const sensorsVersion =
  require("./packages/ion-sdk-sensors/package.json").version;

showdown.setFlavor("github");

const karmaConfigFile = resolve("./Specs/karma.conf.cjs");

//Gulp doesn't seem to have a way to get the currently running tasks for setting
//per-task variables.  We use the command line argument here to detect which task is being run.
const taskName = process.argv[2];
const noDevelopmentGallery =
  taskName === "release" ||
  taskName === "makeZip" ||
  taskName === "websiteRelease";
const argv = yargs(process.argv)
  .options({
    verbose: { type: "boolean", default: false },
    workspace: { type: "string" },
    buildVersion: { type: "string" },
    status: { type: "string" },
    message: { type: "string" },
    browsers: { type: "string" }, // comma separated list
    webglValidation: { type: "boolean", default: false },
    webglStub: { type: "boolean", default: false },
    release: { type: "boolean", default: false },
    failTaskOnError: { type: "boolean", default: false },
    suppressPassed: { type: "boolean", default: false },
    open: { type: "boolean", default: true }, // use --no-open to negate this
    all: { type: "boolean", default: false },
    debug: { type: "boolean", default: false },
    include: { type: "string" },
    exclude: { type: "string" },
    production: { type: "boolean", default: false },
    debugCanvasWidth: { type: "number" },
    debugCanvasHeight: { type: "number" },
    includeName: { type: "string" },
    minify: { type: "boolean" },
    removePragmas: { type: "boolean" },
    sourcemap: { type: "boolean" },
    node: { type: "boolean" },
    private: { type: "boolean", default: false },
  })
  .parseSync();
const verbose = argv.verbose;

export async function build() {
  // Configure build options from command line arguments.
  const minify = argv.minify ?? false;
  const removePragmas = argv.removePragmas ?? false;
  const sourcemap = argv.sourcemap ?? true;
  const node = argv.node ?? true;

  const buildOptions = {
    development: !noDevelopmentGallery,
    iife: true,
    minify: minify,
    removePragmas: removePragmas,
    sourcemap: sourcemap,
    node: node,
    write: undefined,
  };

  const workspace = argv.workspace ?? undefined;
  const buildAll = !workspace;

  if (buildAll || workspace === `@${scope}/ion-sdk-measurements`) {
    await buildWorkspace("ion-sdk-measurements", {
      ...buildOptions,
    });
  }
  if (buildAll || workspace === `@${scope}/ion-sdk-sensors`) {
    await buildWorkspace("ion-sdk-sensors", {
      ...buildOptions,
      buildShaders: true,
    });
  }
  if (buildAll || workspace === `@${scope}/ion-sdk-geometry`) {
    await buildWorkspace("ion-sdk-geometry", {
      ...buildOptions,
      buildWorkers: true,
    });
  }
  if (buildAll) {
    await Promise.all([
      createJsHintOptions(),
      createGalleryList(!buildOptions.development),
    ]);
  }

  // Create SpecList.js
  await createCombinedSpecList();

  // Generate Specs bundle.
  await bundleCombinedSpecs({
    incremental: false,
    write: true,
  });
}
export default build;

export const buildWatch = gulp.series(build, async function () {
  const minify = argv.minify ?? false;
  const removePragmas = argv.removePragmas ?? false;
  const sourcemap = argv.sourcemap ?? true;

  const outputDirectory = join("Build", `Cesium${!minify ? "Unminified" : ""}`);

  const buildOptions = {
    minify: minify,
    outputDirectory: outputDirectory,
    removePragmas: removePragmas,
    sourcemap: sourcemap,
    incremental: true,
  };

  const widgets = await buildWorkspace("ion-sdk-measurements", {
    ...buildOptions,
  });
  const sensors = await buildWorkspace("ion-sdk-sensors", {
    ...buildOptions,
    buildShaders: true,
  });
  const geometry = await buildWorkspace("ion-sdk-geometry", {
    ...buildOptions,
    buildWorkers: true,
  });

  await createCombinedSpecList();
  const specs = await bundleCombinedSpecs({ incremental: true });

  const sensorsShaderFiles = [
    "packages/ion-sdk-sensors/Source/Shaders/**/*.glsl",
  ];
  gulp.watch(sensorsShaderFiles, async function rebuildSensorsShaders() {
    await glslToJavaScript(
      minify,
      "Build/minifyShaders.state",
      "ion-sdk-sensors",
    );
    await sensors.esm?.rebuild();
    await sensors.iife?.rebuild();
    await sensors.node?.rebuild();
  });

  const widgetsSourceFiles = [
    "packages/ion-sdk-measurements/Source/**/*.js",
    "!packages/ion-sdk-measurements/Source/*.js",
  ];
  const sensorsSourceFiles = [
    "packages/ion-sdk-sensors/Source/**/*.js",
    "!packages/ion-sdk-sensors/Source/*.js",
    "!packages/ion-sdk-sensors/Source/Shaders/**",
  ];
  const geometrySourceFiles = [
    "packages/ion-sdk-geometry/Source/**/*.js",
    "!packages/ion-sdk-geometry/Source/*.js",
    "!packages/ion-sdk-geometry/Source/Workers/**",
  ];

  gulp.watch(widgetsSourceFiles, async function rebuildWidgets() {
    createJsHintOptions();
    await widgets.esm?.rebuild();
    await widgets.iife?.rebuild();
    await widgets.node?.rebuild();
  });
  gulp.watch(sensorsSourceFiles, async function rebuildSensors() {
    createJsHintOptions();
    await sensors.esm?.rebuild();
    await sensors.iife?.rebuild();
    await sensors.node?.rebuild();
  });
  gulp.watch(geometrySourceFiles, async function rebuildGeometry() {
    createJsHintOptions();
    await geometry.esm?.rebuild();
    await geometry.iife?.rebuild();
    await geometry.node?.rebuild();
    await geometry.workerContext?.rebuild();
  });

  const watchedSpecFiles = [
    "packages/ion-sdk-measurements/Specs/**/*Spec.js",
    "!packages/ion-sdk-measurements/Specs/SpecList.js",
    "packages/ion-sdk-sensors/Specs/**/*Spec.js",
    "!packages/ion-sdk-sensors/Specs/SpecList.js",
    "packages/ion-sdk-geometry/Specs/**/*Spec.js",
    "!packages/ion-sdk-geometry/Specs/SpecList.js",
    "Specs/*.js",
    "!Specs/SpecList.js",
  ];

  gulp.watch(
    watchedSpecFiles,
    {
      events: ["add", "unlink"],
    },
    async function rebuildCombinedSpecs() {
      createCombinedSpecList();
      await specs.rebuild();
    },
  );

  gulp.watch(
    watchedSpecFiles,
    {
      events: ["change"],
    },
    async function rebuildSpecs() {
      await specs.rebuild();
    },
  );

  process.on("SIGINT", () => {
    // Free up resources
    widgets.esm.dispose();
    widgets.iife?.dispose();
    widgets.node?.dispose();

    sensors.esm.dispose();
    sensors.iife?.dispose();
    sensors.node?.dispose();

    geometry.esm.dispose();
    geometry.iife?.dispose();
    geometry.node?.dispose();
    geometry.workerContext?.dispose();

    specs.dispose();
    process.exit(0);
  });
});

export async function buildTs() {
  const workspaces = argv.workspace ? [argv.workspace] : packageJson.workspaces;

  const engineTypesSource = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "cesium/packages/engine/index.d.ts",
    ),
  ).toString();
  const widgetsTypesSource = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "cesium/packages/widgets/index.d.ts",
    ),
  ).toString();

  const regex = /^export[ const ]*(function|class|namespace|enum) (.+)/gm;
  let matches;
  const engineModules = new Set();
  while ((matches = regex.exec(engineTypesSource))) {
    const moduleName = matches[2].match(/([^<\s|\(]+)/);
    engineModules.add(moduleName[1]);
  }
  const widgetsModules = new Set();
  while ((matches = regex.exec(widgetsTypesSource))) {
    const moduleName = matches[2].match(/([^<\s|\(]+)/);
    widgetsModules.add(moduleName[1]);
  }

  // Generate types for passed packages in order.
  /** @type {Object<string, Set<string>>} */
  const importModules = {
    "@cesium/engine": engineModules,
    "@cesium/widgets": widgetsModules,
  };
  for (const workspace of workspaces) {
    const directory = workspace
      .replace(`@${scope}/`, "")
      .replace(`packages/`, "");
    const workspaceExports = await generateTypeScriptForWorkspace(
      directory,
      `packages/${directory}/index.d.ts`,
      `packages/${directory}/tsd-conf.json`,
      undefined,
      undefined,
      importModules,
    );
    importModules[`@${scope}/${directory}`] = workspaceExports;
  }
}

export async function clean() {
  const filesToClean = [
    "Build",
    "Source/Cesium.js",
    "Source/Shaders/**/*.js",
    "Source/ThirdParty/Shaders/*.js",
    "Source/**/*.d.ts",
    "Specs/SpecList.js",
    "Specs/jasmine/**",
    "Apps/Sandcastle/jsHintOptions.js",
    "Apps/Sandcastle/gallery/gallery-index.js",
    "Apps/Sandcastle/templates/bucket.css",
    "Cesium-*.zip",
    "cesium-*.tgz",
    "packages/**/*.tgz",
    "packages/*/Build",
  ];
  const files = await globby(filesToClean);
  return Promise.all(files.map((file) => rimraf(file)));
}

export async function prepare() {
  // Copy prism.js and prism.css files into Tools
  copyFileSync(
    "node_modules/prismjs/prism.js",
    "Tools/jsdoc/cesium_template/static/javascript/prism.js",
  );
  copyFileSync(
    "node_modules/prismjs/themes/prism.min.css",
    "Tools/jsdoc/cesium_template/static/styles/prism.css",
  );

  // Copy jasmine runner files into Specs
  const files = await globby([
    "node_modules/jasmine-core/lib/jasmine-core",
    "!node_modules/jasmine-core/lib/jasmine-core/example",
  ]);

  const stream = gulp.src(files).pipe(gulp.dest("Specs/jasmine"));
  await finished(stream);
  return stream;
}

export const cloc = gulp.series(clean, async function clocSource() {
  let cmdLine;

  //Run cloc on primary Source files only
  const source = new Promise(function (resolve, reject) {
    cmdLine =
      "npx cloc" +
      " --quiet --progress-rate=0" +
      " packages/ion-sdk-measurements/Source packages/ion-sdk-sensors/Source packages/ion-sdk-geometry/Source --exclude-dir=Assets,ThirdParty,Workers";

    exec(cmdLine, function (error, stdout, stderr) {
      if (error) {
        console.log(stderr);
        return reject(error);
      }
      console.log("Source:");
      console.log(stdout);
      resolve(undefined);
    });
  });

  //If running cloc on source succeeded, also run it on the tests.
  await source;
  return new Promise(function (resolve, reject) {
    cmdLine =
      "npx cloc" +
      " --quiet --progress-rate=0" +
      " Specs/ packages/ion-sdk-measurements/Specs packages/ion-sdk-sensors/Specs packages/ion-sdk-geometry/Specs --exclude-dir=Data --not-match-f=SpecList.js --not-match-f=.eslintrc.json";
    exec(cmdLine, function (error, stdout, stderr) {
      if (error) {
        console.log(stderr);
        return reject(error);
      }
      console.log("Specs:");
      console.log(stdout);
      resolve(undefined);
    });
  });
});

//Builds the documentation
export async function buildDocs() {
  const generatePrivateDocumentation = argv.private ? "--private" : "";

  execSync(
    `npx jsdoc --configure Tools/jsdoc/conf.json --pedantic ${generatePrivateDocumentation}`,
    {
      stdio: "inherit",
      env: Object.assign({}, process.env, {
        CESIUM_VERSION: ossVersion,
        CESIUM_PACKAGES: [
          packageJson.workspaces,
          "cesium/packages/engine",
          "cesium/packages/widgets",
        ],
      }),
    },
  );

  const stream = gulp
    .src(["Documentation/Images/**"], { encoding: false })
    .pipe(gulp.dest("Build/Documentation/Images"));

  await finished(stream);
  return stream;
}

export async function buildDocsWatch() {
  await buildDocs();
  console.log("Listening for changes in documentation...");
  const watchedSourceFiles = [
    "packages/*/Source/**/*.js",
    "!packages/*/Source/*.js",
    "!packages/*/Source/Shaders/**",
    "!packages/*/Source/Workers/**",
  ];
  return gulp.watch(
    [...watchedSourceFiles, "Tools/jsdoc/conf.json"],
    buildDocs,
  );
}

export const buildRelease = gulp.series(
  async function buildReleaseUnminified() {
    const buildOptions = {
      minify: false,
      removePragmas: false,
      node: true,
      sourcemap: false,
    };
    await buildWorkspace("ion-sdk-measurements", {
      ...buildOptions,
    });
    await buildWorkspace("ion-sdk-sensors", {
      ...buildOptions,
      buildShaders: true,
    });
    await buildWorkspace("ion-sdk-geometry", {
      ...buildOptions,
      buildWorkers: true,
    });
  },
  async function buildReleaseMinified() {
    const buildOptions = {
      development: false,
      minify: true,
      removePragmas: true,
      node: true,
      sourcemap: false,
    };
    await buildWorkspace("ion-sdk-measurements", {
      ...buildOptions,
    });
    await buildWorkspace("ion-sdk-sensors", {
      ...buildOptions,
      buildShaders: true,
    });
    await buildWorkspace("ion-sdk-geometry", {
      ...buildOptions,
      buildWorkers: true,
    });
  },
  async function createSpecList() {
    await createCombinedSpecList();
    await bundleCombinedSpecs({
      incremental: false,
      write: true,
    });
  },
);

export const release = gulp.series(
  buildRelease,
  gulp.parallel(buildTs, buildDocs, async function buildSandcastleAssets() {
    await Promise.all([createJsHintOptions(), createGalleryList(true)]);
  }),
);

/**
 * Run as part of CI after the `npm version` command bumps the version to a specific git build
 * Sets the dependency of top level package and other workspaces to match this specific build's version
 */
export const postversion = async function () {
  const workspace = argv.workspace;
  if (!workspace) {
    return;
  }
  const directory = workspace.replaceAll(`@${scope}/`, ``);
  const workspacePackageJson = require(`./packages/${directory}/package.json`);
  const version = workspacePackageJson.version;

  // Iterate through all package JSONs that may depend on the updated package and
  // update the version of the updated workspace.
  const packageJsonFiles = await globby([
    "./package.json",
    "./packages/*/package.json",
  ]);
  const promises = packageJsonFiles.map(async (packageJsonPath) => {
    // Ensure that we don't check the updated workspace itself.
    if (basename(dirname(packageJsonPath)) === directory) {
      return;
    }
    // Ensure that we only update workspaces where the dependency to the updated workspace already exists.
    const packageJson = require(packageJsonPath);
    if (!packageJson.dependencies) {
      // some of our packages don't have any direct dependencies
      return;
    }
    if (!Object.hasOwn(packageJson.dependencies, workspace)) {
      console.log(
        `Skipping update for ${workspace} as it is not a dependency.`,
      );
      return;
    }
    // Update the version for the updated workspace.
    packageJson.dependencies[workspace] = `^${version}`;
    await writeFile(packageJsonPath, JSON.stringify(packageJson, undefined, 2));
  });
  return Promise.all(promises);
};

/**
 * Removes scripts from package.json files to ensure that
 * they still work when run from within the ZIP file.
 *
 * @param {string} packageJsonPath The path to the package.json.
 * @returns A stream that writes to the updated package.json file.
 */
async function pruneScriptsForZip(packageJsonPath) {
  // Read the contents of the file.
  const contents = await readFile(packageJsonPath);
  const contentsJson = JSON.parse(contents);

  const scripts = contentsJson.scripts;

  // Remove prepare step from package.json to avoid running "prepare" an extra time.
  delete scripts["prepare"];

  // Remove build and transform tasks since they do not function as intended from within the release zip
  delete scripts["build"];
  delete scripts["build-release"];
  delete scripts["build-watch"];
  delete scripts["build-ts"];
  delete scripts["build-third-party"];
  delete scripts["clean"];
  delete scripts["cloc"];
  delete scripts["build-docs"];
  delete scripts["build-docs-watch"];
  delete scripts["make-zip"];
  delete scripts["release"];
  delete scripts["prepare-download"];
  delete scripts["prettier"];

  // Remove deploy tasks
  delete scripts["deploy-set-version"];

  // Set server tasks to use production flag
  scripts["start"] = "node server.js --production";
  scripts["start-public"] = "node server.js --public --production";
  scripts["start-public"] = "node server.js --public --production";
  scripts["test"] = "gulp test --production";
  scripts["test-all"] = "gulp test --all --production";
  scripts["test-webgl"] = "gulp test --include WebGL --production";
  scripts["test-non-webgl"] = "gulp test --exclude WebGL --production";
  scripts["test-webgl-validation"] = "gulp test --webglValidation --production";
  scripts["test-webgl-stub"] = "gulp test --webglStub --production";
  scripts["test-release"] = "gulp test --release --production";

  // Write to a temporary package.json file.
  const noPreparePackageJson = join(
    dirname(packageJsonPath),
    "package.noprepare.json",
  );
  await writeFile(noPreparePackageJson, JSON.stringify(contentsJson, null, 2));

  return gulp.src(noPreparePackageJson, {
    base: ".",
  });
}

export const makeZip = gulp.series(release, async function makeZipTask() {
  //For now we regenerate the JS glsl to force it to be unminified in the release zip
  //See https://github.com/CesiumGS/cesium/pull/3106#discussion_r42793558 for discussion.
  await glslToJavaScript(false, "Build/minifyShaders.state", "ion-sdk-sensors");

  const packageJsonSrc = await pruneScriptsForZip("package.json");

  const packageFiles = [];
  for (const workspace of packageJson.workspaces) {
    const packageJson = require(`./${workspace}/package.json`);
    const files = packageJson.files.map((pattern) => {
      if (pattern.startsWith("!")) {
        return `!${join(workspace, pattern.replace("!", ""))}`;
      }
      return join(workspace, pattern);
    });
    packageFiles.push(...files);
  }

  const geometryPackageSource = await pruneScriptsForZip(
    "packages/ion-sdk-geometry/package.json",
  );
  const measurementsPackageSource = await pruneScriptsForZip(
    "packages/ion-sdk-measurements/package.json",
  );
  const sensorsPackageSource = await pruneScriptsForZip(
    "packages/ion-sdk-sensors/package.json",
  );

  const src = gulp
    .src("index.release.html")
    .pipe(
      gulpRename((file) => {
        if (file.basename === "index.release") {
          file.basename = "index";
        }
      }),
    )
    .pipe(packageJsonSrc)
    .pipe(geometryPackageSource)
    .pipe(measurementsPackageSource)
    .pipe(sensorsPackageSource)
    .pipe(
      gulpRename((file) => {
        if (file.basename === "package.noprepare") {
          file.basename = "package";
        }
      }),
    )
    .pipe(
      gulp.src(
        [
          "Build/Documentation/**",
          "Build/Specs/**",
          "!Build/Specs/e2e/**",
          "!Build/InlineWorkers.js",
          // measurements
          "packages/ion-sdk-measurements/Build/**",
          "!packages/ion-sdk-measurements/Build/Specs/**",
          "!packages/ion-sdk-measurements/Build/package.noprepare.json",
          // sensors
          "packages/ion-sdk-sensors/Build/**",
          "!packages/ion-sdk-sensors/Build/Specs/**",
          "!packages/ion-sdk-sensors/Build/minifyShaders.state",
          "!packages/ion-sdk-sensors/Build/package.noprepare.json",
          // geometry
          "packages/ion-sdk-geometry/Build/**",
          "!packages/ion-sdk-geometry/Build/Specs/**",
          "!packages/ion-sdk-geometry/Build/package.noprepare.json",
        ],
        {
          encoding: false,
          base: ".",
        },
      ),
    )
    .pipe(
      gulp.src(
        [
          "Apps/**",
          "Apps/**/.eslintrc.json",
          "Apps/Sandcastle/.jshintrc",
          "!Apps/Sandcastle/gallery/development/**",
          ...packageFiles,
          "Specs/**",
          "!Specs/e2e/*-snapshots/**",
          "Specs/**/.eslintrc.json",
          "cesium/Build/**",
          "cesium/Apps/Sandcastle/gallery/**",
          "!cesium/Apps/Sandcastle/gallery/development/**",
          "cesium/Apps/SampleData/**",
          "cesium/ThirdParty/**",
          "cesium/Specs/Data/**",
          "favicon.ico",
          ".eslintignore",
          ".eslintrc.json",
          ".prettierignore",
          "scripts/**",
          "gulpfile.js",
          "server.js",
          "copyrightHeader.js",
          "sla-cesium-ion-components.pdf",
          "CHANGES.md",
          "README.md",
          "web.config",
          "!Cesium-*.zip",
        ],
        {
          encoding: false,
          base: ".",
          allowEmpty: true,
        },
      ),
    )
    .pipe(
      gulpTap(function (file) {
        // Work around an issue with gulp-zip where archives generated on Windows do
        // not properly have their directory executable mode set.
        // see https://github.com/sindresorhus/gulp-zip/issues/64#issuecomment-205324031
        if (file.isDirectory()) {
          file.stat.mode = parseInt("40777", 8);
        }
      }),
    )
    .pipe(gulpZip(`Cesium-ion-SDK-${ionSdkVersion}.zip`))
    .pipe(gulp.dest("."));

  await finished(src);

  const noprepareFiles = await globby([
    "./**/package.noprepare.json",
    "!node_modules/**/package.noprepare.json",
  ]);
  for (const file of noprepareFiles) {
    rimraf.sync(file);
  }

  return src;
});

export async function prepareDownload() {
  const zipName = `Cesium-ion-SDK-${ionSdkVersion}.zip`;
  const releaseDir = join("Build", "s3_deploy");
  mkdirp.sync(releaseDir);
  copyFileSync(zipName, join(releaseDir, zipName));

  const packedGeometry = `cesiumgs-ion-sdk-geometry-${geometryVersion}.tgz`;
  copyFileSync(packedGeometry, join(releaseDir, packedGeometry));
  const packedMeasurements = `cesiumgs-ion-sdk-measurements-${measurementsVersion}.tgz`;
  copyFileSync(packedMeasurements, join(releaseDir, packedMeasurements));
  const packedSensors = `cesiumgs-ion-sdk-sensors-${sensorsVersion}.tgz`;
  copyFileSync(packedSensors, join(releaseDir, packedSensors));

  const stream = createReadStream(resolve("./CHANGES.md"));
  const lineReader = createInterface({
    input: stream,
  });

  const markdownVersionRegEx = new RegExp("## (.+) - (.+)");
  const readMarkdown = new Promise((resolve) => {
    let inBlock = false;
    let markdown = "";
    lineReader.on("line", (line) => {
      const res = line.match(markdownVersionRegEx);
      if (res) {
        if (inBlock) {
          lineReader.removeAllListeners("line");
          lineReader.close();
          inBlock = false;
        } else if (res[1] === ionSdkVersion) {
          inBlock = true;
        }

        return;
      }

      if (inBlock) {
        markdown += `${line}\n`;
      }
    });

    lineReader.on("close", () => {
      resolve(markdown);
    });
  });
  const releaseNotes = await readMarkdown;

  if (releaseNotes.length === 0) {
    return Promise.reject(new Error("Release notes could not be found"));
  }

  const converter = new showdown.Converter();

  const result = {
    version: ionSdkVersion,
    download: zipName,
    extraDownloads: [packedGeometry, packedMeasurements, packedSensors],
    releaseNotes: converter.makeHtml(releaseNotes),
  };

  writeFileSync(join(releaseDir, "current.json"), JSON.stringify(result));
}

export async function deploySetVersion() {
  const buildVersion = argv.buildVersion;
  if (buildVersion) {
    // NPM versions can only contain alphanumeric and hyphen characters
    packageJson.version += `-${buildVersion.replace(/[^[0-9A-Za-z-]/g, "")}`;
    return writeFile("package.json", JSON.stringify(packageJson, undefined, 2));
  }
}

/**
 * Generates a coverage report for a workspace
 *
 * @param {String} workspace The name of the workspace
 * @param {Object} options An object with the following properties:
 * @param {Boolean} [options.webglStub=false] True if WebGL stub should be used when running tests.
 * @param {Boolean} [options.suppressPassed=false] True if output should be suppressed for tests that pass.
 * @param {Boolean} [options.failTaskOnError=false] True if the gulp task should fail on errors in the tests.
 * @param {boolean} [options.openAfter=true] whether to open the results page after running tests
 */
async function runWorkspaceCoverage(workspace, options) {
  const filter = new RegExp(
    `packages(\\\\|\/)${workspace}(\\\\|\/)Source((\\\\|\/)\\w+)+\\.js$`,
  );
  return runCoverage({
    outputDirectory: `packages/${workspace}/Build/Instrumented`,
    coverageDirectory: `packages/${workspace}/Build/Coverage`,
    specList: `packages/${workspace}/Specs/SpecList.js`,
    filter: filter,
    webglStub: options.webglStub,
    suppressPassed: options.suppressPassed,
    failTaskOnError: options.failTaskOnError,
    openAfter: options.openAfter,
  });
}

/**
 * Generates coverage report.
 *
 * @param {object} options An object with the following properties:
 * @param {string} options.outputDirectory The output directory for the generated build artifacts.
 * @param {string} options.coverageDirectory The path where the coverage reports should be saved to.
 * @param {string} options.specList The path to the spec list for the package.
 * @param {RegExp} options.filter The filter for finding which files should be instrumented.
 * @param {boolean} [options.webglStub=false] True if WebGL stub should be used when running tests.
 * @param {boolean} [options.suppressPassed=false] True if output should be suppressed for tests that pass.
 * @param {boolean} [options.failTaskOnError=false] True if the gulp task should fail on errors in the tests.
 * @param {boolean} [options.openAfter=true] whether to open the results page after running tests
 */
async function runCoverage(options) {
  const webglStub = options.webglStub ?? false;
  const suppressPassed = options.suppressPassed ?? false;
  const failTaskOnError = options.failTaskOnError ?? false;
  const openAfter = options.openAfter ?? true;
  const singleRun = argv.debug ? false : true;

  const folders = [];
  let browsers = ["Chrome"];
  if (argv.browsers) {
    browsers = argv.browsers.split(",");
  }

  const instrumenter = createInstrumenter({
    esModules: true,
  });

  // Setup plugin to use instrumenter on source files.

  const instrumentPlugin = {
    name: "instrument",
    setup: (build) => {
      build.onLoad(
        {
          filter: options.filter,
        },
        async (args) => {
          const source = await readFile(args.path, { encoding: "utf8" });
          try {
            const generatedCode = instrumenter.instrumentSync(
              source,
              args.path,
            );

            return { contents: generatedCode };
          } catch (e) {
            return {
              errors: {
                text: e.message,
              },
            };
          }
        },
      );
    },
  };

  const karmaBundle = join(options.outputDirectory, "karma-main.js");
  await esbuild({
    entryPoints: ["Specs/karma-main.js"],
    bundle: true,
    sourcemap: true,
    format: "esm",
    target: "es2020",
    outfile: karmaBundle,
    plugins: [globalCesiumResolvePlugin],
    logLevel: "error", // print errors immediately, and collect warnings so we can filter out known ones
  });

  // Generate instrumented bundle for Specs.

  const specListBundle = join(options.outputDirectory, "SpecList.js");
  await esbuild({
    entryPoints: [options.specList],
    bundle: true,
    sourcemap: true,
    format: "esm",
    target: "es2020",
    outfile: specListBundle,
    plugins: [globalCesiumResolvePlugin, instrumentPlugin],
    logLevel: "error", // print errors immediately, and collect warnings so we can filter out known ones
  });

  const files = [
    { pattern: karmaBundle, included: true, type: "module" },
    { pattern: specListBundle, included: true, type: "module" },
    // Static assets are always served from the shared/combined folders.
    { pattern: "Specs/Data/**", included: false },
    { pattern: "cesium/Specs/Data/**", included: false },
    {
      pattern: `cesium/Build/CesiumUnminified/Cesium.js`,
      included: true,
    },
    {
      pattern: "cesium/Build/CesiumUnminified/**",
      included: false,
    },
    {
      pattern:
        "packages/ion-sdk-geometry/Build/IonSdkGeometryUnminified/IonSdkGeometry/**",
      included: false,
    },
  ];

  const baseUrlForTests = "/base/Build/CesiumUnminified";
  const proxies = {
    [`${baseUrlForTests}/Assets/`]:
      "/base/cesium/Build/CesiumUnminified/Assets/",
    [`${baseUrlForTests}/ThirdParty/`]:
      "/base/cesium/Build/CesiumUnminified/ThirdParty/",
    [`${baseUrlForTests}/Widgets/CesiumWidget/`]:
      "/base/cesium/Build/CesiumUnminified/Widget/",
    [`${baseUrlForTests}/Workers/`]:
      "/base/cesium/Build/CesiumUnminified/Workers/",
    [`${baseUrlForTests}/IonSdkGeometry/`]:
      "/base/packages/ion-sdk-geometry/Build/IonSdkGeometryUnminified/IonSdkGeometry/",
  };

  // Setup Karma config.

  const config = await karma.config.parseConfig(
    karmaConfigFile,
    {
      configFile: karmaConfigFile,
      singleRun: singleRun,
      browsers: browsers,
      specReporter: {
        suppressErrorSummary: false,
        suppressFailed: false,
        suppressPassed: suppressPassed,
        suppressSkipped: true,
      },
      files: files,
      proxies: proxies,
      reporters: ["spec", "coverage"],
      coverageReporter: {
        dir: options.coverageDirectory,
        subdir: function (browserName) {
          folders.push(browserName);
          return browserName;
        },
        includeAllSources: true,
      },
      client: {
        captureConsole: false,
        args: [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          webglStub,
          undefined,
        ],
      },
    },
    { promiseConfig: true, throwErrors: true },
  );

  return new Promise((resolve, reject) => {
    const server = new karma.Server(config, function doneCallback(e) {
      let html = "<!doctype html><html><body><ul>";
      folders.forEach(function (folder) {
        html += `<li><a href="${encodeURIComponent(
          folder,
        )}/index.html">${folder}</a></li>`;
      });
      html += "</ul></body></html>";
      writeFileSync(join(options.coverageDirectory, "index.html"), html);

      if (!process.env.CI) {
        if (openAfter) {
          folders.forEach(function (dir) {
            open(join(options.coverageDirectory, `${dir}/index.html`));
          });
        }
        console.log(
          "check results here:",
          join(options.coverageDirectory, "index.html"),
        );
      }

      if (failTaskOnError && e) {
        reject(e);
        return;
      }

      resolve();
    });
    server.start();
  });
}

export async function coverage() {
  let workspace = argv.workspace;
  if (workspace) {
    workspace = workspace.replaceAll(`@${scope}/`, ``);
    return runWorkspaceCoverage(workspace, {
      webglStub: argv.webglStub,
      suppressPassed: argv.suppressPassed,
      failTaskOnError: argv.failTaskOnError,
      openAfter: argv.open,
    });
  }

  return runCoverage({
    outputDirectory: "Build/Instrumented",
    coverageDirectory: "Build/Coverage",
    specList: "Specs/SpecList.js",
    filter:
      /packages(\\|\/)ion-sdk-(measurements|sensors|geometry)(\\|\/)Source((\\|\/)\w+)+\.js$/,
    webglStub: argv.webglStub,
    suppressPassed: argv.suppressPassed,
    failTaskOnError: argv.failTaskOnError,
    openAfter: argv.open,
  });
}

// Cache contexts for successive calls to test
export async function test() {
  const enableAllBrowsers = argv.all ?? false;
  const includeCategory = argv.include ?? "";
  const excludeCategory = argv.exclude ?? "";
  const webglValidation = argv.webglValidation ?? false;
  const webglStub = argv.webglStub ?? false;
  const release = argv.release ?? false;
  const failTaskOnError = argv.failTaskOnError ?? false;
  const suppressPassed = argv.suppressPassed ?? false;
  const singleRun = argv.debug ? false : true;
  const debugCanvasWidth = argv.debugCanvasWidth;
  const debugCanvasHeight = argv.debugCanvasHeight;
  const includeName = argv.includeName ?? "";
  const isProduction = argv.production;

  let workspace = argv.workspace;
  if (workspace) {
    workspace = workspace.replaceAll(`@${scope}/`, ``);
  }

  if (!isProduction) {
    console.log("Building workspaces...");
    await buildWorkspace("ion-sdk-measurements", {
      minify: release,
      iife: true,
    });
    await buildWorkspace("ion-sdk-sensors", {
      minify: release,
      iife: true,
      buildShaders: true,
    });
    await buildWorkspace("ion-sdk-geometry", {
      minify: release,
      iife: true,
      buildWorkers: true,
    });

    // Create SpecList.js
    await createCombinedSpecList();

    // Generate Specs bundle.
    await bundleCombinedSpecs({
      incremental: false,
      write: true,
    });
  }

  let browsers = ["Chrome"];
  if (argv.browsers) {
    browsers = argv.browsers.split(",");
  }

  const unminified = release ? "" : "Unminified";
  const baseFiles = [
    { pattern: "Specs/Data/**", included: false },
    { pattern: "cesium/Specs/Data/**", included: false },
    {
      pattern: `cesium/Build/Cesium${unminified}/Cesium.js`,
      included: true,
    },
    {
      pattern: `cesium/Build/Cesium${unminified}/Cesium.js.map`,
      included: false,
    },
    {
      pattern: `cesium/Build/Cesium${unminified}/**`,
      included: false,
    },
  ];

  const widgetsFiles = [
    {
      pattern: `packages/ion-sdk-measurements/Build/IonSdkMeasurements${unminified}/IonSdkMeasurements.js`,
      included: true,
    },
  ];
  const sensorsFiles = [
    {
      pattern: `packages/ion-sdk-sensors/Build/IonSdkSensors${unminified}/IonSdkSensors.js`,
      included: true,
    },
  ];
  const geometryFiles = [
    {
      pattern: `packages/ion-sdk-geometry/Build/IonSdkGeometry${unminified}/IonSdkGeometry.js`,
      included: true,
    },
    {
      pattern: `packages/ion-sdk-geometry/Build/IonSdkGeometry${unminified}/IonSdkGeometry/**`,
      included: false,
    },
    {
      pattern: `packages/ion-sdk-geometry/Build/IonSdkGeometry${unminified}/IonSdkGeometryWorkers/**`,
      included: false,
    },
  ];

  const karmaMainFile = workspace
    ? `packages/${workspace}/Build/Specs/karma-main.js`
    : "Build/Specs/karma-main.js";
  const specListFile = workspace
    ? `packages/${workspace}/Build/Specs/SpecList.js`
    : "Build/Specs/SpecList.js";

  const files = [
    ...baseFiles,
    { pattern: karmaMainFile, included: true, type: "module" },
    { pattern: specListFile, included: true, type: "module" },
    ...widgetsFiles,
    ...sensorsFiles,
    ...geometryFiles,
  ];

  const baseUrlForTests = `/base/Build/Cesium${unminified}`;
  const proxies = {
    [`${baseUrlForTests}/Assets/`]: `/base/cesium/Build/Cesium${unminified}/Assets/`,
    [`${baseUrlForTests}/ThirdParty/`]: `/base/cesium/Build/Cesium${unminified}/ThirdParty/`,
    [`${baseUrlForTests}/Widgets/CesiumWidget/`]: `/base/cesium/Build/Cesium${unminified}/Widget/`,
    [`${baseUrlForTests}/Workers/`]: `/base/cesium/Build/Cesium${unminified}/Workers/`,
    [`${baseUrlForTests}/IonSdkGeometry/`]: `/base/packages/ion-sdk-geometry/Build/IonSdkGeometry${unminified}/IonSdkGeometry/`,
    [`${baseUrlForTests}/IonSdkGeometryWorkers/`]: `/base/packages/ion-sdk-geometry/Build/IonSdkGeometry${unminified}/IonSdkGeometryWorkers/`,
  };

  if (release) {
    files.push({
      pattern: "Specs/ThirdParty/**",
      included: false,
      type: "module",
    });
  }

  const config = await karma.config.parseConfig(
    karmaConfigFile,
    {
      port: 9876,
      singleRun: singleRun,
      browsers: browsers,
      specReporter: {
        suppressErrorSummary: false,
        suppressFailed: false,
        suppressPassed: suppressPassed,
        suppressSkipped: true,
      },
      detectBrowsers: {
        enabled: enableAllBrowsers,
      },
      logLevel: verbose ? karma.constants.LOG_INFO : karma.constants.LOG_ERROR,
      files: files,
      proxies: proxies,
      client: {
        captureConsole: verbose,
        args: [
          includeCategory,
          excludeCategory,
          "--grep",
          includeName,
          webglValidation,
          webglStub,
          release,
          debugCanvasWidth,
          debugCanvasHeight,
        ],
      },
    },
    { promiseConfig: true, throwErrors: true },
  );

  return new Promise((resolve, reject) => {
    const server = new karma.Server(config, function doneCallback(exitCode) {
      if (failTaskOnError && exitCode) {
        reject(exitCode);
        return;
      }

      resolve();
    });
    server.start();
  });
}

/**
 * Generates TypeScript definition file (.d.ts) for a package.
 *
 * @param {string} workspaceName
 * @param {string} definitionsPath The path of the .d.ts file to generate.
 * @param {string} configurationPath
 * @param {Function | undefined} processSourceFunc
 * @param {Function | undefined} processModulesFunc
 * @param {Object<string, Set<string>>} importModules an object mapping workspace name to a set of exports
 */
function generateTypeScriptForWorkspace(
  workspaceName,
  definitionsPath,
  configurationPath,
  processSourceFunc,
  processModulesFunc,
  importModules,
) {
  // Run JSDoc with tsd-jsdoc to generate an initial definition file.
  execSync(`npx jsdoc --configure ${configurationPath}`, {
    stdio: `inherit`,
  });

  let source = readFileSync(definitionsPath).toString();

  if (processSourceFunc) {
    source = processSourceFunc(definitionsPath, source);
  }

  // The next step is to find the list of Cesium modules exported by the workspace's API
  // So that we can map these modules with a link back to their original source file.

  const regex = /^declare[ const ]*(function|class|namespace|enum) (.+)/gm;
  let matches;
  let publicModules = new Set();
  while ((matches = regex.exec(source))) {
    const moduleName = matches[2].match(/([^<\s|\(]+)/);
    publicModules.add(moduleName[1]);
  }

  if (processModulesFunc) {
    publicModules = processModulesFunc(publicModules);
  }

  // Fix up the output to match what we need
  // declare => export since we are wrapping everything in a namespace
  // CesiumMath => Math (because no CesiumJS build step would be complete without special logic for the Math class)
  // Fix up the WebGLConstants aliasing we mentioned above by simply unquoting the strings.
  source = source
    .replace(/^declare /gm, "export ")
    .replace(/module "Math"/gm, "namespace Math")
    .replace(/CesiumMath/gm, "Math")
    .replace(/Number\[]/gm, "number[]") // Workaround https://github.com/englercj/tsd-jsdoc/issues/117
    .replace(/String\[]/gm, "string[]")
    .replace(/Boolean\[]/gm, "boolean[]")
    .replace(/Object\[]/gm, "object[]")
    .replace(/<Number>/gm, "<number>")
    .replace(/<String>/gm, "<string>")
    .replace(/<Boolean>/gm, "<boolean>")
    .replace(/<Object>/gm, "<object>")
    .replace(
      /= "WebGLConstants\.(.+)"/gm,
      // eslint-disable-next-line no-unused-vars
      (match, p1) => `= WebGLConstants.${p1}`,
    )
    // Strip const enums which can cause errors - https://www.typescriptlang.org/docs/handbook/enums.html#const-enum-pitfalls
    .replace(/^(\s*)(export )?const enum (\S+) {(\s*)$/gm, "$1$2enum $3 {$4");

  // Wrap the source to actually be inside of a declared cesium module
  // and add any workaround and private utility types.
  source = `declare module "@${scope}/${workspaceName}" {
${source}
}
`;

  if (importModules) {
    let imports = "";

    Object.entries(importModules).forEach(([importName, moduleExports]) => {
      const workspaceModules = Array.from(moduleExports).filter(
        (importModule) =>
          // filter all the exports from a module and search the current workspace's types source
          // for any instances that those exports are used as a type
          source.match(new RegExp(`[:|] ${importModule}\\b`)),
      );
      if (workspaceModules.length > 0) {
        imports += `import {\n    ${workspaceModules.join(
          ",\n    ",
        )}\n} from "${importName}";\n\n`;
      }
    });
    source = imports + source;
  }

  // Write the final source file back out
  writeFileSync(definitionsPath, source);

  return Promise.resolve(publicModules);
}

/**
 * Reads `ThirdParty.extra.json` file
 * @param {string} path Path to `ThirdParty.extra.json`
 * @param {string[]} discoveredDependencies  List of previously discovered modules
 * @returns {Promise<object[]>} A promise to an array of objects with 'name`, `license`, and `url` strings
 */
async function getLicenseDataFromThirdPartyExtra(path, discoveredDependencies) {
  if (!existsSync(path)) {
    return Promise.reject(`${path} does not exist`);
  }

  const contents = await readFile(path);
  const thirdPartyExtra = JSON.parse(contents);
  return Promise.all(
    thirdPartyExtra.map(async function (module) {
      if (!discoveredDependencies.includes(module.name)) {
        let result = await getLicenseDataFromPackage(
          packageJson,
          module.name,
          discoveredDependencies,
          module.license,
          module.notes,
        );

        if (result) {
          return result;
        }

        // Recursively check the workspaces
        for (const workspace of packageJson.workspaces) {
          const workspacePackageJson = require(`./${workspace}/package.json`);
          result = await getLicenseDataFromPackage(
            workspacePackageJson,
            module.name,
            discoveredDependencies,
            module.license,
            module.notes,
          );

          if (result) {
            return result;
          }
        }

        // If this is not a npm module, return existing info
        discoveredDependencies.push(module.name);
        return module;
      }
    }),
  );
}

/**
 * Extracts name, license, and url from `package.json` file.
 *
 * @param {string} packageName Name of package
 * @param {string[]} discoveredDependencies List of previously discovered modules
 * @param {string[]} licenseOverride If specified, override info fetched from package.json. Useful in the case where there are multiple licenses and we might chose a single one.
 * @returns {Promise<object>} A promise to an object with 'name`, `license`, and `url` strings
 */
async function getLicenseDataFromPackage(
  packageJson,
  packageName,
  discoveredDependencies,
  licenseOverride,
  notes,
) {
  if (
    !packageJson.dependencies[packageName] &&
    (!packageJson.devDependencies || !packageJson.devDependencies[packageName])
  ) {
    return;
  }

  if (discoveredDependencies.includes(packageName)) {
    return [];
  }

  discoveredDependencies.push(packageName);

  const packagePath = join("node_modules", packageName, "package.json");

  let contents;
  if (existsSync(packagePath)) {
    // Package exists at top-level, so use it.
    contents = await readFile(packagePath);
  }

  if (!contents) {
    return Promise.reject(
      new Error(`Unable to read ${packageName} license information`),
    );
  }

  const packageData = JSON.parse(contents);

  // Check for license
  let licenseField = licenseOverride;

  if (!licenseField) {
    licenseField = [packageData.license];
  }

  if (!licenseField && packageData.licenses) {
    licenseField = packageData.licenses;
  }

  if (!licenseField) {
    console.log(`No license found for ${packageName}`);
    licenseField = ["NONE"];
  }

  let packageVersion = packageData.version;
  if (!packageData.version) {
    console.log(`No version information found for ${packageName}`);
    packageVersion = "NONE";
  }

  return {
    name: packageName,
    license: licenseField,
    version: packageVersion,
    url: `https://www.npmjs.com/package/${packageName}`,
    notes: notes,
  };
}

export async function buildThirdParty() {
  let licenseJson = [];
  const discoveredDependencies = [];

  // Generate ThirdParty.json from ThirdParty.extra.json and package.json
  const licenseInfo = await getLicenseDataFromThirdPartyExtra(
    "ThirdParty.extra.json",
    discoveredDependencies,
  );

  licenseJson = licenseJson.concat(licenseInfo);

  licenseJson.sort(function (a, b) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  return writeFile("ThirdParty.json", JSON.stringify(licenseJson, null, 2));
}
