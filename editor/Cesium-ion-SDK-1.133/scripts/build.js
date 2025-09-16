/*eslint-env node*/
import child_process from "child_process";
import { existsSync, readFileSync, statSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { EOL } from "os";
import path from "path";
import { createRequire } from "module";
import { finished } from "stream/promises";

import esbuild from "esbuild";
import { globby } from "globby";
import glslStripComments from "glsl-strip-comments";
import gulp from "gulp";
import { rimraf } from "rimraf";

import { mkdirp } from "mkdirp";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
let version = packageJson.version;
if (/\.0$/.test(version)) {
  version = version.substring(0, version.length - 2);
}

const copyrightHeaderTemplate = readFileSync("copyrightHeader.js", "utf8");
const combinedCopyrightHeader = copyrightHeaderTemplate.replace(
  "${version}",
  version,
);

function escapeCharacters(token) {
  return token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function constructRegex(pragma, exclusive) {
  const prefix = exclusive ? "exclude" : "include";
  pragma = escapeCharacters(pragma);

  const s =
    `[\\t ]*\\/\\/>>\\s?${prefix}Start\\s?\\(\\s?(["'])${pragma}\\1\\s?,\\s?pragmas\\.${pragma}\\s?\\)\\s?;?` +
    // multiline code block
    `[\\s\\S]*?` +
    // end comment
    `[\\t ]*\\/\\/>>\\s?${prefix}End\\s?\\(\\s?(["'])${pragma}\\2\\s?\\)\\s?;?\\s?[\\t ]*\\n?`;

  return new RegExp(s, "gm");
}

const pragmas = {
  debug: false,
};
const stripPragmaPlugin = {
  name: "strip-pragmas",
  setup: (build) => {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      let source = await readFile(args.path, { encoding: "utf8" });

      try {
        for (const key in pragmas) {
          if (pragmas.hasOwnProperty(key)) {
            source = source.replace(constructRegex(key, pragmas[key]), "");
          }
        }

        return { contents: source };
      } catch (e) {
        return {
          errors: {
            text: e.message,
          },
        };
      }
    });
  },
};
export const globalCesiumResolvePlugin = {
  name: "external-cesium",
  setup: (build) => {
    // Point @cesium/engine and @cesium/widgets to a global Cesium object in the iife built versions
    // to support the use case of "adding on" to OSS cesium already included in a separate script tag
    build.onResolve({ filter: /@cesium\/engine/ }, () => {
      return { path: "CesiumEngine", namespace: "external-cesium" };
    });
    build.onResolve({ filter: /@cesium\/widgets/ }, () => {
      return { path: "CesiumWidgets", namespace: "external-cesium" };
    });

    build.onLoad(
      {
        filter: new RegExp(`^CesiumEngine|CesiumWidgets$`),
        namespace: "external-cesium",
      },
      () => {
        const contents = `module.exports = Cesium`;
        return {
          contents,
        };
      },
    );
  },
};
export const externalResolvePluginForSpecs = {
  name: "external-cesium-for-specs",
  setup: (build) => {
    // In Specs, when we don't import files from the source files, we import
    // them from the index.js files. This plugin replaces those imports
    // with the IIFE bundle that's loaded in the browser
    // in SpecRunner.html.
    build.onResolve({ filter: new RegExp(`index\.js$`) }, (args) => {
      // args looks like this:
      // {
      //   path: '../../index.js',
      //   importer: '[path]/cesium-analytics/packages/ion-sdk-sensors/Specs/Scene/RectangularSensorSpec.js',
      //   namespace: 'file',
      //   resolveDir: '[path]/cesium-analytics/packages/ion-sdk-sensors/Specs/Scene',
      //   kind: 'import-statement',
      //   pluginData: undefined
      // }
      const workspace = path.basename(
        path.dirname(path.join(args.resolveDir, args.path)),
      );
      if (workspace === "ion-sdk-measurements") {
        return { path: "IonSdkMeasurements", namespace: "external-cesium" };
      }
      if (workspace === "ion-sdk-sensors") {
        return { path: "IonSdkSensors", namespace: "external-cesium" };
      }
      if (workspace === "ion-sdk-geometry") {
        return { path: "IonSdkGeometry", namespace: "external-cesium" };
      }
      throw new Error("unknown workspace, plugin not designed for this");
    });

    build.onLoad(
      {
        filter: new RegExp(`^IonSdk(Measurements|Sensors|Geometry)$`),
        namespace: "external-cesium",
      },
      (args) => {
        // args looks like this:
        // {
        //   path: 'IonSdkMeasurements',
        //   namespace: 'external-cesium',
        //   suffix: '',
        //   pluginData: undefined,
        //   with: {}
        // }
        const contents = `module.exports = ${args.path}`;
        return {
          contents,
        };
      },
    );
  },
};

