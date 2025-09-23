/*eslint-env node*/
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import request from "request";
import { URL } from "url";

import chokidar from "chokidar";
import compression from "compression";
import express from "express";
import yargs from "yargs";

import createRoute from "./scripts/createRoute.js";

const argv = yargs(process.argv)
  .options({
    port: {
      default: 8080,
      description: "Port to listen on.",
    },
    public: {
      type: "boolean",
      description: "Run a public server that listens on all interfaces.",
    },
    "upstream-proxy": {
      description:
        'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".',
    },
    "bypass-upstream-proxy-hosts": {
      description:
        'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"',
    },
    production: {
      type: "boolean",
      description: "If true, skip build step and serve existing built files.",
    },
  })
  .help()
  .parseSync();

import {
  createJsHintOptions,
  createCombinedSpecList,
  glslToJavaScript,
  buildWorkspace,
  createGalleryList,
  bundleCombinedSpecs,
} from "./scripts/build.js";

function formatTimeSinceInSeconds(start) {
  return Math.ceil((performance.now() - start) / 100) / 10;
}

/**
 * Returns bundles configured for development.
 *
 */
async function generateDevelopmentBuild() {
  const startTime = performance.now();

  await Promise.all([createJsHintOptions(), createGalleryList(false)]);

  const buildOptions = {
    development: true,
    iife: true,
    incremental: true,
    minify: false,
    node: false,
    removePragmas: false,
    sourcemap: true,
    write: false,
  };

  console.log("[1/3] Building @cesiumgs/ion-sdk-measurements...");
  const widgets = await buildWorkspace("ion-sdk-measurements", {
    ...buildOptions,
    outputDirectory: `packages/ion-sdk-measurements/Build/IonSdkMeasurementsDev`,
  });

  console.log("[2/3] Building @cesiumgs/ion-sdk-sensors...");
  const sensors = await buildWorkspace("ion-sdk-sensors", {
    ...buildOptions,
    outputDirectory: `packages/ion-sdk-sensors/Build/IonSdkSensorsDev`,
    buildShaders: true,
  });

  console.log("[3/3] Building @cesiumgs/ion-sdk-geometry...");
  const geometry = await buildWorkspace("ion-sdk-geometry", {
    ...buildOptions,
    outputDirectory: `packages/ion-sdk-geometry/Build/IonSdkGeometryDev`,
    buildWorkers: true,
  });

  console.log(
    `Packages built in ${formatTimeSinceInSeconds(startTime)} seconds.`,
  );

  await createCombinedSpecList();
  const specs = await bundleCombinedSpecs({ incremental: true, write: false });

  return { geometry, sensors, widgets, specs };
}