// Print an esbuild warning
function printBuildWarning({ location, text }) {
  const { column, file, line, lineText, suggestion } = location;

  let message = `\n
  > ${file}:${line}:${column}: warning: ${text}
  ${lineText}
  `;

  if (suggestion && suggestion !== "") {
    message += `\n${suggestion}`;
  }

  console.log(message);
}

// Ignore `eval` warnings in third-party code we don't have control over
function handleBuildWarnings(result) {
  for (const warning of result.warnings) {
    if (!warning.location.file.includes("protobufjs.js")) {
      printBuildWarning(warning);
    }
  }
}

export const defaultESBuildOptions = Object.freeze({
  bundle: true,
  color: true,
  legalComments: `inline`,
  logLimit: 0,
  target: `es2020`,
});

/**
 * Bundles all individual modules, optionally minifying and stripping out debug pragmas.
 * @param {object} options
 * @param {string} options.outputDirectory Directory where build artifacts are output
 * @param {string} options.entryPoint script to bundle
 * @param {string} options.scriptName script name and global name for the iife
 * @param {boolean} [options.minify=false] true if the output should be minified
 * @param {boolean} [options.removePragmas=false] true if the output should have debug pragmas stripped out
 * @param {boolean} [options.sourcemap=false] true if an external sourcemap should be generated
 * @param {boolean} [options.iife=false] true if an IIFE style module should be built
 * @param {boolean} [options.node=false] true if a CJS style node module should be built
 * @param {boolean} [options.incremental=false] true if build output should be cached for repeated builds
 * @param {boolean} [options.write=true] true if build output should be written to disk. If false, the files that would have been written as in-memory buffers
 */
export async function bundleIndexJs(options) {
  const buildConfig = {
    ...defaultESBuildOptions,
    entryPoints: [options.entryPoint],
    minify: options.minify,
    sourcemap: options.sourcemap,
    plugins: options.removePragmas ? [stripPragmaPlugin] : undefined,
    write: options.write,
    banner: {
      js: combinedCopyrightHeader,
    },
    // print errors immediately, and collect warnings so we can filter out known ones
    logLevel: "info",
  };

  const contexts = {};
  const incremental = options.incremental ?? false;
  const build = incremental ? esbuild.context : esbuild.build;

  // Build ESM
  const esm = await build({
    ...buildConfig,
    format: "esm",
    outfile: path.join(options.outputDirectory, "index.js"),
    // NOTE: doing this requires an importmap defined in the browser but avoids bundling the OSS code
    external: ["@cesium/engine", "@cesium/widgets"],
  });

  if (incremental) {
    contexts.esm = esm;
  } else {
    handleBuildWarnings(esm);
  }

  // Build IIFE
  if (options.iife) {
    const iife = await build({
      ...buildConfig,
      format: "iife",
      globalName: options.scriptName.replace(".js", ""),
      outfile: path.join(options.outputDirectory, options.scriptName),
      logOverride: { "empty-import-meta": "silent" },
      plugins: [globalCesiumResolvePlugin],
    });

    if (incremental) {
      contexts.iife = iife;
    } else {
      handleBuildWarnings(iife);
    }
  }

  if (options.node) {
    const node = await build({
      ...buildConfig,
      format: "cjs",
      platform: "node",
      logOverride: { "empty-import-meta": "silent" },
      define: {
        // TransformStream is a browser-only implementation depended on by zip.js
        TransformStream: "null",
      },
      outfile: path.join(options.outputDirectory, "index.cjs"),
    });

    if (incremental) {
      contexts.node = node;
    } else {
      handleBuildWarnings(node);
    }
  }

  return contexts;
}

function filePathToModuleId(moduleId) {
  return moduleId.substring(0, moduleId.lastIndexOf(".")).replace(/\\/g, "/");
}

const workspaceSourceFiles = {
  "ion-sdk-measurements": ["packages/ion-sdk-measurements/Source/**/*.js"],
  "ion-sdk-sensors": ["packages/ion-sdk-sensors/Source/**/*.js"],
  "ion-sdk-geometry": [
    "packages/ion-sdk-geometry/Source/**/*.js",
    "!packages/ion-sdk-geometry/Source/*.js",
    "!packages/ion-sdk-geometry/Source/Workers/**",
  ],
};

const workspaceSpecFiles = {
  "ion-sdk-measurements": ["packages/ion-sdk-measurements/Specs/**/*Spec.js"],
  "ion-sdk-sensors": ["packages/ion-sdk-sensors/Specs/**/*Spec.js"],
  "ion-sdk-geometry": ["packages/ion-sdk-geometry/Specs/**/*Spec.js"],
};

/**
 * Creates a single entry point file, Specs/SpecList.js, which imports all individual spec files.
 * @returns {Promise<string>} contents
 */
export async function createCombinedSpecList() {
  let contents = `export const VERSION = '${version}';\n`;

  for (const workspace of Object.keys(workspaceSpecFiles)) {
    const files = await globby(workspaceSpecFiles[workspace]);
    for (const file of files) {
      contents += `import '../${file}';\n`;
    }
  }

  await writeFile(path.join("Specs", "SpecList.js"), contents, {
    encoding: "utf-8",
  });

  return contents;
}

/**
 * @param {object} options
 * @param {string} options.path output directory
 * @param {string} options.workspace workspace to load workers from
 * @param {boolean} [options.minify=false] true if the worker output should be minified
 * @param {boolean} [options.incremental=false] true if build output should be cached for repeated builds
 * @param {boolean} [options.write=true] true if build output should be written to disk. If false, the files that would have been written as in-memory buffers
 */
export async function bundleWorkers(options) {
  const incremental = options.incremental ?? false;

  // Bundle Cesium workers
  const workspace = options.workspace;
  const workers = await globby([`packages/${workspace}/Source/Workers/**`]);

  const workerConfig = {
    ...defaultESBuildOptions,
    bundle: true,
    external: ["fs", "path"],
    format: "esm",
    splitting: true,
    banner: {
      js: combinedCopyrightHeader,
    },
    entryPoints: workers,
    outdir: options.path,
    minify: options.minify,
    write: options.write,
  };

  if (incremental) {
    return esbuild.context(workerConfig);
  }
  return esbuild.build(workerConfig);
}