(async function () {
  const gzipHeader = Buffer.from("1F8B08", "hex");
  const production = argv.production;

  const app = express();

  app.use(function (req, res, next) {
    // *NOTE* Any changes you make here must be mirrored in web.config.
    const extensionToMimeType = {
      ".czml": "application/json",
      ".json": "application/json",
      ".geojson": "application/json",
      ".topojson": "application/json",
      ".wasm": "application/wasm",
      ".ktx2": "image/ktx2",
      ".gltf": "model/gltf+json",
      ".bgltf": "model/gltf-binary",
      ".glb": "model/gltf-binary",
      ".b3dm": "application/octet-stream",
      ".pnts": "application/octet-stream",
      ".i3dm": "application/octet-stream",
      ".cmpt": "application/octet-stream",
      ".geom": "application/octet-stream",
      ".vctr": "application/octet-stream",
      ".glsl": "text/plain",
    };
    const extension = path.extname(req.url);
    if (extensionToMimeType[extension]) {
      res.contentType(extensionToMimeType[extension]);
    }
    next();
  });

  app.use(compression());
  //eslint-disable-next-line no-unused-vars
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    next();
  });

  function checkGzipAndNext(req, res, next) {
    const baseURL = `${req.protocol}://${req.headers.host}/`;
    const reqUrl = new URL(req.url, baseURL);
    const filePath = reqUrl.pathname.substring(1);

    const readStream = fs.createReadStream(filePath, { start: 0, end: 2 });
    //eslint-disable-next-line no-unused-vars
    readStream.on("error", function (err) {
      next();
    });

    readStream.on("data", function (chunk) {
      if (chunk.equals(gzipHeader)) {
        res.header("Content-Encoding", "gzip");
      }
      next();
    });
  }

  const knownTilesetFormats = [
    /\.b3dm/,
    /\.pnts/,
    /\.i3dm/,
    /\.cmpt/,
    /\.glb/,
    /\.geom/,
    /\.vctr/,
    /tileset.*\.json$/,
  ];
  app.get(knownTilesetFormats, checkGzipAndNext);

  let disposeContextsFunc;
  if (!production) {
    const cesiumBaseUrl = "/cesium/Build/CesiumUnminified";
    const cesiumBaseUrlMinified = "/cesium/Build/Cesium";

    let jsHintOptionsCache;
    const contexts = await generateDevelopmentBuild();
    disposeContextsFunc = () => {
      contexts.widgets.esm.dispose();
      contexts.widgets.iife.dispose();

      contexts.geometry.esm.dispose();
      contexts.geometry.iife.dispose();
      contexts.geometry.workerContext?.dispose();

      contexts.sensors.esm.dispose();
      contexts.sensors.iife.dispose();
    };

    const iifeCacheSensors = createRoute(
      app,
      "IonSdkSensors iife",
      "/packages/ion-sdk-sensors/Build/IonSdkSensorsUnminified/IonSdkSensors.js",
      contexts.sensors.iife,
    );
    const esmCacheSensors = createRoute(
      app,
      "IonSdkSensors esm index.js",
      "/packages/ion-sdk-sensors/Build/IonSdkSensorsUnminified/index.js",
      contexts.sensors.esm,
    );

    const sensorsSourceWatcher = chokidar.watch(
      ["packages/ion-sdk-sensors/Source"],
      {
        ignored: [
          "packages/ion-sdk-sensors/Source/Shaders",
          (path, stats) => {
            return !!stats?.isFile() && !path.endsWith(".js");
          },
        ],
        ignoreInitial: true,
      },
    );
    sensorsSourceWatcher.on("all", async () => {
      iifeCacheSensors.clear();
      esmCacheSensors.clear();
    });

    const sensorsGlslWatcher = chokidar.watch(
      "packages/ion-sdk-sensors/Source/Shaders",
      {
        ignored: (path, stats) => {
          return !!stats?.isFile() && !path.endsWith(".glsl");
        },
        ignoreInitial: true,
      },
    );
    sensorsGlslWatcher.on("all", async () => {
      jsHintOptionsCache = undefined;
      await glslToJavaScript(
        false,
        "Build/minifyShaders.state",
        "ion-sdk-sensors",
      );
      esmCacheSensors.clear();
      iifeCacheSensors.clear();
    });

    const iifeCacheGeometry = createRoute(
      app,
      "IonSdkGeometry iife",
      "/packages/ion-sdk-geometry/Build/IonSdkGeometryUnminified/IonSdkGeometry.js",
      contexts.geometry.iife,
    );
    const esmCacheGeometry = createRoute(
      app,
      "IonSdkGeometry esm index.js",
      "/packages/ion-sdk-geometry/Build/IonSdkGeometryUnminified/index.js",
      contexts.geometry.esm,
    );
    const geometryWorkersCache = createRoute(
      app,
      "IonSdkGeometryWorkers/*",
      `${cesiumBaseUrl}/IonSdkGeometryWorkers/*file.js`,
      contexts.geometry.workerContext,
    );
    const geometryWorkersCacheMinified = createRoute(
      app,
      "IonSdkGeometryWorkers/*",
      `${cesiumBaseUrlMinified}/IonSdkGeometryWorkers/*file.js`,
      contexts.geometry.workerContext,
    );

    const geometrySourceWatcher = chokidar.watch(
      ["packages/ion-sdk-geometry/Source/"],
      {
        ignored: (path, stats) => {
          return !!stats?.isFile() && !path.endsWith(".js");
        },
        ignoreInitial: true,
      },
    );
    geometrySourceWatcher.on("all", async () => {
      jsHintOptionsCache = undefined;
      iifeCacheGeometry.clear();
      esmCacheGeometry.clear();
      geometryWorkersCache.clear();
      geometryWorkersCacheMinified.clear();
    });

    app.use(
      `${cesiumBaseUrl}/IonSdkGeometry`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometryDev/IonSdkGeometry",
      ),
    );
    app.use(
      `${cesiumBaseUrlMinified}/IonSdkGeometry`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometryDev/IonSdkGeometry",
      ),
    );

    const iifeCacheWidgets = createRoute(
      app,
      "IonSdkMeasurements iife",
      "/packages/ion-sdk-measurements/Build/IonSdkMeasurementsUnminified/IonSdkMeasurements.js",
      contexts.widgets.iife,
    );
    const esmCacheWidgets = createRoute(
      app,
      "IonSdkMeasurements esm index.js",
      "/packages/ion-sdk-measurements/Build/IonSdkMeasurementsUnminified/index.js",
      contexts.widgets.esm,
    );

    const measurementsSourceWatcher = chokidar.watch(
      ["packages/ion-sdk-measurements/Source"],
      {
        ignored: (path, stats) => {
          return !!stats?.isFile() && !path.endsWith(".js");
        },
        ignoreInitial: true,
      },
    );
    measurementsSourceWatcher.on("all", async () => {
      jsHintOptionsCache = undefined;
      iifeCacheWidgets.clear();
      esmCacheWidgets.clear();
    });

    const specsCache = createRoute(
      app,
      "Specs/*",
      "/Build/Specs/*file",
      contexts.specs,
    );
    const specWatcher = chokidar.watch(
      [
        "packages/ion-sdk-measurements/Specs",
        "packages/ion-sdk-sensors/Specs",
        "packages/ion-sdk-geometry/Specs",
        "Specs",
      ],
      {
        ignored: [
          "packages/ion-sdk-measurements/Specs/SpecList.js",
          "packages/ion-sdk-sensors/Specs/SpecList.js",
          "packages/ion-sdk-geometry/Specs/SpecList.js",
          "Specs/SpecList.js",
          "Specs/e2e",
          (path, stats) => {
            return !!stats?.isFile() && !path.endsWith("Spec.js");
          },
        ],
        ignoreInitial: true,
      },
    );
    specWatcher.on("all", async (event) => {
      if (event === "add" || event === "unlink") {
        await createCombinedSpecList();
      }

      specsCache.clear();
    });

    // Rebuild jsHintOptions as needed and serve as-is
    app.get(
      "/Apps/Sandcastle/jsHintOptions.js",
      async function (
        //eslint-disable-next-line no-unused-vars
        req,
        res,
        //eslint-disable-next-line no-unused-vars
        next,
      ) {
        if (!jsHintOptionsCache) {
          jsHintOptionsCache = await createJsHintOptions();
        }

        res.append("Cache-Control", "max-age=0");
        res.append("Content-Type", "application/javascript");
        res.send(jsHintOptionsCache);
      },
    );
  } else {
    // only in production mode
    app.use(
      `/cesium/Build/CesiumUnminified/IonSdkGeometry`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometry/IonSdkGeometry",
      ),
    );
    app.use(
      `/cesium/Build/Cesium/IonSdkGeometry`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometry/IonSdkGeometry",
      ),
    );
    app.use(
      `/cesium/Build/CesiumUnminified/IonSdkGeometryWorkers`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometry/IonSdkGeometryWorkers",
      ),
    );
    app.use(
      `/cesium/Build/Cesium/IonSdkGeometryWorkers`,
      express.static(
        "packages/ion-sdk-geometry/Build/IonSdkGeometry/IonSdkGeometryWorkers",
      ),
    );
  }

  // Serve OSS parts of cesium
  app.use("/cesium/Build/", express.static("cesium/Build/"));
  app.use("/Specs/cesium/Data", express.static("cesium/Specs/Data"));

  // Serve third party libraries like dojo from the submodule
  app.use("/ThirdParty/", express.static("cesium/ThirdParty"));

  // Serve the gallery and SampleData from this project AND the OSS submodule
  // This project's files will clobber the OSS ones if they match names
  app.use(
    "/Apps/Sandcastle/gallery",
    express.static("Apps/Sandcastle/gallery"),
    express.static("cesium/Apps/Sandcastle/gallery"),
  );
  app.use(
    "/Apps/SampleData",
    express.static("Apps/SampleData"),
    express.static("cesium/Apps/SampleData"),
  );

  app.use(express.static(path.resolve(".")));

  const dontProxyHeaderRegex =
    /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

  //eslint-disable-next-line no-unused-vars
  function filterHeaders(req, headers) {
    const result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function (name) {
      if (!dontProxyHeaderRegex.test(name)) {
        result[name] = headers[name];
      }
    });
    return result;
  }

  const upstreamProxy = argv["upstream-proxy"];
  const bypassUpstreamProxyHosts = {};
  if (argv["bypass-upstream-proxy-hosts"]) {
    argv["bypass-upstream-proxy-hosts"].split(",").forEach(function (host) {
      bypassUpstreamProxyHosts[host.toLowerCase()] = true;
    });
  }

  //eslint-disable-next-line no-unused-vars
  app.param("remote", function (req, res, next, remote) {
    if (remote) {
      // Handles request like http://localhost:8080/proxy/http://example.com/file?query=1
      let remoteUrl = remote.join("/");
      // add http:// to the URL if no protocol is present
      if (!/^https?:\/\//.test(remoteUrl)) {
        remoteUrl = `http://${remoteUrl}`;
      }
      remoteUrl = new URL(remoteUrl);
      // copy query string
      const baseURL = `${req.protocol}://${req.headers.host}/`;
      remoteUrl.search = new URL(req.url, baseURL).search;

      req.remote = remoteUrl;
    }
    next();
  });

  //eslint-disable-next-line no-unused-vars
  app.get("/proxy{/*remote}", function (req, res, next) {
    let remoteUrl = req.remote;
    if (!remoteUrl) {
      // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
      remoteUrl = Object.keys(req.query)[0];
      if (remoteUrl) {
        const baseURL = `${req.protocol}://${req.headers.host}/`;
        remoteUrl = new URL(remoteUrl, baseURL);
      }
    }

    if (!remoteUrl) {
      return res.status(400).send("No url specified.");
    }

    if (!remoteUrl.protocol) {
      remoteUrl.protocol = "http:";
    }

    let proxy;
    if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
      proxy = upstreamProxy;
    }

    // encoding : null means "body" passed to the callback will be raw bytes

    request.get(
      {
        url: remoteUrl.toString(),
        headers: filterHeaders(req, req.headers),
        encoding: null,
        proxy: proxy,
      },
      //eslint-disable-next-line no-unused-vars
      function (error, response, body) {
        let code = 500;

        if (response) {
          code = response.statusCode;
          res.header(filterHeaders(req, response.headers));
        }

        res.status(code).send(body);
      },
    );
  });

  const server = app.listen(
    argv.port,
    argv.public ? undefined : "localhost",
    function () {
      if (argv.public) {
        console.log(
          "Cesium development server running publicly.  Connect to http://localhost:%d/",
          server.address().port,
        );
      } else {
        console.log(
          "Cesium development server running locally.  Connect to http://localhost:%d/",
          server.address().port,
        );
      }
    },
  );

  server.on("error", function (e) {
    if (e.code === "EADDRINUSE") {
      console.log(
        "Error: Port %d is already in use, select a different port.",
        argv.port,
      );
      console.log("Example: node server.js --port %d", argv.port + 1);
    } else if (e.code === "EACCES") {
      console.log(
        "Error: This process does not have permission to listen on port %d.",
        argv.port,
      );
      if (argv.port < 1024) {
        console.log("Try a port number higher than 1024.");
      }
    }

    throw e;
  });

  server.on("close", function () {
    console.log("Cesium development server stopped.");
    process.exit(0);
  });

  let isFirstSig = true;
  process.on("SIGINT", function () {
    if (isFirstSig) {
      console.log("\nCesium development server shutting down.");

      server.close();

      if (!production && disposeContextsFunc) {
        disposeContextsFunc();
      }

      isFirstSig = false;
    } else {
      throw new Error("Cesium development server force kill.");
    }
  });
})();