export async function glslToJavaScript(minify, minifyStateFilePath, workspace) {
  await writeFile(minifyStateFilePath, minify.toString());
  const minifyStateFileLastModified = existsSync(minifyStateFilePath)
    ? statSync(minifyStateFilePath).mtime.getTime()
    : 0;

  // collect all currently existing JS files into a set, later we will remove the ones
  // we still are using from the set, then delete any files remaining in the set.
  const leftOverJsFiles = {};

  const files = await globby([`packages/${workspace}/Source/Shaders/**/*.js`]);
  files.forEach(function (file) {
    leftOverJsFiles[path.normalize(file)] = true;
  });

  const builtinFunctions = [];
  const builtinConstants = [];
  const builtinStructs = [];

  const glslFiles = await globby([
    `packages/${workspace}/Source/Shaders/**/*.glsl`,
  ]);
  await Promise.all(
    glslFiles.map(async function (glslFile) {
      glslFile = path.normalize(glslFile);
      const baseName = path.basename(glslFile, ".glsl");
      const jsFile = `${path.join(path.dirname(glslFile), baseName)}.js`;

      // identify built in functions, structs, and constants
      const baseDir = path.join(
        `packages/${workspace}/`,
        "Source",
        "Shaders",
        "Builtin",
      );
      if (
        glslFile.indexOf(path.normalize(path.join(baseDir, "Functions"))) === 0
      ) {
        builtinFunctions.push(baseName);
      } else if (
        glslFile.indexOf(path.normalize(path.join(baseDir, "Constants"))) === 0
      ) {
        builtinConstants.push(baseName);
      } else if (
        glslFile.indexOf(path.normalize(path.join(baseDir, "Structs"))) === 0
      ) {
        builtinStructs.push(baseName);
      }

      delete leftOverJsFiles[jsFile];

      const jsFileExists = existsSync(jsFile);
      const jsFileModified = jsFileExists
        ? statSync(jsFile).mtime.getTime()
        : 0;
      const glslFileModified = statSync(glslFile).mtime.getTime();

      if (
        jsFileExists &&
        jsFileModified > glslFileModified &&
        jsFileModified > minifyStateFileLastModified
      ) {
        return;
      }

      let contents = await readFile(glslFile, { encoding: "utf8" });
      contents = contents.replace(/\r\n/gm, "\n");

      let copyrightComments = "";
      const extractedCopyrightComments = contents.match(
        /\/\*\*(?:[^*\/]|\*(?!\/)|\n)*?@license(?:.|\n)*?\*\//gm,
      );
      if (extractedCopyrightComments) {
        copyrightComments = `${extractedCopyrightComments.join("\n")}\n`;
      }

      if (minify) {
        contents = glslStripComments(contents);
        contents = contents
          .replace(/\s+$/gm, "")
          .replace(/^\s+/gm, "")
          .replace(/\n+/gm, "\n");
        contents += "\n";
      }

      contents = contents.split('"').join('\\"').replace(/\n/gm, "\\n\\\n");
      contents = `${copyrightComments}\
//This file is automatically rebuilt by the Cesium build process.\n\
export default "${contents}";\n`;

      return writeFile(jsFile, contents);
    }),
  );

  // delete any left over JS files from old shaders
  Object.keys(leftOverJsFiles).forEach(function (filepath) {
    rimraf.sync(filepath);
  });

  const generateBuiltinContents = function (contents, builtins, path) {
    for (let i = 0; i < builtins.length; i++) {
      const builtin = builtins[i];
      contents.imports.push(
        `import czm_${builtin} from './${path}/${builtin}.js'`,
      );
      contents.builtinLookup.push(`czm_${builtin} : ` + `czm_${builtin}`);
    }
  };

  if (
    builtinConstants.length === 0 &&
    builtinStructs.length === 0 &&
    builtinFunctions.length === 0
  ) {
    // if there aren't any builtins, skip writing that file
    return;
  }

  //generate the JS file for Built-in GLSL Functions, Structs, and Constants
  const contents = {
    imports: [],
    builtinLookup: [],
  };
  generateBuiltinContents(contents, builtinConstants, "Constants");
  generateBuiltinContents(contents, builtinStructs, "Structs");
  generateBuiltinContents(contents, builtinFunctions, "Functions");

  const fileContents = `//This file is automatically rebuilt by the Cesium build process.\n${contents.imports.join(
    "\n",
  )}\n\nexport default {\n    ${contents.builtinLookup.join(",\n    ")}\n};\n`;

  return writeFile(
    path.join(
      `packages/${workspace}/`,
      "Source",
      "Shaders",
      "Builtin",
      `CzmBuiltins-${workspace}.js`,
    ),
    fileContents,
  );
}

/**
 * Creates a template html file in the Sandcastle app listing the gallery of demos
 * @param {boolean} [noDevelopmentGallery=false] true if the development gallery should not be included in the list
 * @returns {Promise<any>}
 */
export async function createGalleryList(noDevelopmentGallery) {
  const demoObjects = [];
  const demoJSONs = [];
  const output = path.join("Apps", "Sandcastle", "gallery", "gallery-index.js");

  const fileList = [
    "Apps/Sandcastle/gallery/**/*.html",
    "cesium/Apps/Sandcastle/gallery/**/*.html",
  ];
  if (noDevelopmentGallery) {
    fileList.push("!Apps/Sandcastle/gallery/development/**/*.html");
    fileList.push("!cesium/Apps/Sandcastle/gallery/development/**/*.html");
  }

  // In CI, the version is set to something like '1.43.0-branch-name-buildNumber'
  // We need to extract just the Major.Minor version
  const majorMinor = packageJson.version.match(/^(.*)\.(.*)\./);
  const major = majorMinor[1];
  const minor = Number(majorMinor[2]) - 1; // We want the last release, not current release
  const tagVersion = `ion-${major}.${minor}`;

  // Get an array of demos that were added since the last release.
  // This includes newly staged local demos as well.
  let newDemos = [];
  try {
    newDemos = child_process
      .execSync(
        `git diff --name-only --diff-filter=A ${tagVersion} Apps/Sandcastle/gallery/*.html`,
        { stdio: ["pipe", "pipe", "ignore"] },
      )
      .toString()
      .trim()
      .split("\n");
  } catch {
    // On a Cesium fork, tags don't exist so we can't generate the list.
  }

  let helloWorld;
  const files = await globby(fileList);
  files.forEach(function (file) {
    const baseDirectory = file.startsWith("cesium")
      ? "cesium/Apps/Sandcastle/gallery"
      : "Apps/Sandcastle/gallery";
    const demo = filePathToModuleId(path.relative(baseDirectory, file));

    if (demoObjects.some((elem) => elem.name === demo)) {
      // demo with a duplicate name in analytics and OSS cesium
      return;
    }

    const demoObject = {
      name: demo,
      isNew: newDemos.includes(file),
    };

    if (existsSync(`${file.replace(".html", "")}.jpg`)) {
      demoObject.img = `${demo}.jpg`;
    }

    demoObjects.push(demoObject);

    if (demo === "Hello World") {
      helloWorld = demoObject;
    }
  });

  demoObjects.sort(function (a, b) {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  const helloWorldIndex = Math.max(demoObjects.indexOf(helloWorld), 0);

  for (let i = 0; i < demoObjects.length; ++i) {
    demoJSONs[i] = JSON.stringify(demoObjects[i], null, 2);
  }

  const contents = `\
// This file is automatically rebuilt by the Cesium build process.\n\
const hello_world_index = ${helloWorldIndex};\n\
const VERSION = '${version}';\n\
const gallery_demos = [${demoJSONs.join(", ")}];\n\
const has_new_gallery_demos = ${newDemos.length > 0 ? "true;" : "false;"}\n`;

  await writeFile(output, contents);

  // Compile CSS for Sandcastle
  return esbuild.build({
    entryPoints: [
      path.join("Apps", "Sandcastle", "templates", "bucketRaw.css"),
    ],
    minify: true,
    banner: {
      css: "/* This file is automatically rebuilt by the Cesium build process. */\n",
    },
    outfile: path.join("Apps", "Sandcastle", "templates", "bucket.css"),
  });
}

/**
 * Helper function to copy files.
 *
 * @param {string[]} globs The file globs to be copied.
 * @param {string} destination The path to copy the files to.
 * @param {string} base The base path to omit from the globs when files are copied. Defaults to "".
 * @returns {Promise<Buffer>} A promise containing the stream output as a buffer.
 */
export async function copyFiles(globs, destination, base) {
  const stream = gulp
    .src(globs, { nodir: true, base: base ?? "", encoding: false })
    .pipe(gulp.dest(destination));

  await finished(stream);
  return stream;
}

/**
 * Copy assets from ion-sdk-geometry.
 *
 * @param {string} destination The path to copy files to.
 * @returns {Promise<void>} A promise that completes when all assets are copied to the destination.
 */
export async function copyGeometryAssets(destination) {
  const staticAssets = [
    "packages/ion-sdk-geometry/Source/**",
    "!packages/ion-sdk-geometry/Source/**/*.js",
    "!packages/ion-sdk-geometry/Source/**/*.css",
    "!packages/ion-sdk-geometry/Source/**/*.glsl",
    "!packages/ion-sdk-geometry/Source/**/*.md",
  ];

  await copyFiles(
    staticAssets,
    destination,
    "packages/ion-sdk-geometry/Source",
  );
}

/**
 * Copies .jshintrc for use in Sandcastle
 * @returns {Promise<string>} contents
 */
export async function createJsHintOptions() {
  const jshintrc = JSON.parse(
    await readFile(path.join("Apps", "Sandcastle", ".jshintrc"), {
      encoding: "utf8",
    }),
  );

  const contents = `\
  // This file is automatically rebuilt by the Cesium build process.\n\
  const sandcastleJsHintOptions = ${JSON.stringify(jshintrc, null, 4)};\n`;

  await writeFile(
    path.join("Apps", "Sandcastle", "jsHintOptions.js"),
    contents,
  );

  return contents;
}

/**
 * Bundles spec files for testing in the browser and on the command line with karma.
 * @param {object} options
 * @param {boolean} [options.incremental=false] true if the build should be cached for repeated rebuilds
 * @param {boolean} [options.write=false] true if build output should be written to disk. If false, the files that would have been written as in-memory buffers
 */
export async function bundleCombinedSpecs(options) {
  options = options || {};

  const incremental = options.incremental ?? false;
  const build = incremental ? esbuild.context : esbuild.build;

  return build({
    entryPoints: [
      "Specs/spec-main.js",
      "Specs/SpecList.js",
      "Specs/karma-main.js",
    ],
    bundle: true,
    format: "esm",
    sourcemap: true,
    outdir: path.join("Build", "Specs"),
    plugins: [globalCesiumResolvePlugin, externalResolvePluginForSpecs],
    write: options.write,
  });
}

/**
 * Creates the index.js for a package.
 *
 * @param {string} workspace The workspace to create the index.js for.
 */
export async function createIndexJs(workspace) {
  let contents = `globalThis.ION_SDK_VERSION = "${version}";\n`;

  // Iterate over all provided source files for the workspace and export the assignment based on file name.
  const workspaceSources = workspaceSourceFiles[workspace];
  if (!workspaceSources) {
    throw new Error(`Unable to find source files for workspace: ${workspace}`);
  }

  const files = await globby(workspaceSources);
  files.forEach(function (file) {
    file = path.relative(`packages/${workspace}`, file);

    let moduleId = file;
    moduleId = filePathToModuleId(moduleId);

    // Rename shader files, such that ViewportQuadFS.glsl is exported as _shadersViewportQuadFS in JS.

    let assignmentName = path.basename(file, path.extname(file));
    if (moduleId.indexOf(`Source/Shaders/`) === 0) {
      assignmentName = `_shaders${assignmentName}`;
    }
    assignmentName = assignmentName.replace(/(\.|-)/g, "_");
    contents += `export { default as ${assignmentName} } from './${moduleId}.js';${EOL}`;
  });

  await writeFile(`packages/${workspace}/index.js`, contents, {
    encoding: "utf-8",
  });

  return contents;
}

/**
 * Creates a single entry point file by importing all individual spec files.
 * @param {string[]} files The individual spec files.
 * @param {string} workspace The workspace.
 * @param {string} outputPath The path the file is written to.
 */
async function createSpecListForWorkspace(files, workspace, outputPath) {
  let contents = "";
  files.forEach(function (file) {
    contents += `import './${filePathToModuleId(file).replace(
      `packages/${workspace}/Specs/`,
      "",
    )}.js';\n`;
  });

  await writeFile(outputPath, contents, {
    encoding: "utf-8",
  });

  return contents;
}

/**
 * Bundles CSS files.
 *
 * @param {object} options
 * @param {string[]} options.filePaths The file paths to bundle.
 * @param {boolean} options.sourcemap
 * @param {boolean} options.minify
 * @param {string} options.outdir The output directory.
 * @param {string} options.outbase The
 */
async function bundleCSS(options) {
  // Configure options for esbuild.
  const esBuildOptions = {
    ...defaultESBuildOptions,
    entryPoints: await globby(options.filePaths),
    loader: {
      ".gif": "text",
      ".png": "text",
    },
    sourcemap: options.sourcemap,
    minify: options.minify,
    outdir: options.outdir,
    outbase: options.outbase,
  };

  await esbuild.build(esBuildOptions);
}

const workspaceCssFiles = {
  "ion-sdk-measurements": ["packages/ion-sdk-measurements/Source/**/*.css"],
};

/**
 * Bundles spec files for testing in the browser.
 *
 * @param {object} options
 * @param {boolean} [options.incremental=true] True if builds should be generated incrementally.
 * @param {string} options.outbase The base path the output files are relative to.
 * @param {string} options.outdir The directory to place the output in.
 * @param {string} options.specListFile The path to the SpecList.js file
 * @param {boolean} [options.write=true] True if bundles generated are written to files instead of in-memory buffers.
 * @returns {object} The bundle generated from Specs.
 */
async function bundleSpecs(options) {
  const incremental = options.incremental ?? true;
  const write = options.write ?? true;

  const buildOptions = {
    bundle: true,
    format: "esm",
    outdir: options.outdir,
    sourcemap: true,
    target: "es2020",
    write: write,
  };

  const build = incremental ? esbuild.context : esbuild.build;

  // When bundling specs for a workspace, the spec-main.js and karma-main.js
  // are bundled separately since they use a different outbase than the workspace's SpecList.js.
  await build({
    ...buildOptions,
    entryPoints: ["Specs/spec-main.js", "Specs/karma-main.js"],
  });

  return build({
    ...buildOptions,
    entryPoints: [options.specListFile],
    plugins: [globalCesiumResolvePlugin, externalResolvePluginForSpecs],
    outbase: options.outbase,
  });
}

/**
 * Builds a workspace, including creating an entry point and spec files
 *
 * @param {string} workspace
 * @param {Object} options
 * @param {string} [options.outputDirectory]
 * @param {boolean} [options.iife=false]
 * @param {boolean} [options.incremental=false] True if builds should be generated incrementally. This is used to allow easy rebuilding of the esbuild context
 * @param {boolean} [options.minify=false] True if bundles should be minified.
 * @param {boolean} [options.removePragmas=false]
 * @param {boolean} [options.node=true]
 * @param {boolean} [options.sourcemap=true]
 * @param {boolean} [options.write=true] True if bundles generated are written to files instead of in-memory buffers.
 * @param {boolean} [options.buildSpecs=false] True if specs should be built
 * @param {boolean} [options.buildShaders=false] True if shaders should be built
 * @param {boolean} [options.buildWorkers=false] True if workers should be bundled
 */
export const buildWorkspace = async (workspace, options) => {
  const globalPerWorkspace = {
    "ion-sdk-measurements": "IonSdkMeasurements",
    "ion-sdk-sensors": "IonSdkSensors",
    "ion-sdk-geometry": "IonSdkGeometry",
  };
  const globalName = globalPerWorkspace[workspace];
  if (!globalName) {
    throw new Error(`Unable to determine global for workspace: ${workspace}`);
  }

  const iife = options.iife ?? true;
  const incremental = options.incremental ?? false;
  const minify = options.minify ?? false;
  const removePragmas = options.removePragmas ?? false;
  const write = options.write ?? true;
  const node = options.node ?? true;
  const sourcemap = options.sourcemap ?? true;

  const buildSpecs = options.buildSpecs ?? true;
  const buildShaders = options.buildShaders ?? false;
  const buildWorkers = options.buildWorkers ?? false;

  const outputDirectory =
    options.outputDirectory ??
    path.join(
      `packages/${workspace}/Build`,
      `${globalName}${!minify ? "Unminified" : ""}`,
    );
  rimraf.sync(outputDirectory);
  mkdirp.sync(outputDirectory);

  // build shaders first so imports all exist as expected
  if (buildShaders) {
    await glslToJavaScript(
      minify,
      `packages/${workspace}/Build/minifyShaders.state`,
      workspace,
    );
  }

  // create top level index.js module for the workspace
  await createIndexJs(workspace);

  let workerContext;
  if (buildWorkers) {
    workerContext = await bundleWorkers({
      workspace,
      minify: minify,
      path: path.join(outputDirectory, `${globalName}Workers`),
      incremental: incremental,
      write: write,
    });
  }

  await writeFile(
    path.join(outputDirectory, "../package.json"),
    JSON.stringify({
      type: "commonjs",
    }),
    "utf8",
  );

  const contexts = await bundleIndexJs({
    minify: minify,
    iife: iife,
    incremental: incremental,
    sourcemap: sourcemap,
    removePragmas: removePragmas,
    outputDirectory: outputDirectory,
    node: node,
    write: write,
    entryPoint: `packages/${workspace}/index.js`,
    scriptName: `${globalName}.js`,
  });

  if (workspace === "ion-sdk-measurements") {
    await bundleCSS({
      filePaths: workspaceCssFiles[`ion-sdk-measurements`],
      minify: minify,
      sourcemap: sourcemap,
      outdir: path.join(outputDirectory, "IonSdkMeasurements"),
      outbase: "packages/ion-sdk-measurements/Source",
    });
  }

  // // Copy static assets to the Build folder.
  if (workspace === "ion-sdk-geometry") {
    await copyGeometryAssets(path.join(outputDirectory, "IonSdkGeometry"));
  }

  if (buildSpecs) {
    // Create SpecList.js
    const specFiles = await globby(workspaceSpecFiles[workspace]);
    const specListFile = path.join(
      `packages/${workspace}/Specs`,
      "SpecList.js",
    );
    await createSpecListForWorkspace(specFiles, workspace, specListFile);
    await bundleSpecs({
      incremental: incremental,
      outbase: `packages/${workspace}/Specs`,
      outdir: `packages/${workspace}/Build/Specs`,
      specListFile: specListFile,
      write: write,
    });
  }

  // return contexts if needed to rebuild in server
  return { ...contexts, workerContext };
};
