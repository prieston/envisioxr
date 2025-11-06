#!/usr/bin/env tsx

/**
 * Cesium Viewer/Scene Configuration Audit (TypeScript)
 *
 * Checks for:
 * - Missing targetFrameRate or maximumRenderTimeChange
 * - FXAA enabled without DPI awareness
 * - Global shadows enabled
 * - Multiple ScreenSpaceEventHandlers
 * - Resolution upscaling (resolutionScale > 1.0, useBrowserRecommendedResolution)
 * - logarithmicDepthBuffer toggled in per-frame hooks
 * - depthTestAgainstTerrain enabled globally
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type Severity = "critical" | "high" | "medium";

interface Issue {
  id: string;
  severity: Severity;
  file: string;
  line: number | null;
  message: string;
  fix: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

// --- CLI args ---
const roots = process.argv.filter((a) => !a.startsWith("-")).slice(2);
const jsonOut = process.argv.includes("--json");

const defaultRoots = [
  path.join(workspaceRoot, "packages/engine-cesium/src"),
  path.join(workspaceRoot, "apps/editor/app"),
];

const scanRoots = roots.length ? roots : defaultRoots;

// --- utils ---
function listFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (!["node_modules", "dist", ".next", ".turbo", "build", "coverage", "storybook-static", "cypress", "e2e", "public", "vendor"].includes(f)) {
        listFiles(p, out);
      }
    } else if (/\.(tsx?|jsx?)$/.test(f) && !/\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/.test(f)) {
      out.push(p);
    }
  }
  return out;
}

function lineFromIndex(content: string, index: number | null): number | null {
  if (index === null || index < 0) return null;
  // Count \n up to index
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

function ctx(content: string, i: number, before = 200, after = 120): string {
  const start = Math.max(0, i - before);
  const end = Math.min(content.length, i + after);
  return content.substring(start, end);
}

// --- rules ---
function runRules(filePath: string, content: string, issues: Issue[]) {
  const rel = path.relative(workspaceRoot, filePath);

  // R1: Missing targetFrameRate OR maximumRenderTimeChange in files that new-up a Viewer
  {
    const viewerMatches = [...content.matchAll(/new\s+Cesium\.Viewer\s*\(/g)];
    if (viewerMatches.length > 0) {
      const hasTarget =
        /clock\s*\.\s*targetFrameRate\s*=/.test(content) ||
        /maximumRenderTimeChange/.test(content) ||
        /scene\s*:\s*{[^}]*maximumRenderTimeChange/.test(content);
      if (!hasTarget) {
        issues.push({
          id: "R1",
          severity: "high",
          file: rel,
          line: lineFromIndex(content, viewerMatches[0].index ?? null),
          message:
            "Viewer present but no targetFrameRate or maximumRenderTimeChange. High-refresh displays may over-render.",
          fix: "Set viewer.clock.targetFrameRate = 60 or viewer.scene.maximumRenderTimeChange = Infinity / (1 / targetFps).",
        });
      }
    }
  }

  // R2: FXAA enabled without DPI/ratio awareness
  {
    const fxaaPatterns = [
      /\.scene\.fxaa\s*=\s*true/g,
      /postProcessStages\.fxaa\.enabled\s*=\s*true/g,
      /\.fxaa\s*=\s*true/g,
    ];
    for (const pat of fxaaPatterns) {
      for (const m of content.matchAll(pat)) {
        const near = ctx(content, m.index ?? 0);
        if (!/devicePixelRatio|retina|high.*dpi/i.test(near)) {
          issues.push({
            id: "R2",
            severity: "medium",
            file: rel,
            line: lineFromIndex(content, m.index ?? null),
            message:
              "FXAA enabled without a DPI/devicePixelRatio check; may add overhead on high-DPI screens.",
            fix: "Gate FXAA: viewer.scene.fxaa = (window.devicePixelRatio ?? 1) <= 1; or tune by quality metrics.",
          });
        }
      }
    }
  }

  // R3: Global shadows enabled
  {
    const shadowMatches = [
      ...content.matchAll(/\.shadows\s*=\s*true/g),
      ...content.matchAll(/\.scene\.shadowMap\.enabled\s*=\s*true/g),
      ...content.matchAll(/\.shadows\s*=\s*Cesium\.ShadowMode\.ENABLED/g),
    ];
    for (const m of shadowMatches) {
      issues.push({
        id: "R3",
        severity: "medium",
        file: rel,
        line: lineFromIndex(content, m.index ?? null),
        message:
          "Global shadows enabled; this can be costly. Prefer targeted use, lower shadow map size, or per-entity control.",
        fix: "Disable globally unless needed: viewer.shadows = false; viewer.scene.shadowMap.enabled = false.",
      });
    }
  }

  // R4: Multiple ScreenSpaceEventHandlers in one file
  {
    const handlers = [...content.matchAll(/new\s+Cesium\.ScreenSpaceEventHandler\s*\(/g)];
    if (handlers.length > 1) {
      issues.push({
        id: "R4",
        severity: "high",
        file: rel,
        line: lineFromIndex(content, handlers[0].index ?? null),
        message: `Found ${handlers.length} ScreenSpaceEventHandler instances. Usually one shared handler per canvas is enough.`,
        fix: "Reuse a single ScreenSpaceEventHandler per canvas; centralize input binding.",
      });
    }
  }

  // R5: Resolution upscaling
  {
    for (const m of content.matchAll(/resolutionScale\s*[:=]\s*([0-9.]+)/g)) {
      const val = parseFloat(m[1]);
      if (val > 1.0) {
        issues.push({
          id: "R5A",
          severity: "high",
          file: rel,
          line: lineFromIndex(content, m.index ?? null),
          message: `resolutionScale set to ${val} (> 1.0) increases render cost without true detail gain.`,
          fix: "Use resolutionScale = 1.0; consider dynamic resolution instead of upscaling.",
        });
      }
    }
    for (const m of content.matchAll(/useBrowserRecommendedResolution\s*[:=]\s*true/g)) {
      issues.push({
        id: "R5B",
        severity: "high",
        file: rel,
        line: lineFromIndex(content, m.index ?? null),
        message:
          "useBrowserRecommendedResolution: true can render at device pixel ratio on Retina/HiDPI (heavy).",
        fix: "Set useBrowserRecommendedResolution: false, and/or clamp devicePixelRatio via resolutionScale.",
      });
    }
  }

  // R6: logarithmicDepthBuffer toggled frequently (per-frame hooks)
  {
    const assigns = [...content.matchAll(/\.logarithmicDepthBuffer\s*=\s*(true|false)/g)];
    if (assigns.length > 1) {
      for (const m of assigns) {
        const near = ctx(content, m.index ?? 0);
        if (/pre(Update|Render)|post(Update|Render)|requestAnimationFrame/.test(near)) {
          issues.push({
            id: "R6",
            severity: "critical",
            file: rel,
            line: lineFromIndex(content, m.index ?? null),
            message:
              "logarithmicDepthBuffer is toggled in a per-frame hook; this causes expensive state churn.",
            fix: "Set logarithmicDepthBuffer once at init, not inside render/update loops.",
          });
          break;
        }
      }
    }
  }

  // R7: depthTestAgainstTerrain enabled globally
  {
    for (const m of content.matchAll(/\.globe\.depthTestAgainstTerrain\s*=\s*true/g)) {
      issues.push({
        id: "R7",
        severity: "medium",
        file: rel,
        line: lineFromIndex(content, m.index ?? null),
        message:
          "Global depthTestAgainstTerrain enabled; can be costly. Enable only where necessary.",
        fix: "Prefer per-entity checks or toggle only during interactions that need it.",
      });
    }
  }
}

// --- main ---
const files = scanRoots.flatMap((r) => listFiles(r));
const issues: Issue[] = [];

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  runRules(f, content, issues);
}

// --- report ---
const critical = issues.filter((i) => i.severity === "critical");
const high = issues.filter((i) => i.severity === "high");
const medium = issues.filter((i) => i.severity === "medium");

if (jsonOut) {
  console.log(
    JSON.stringify(
      {
        summary: { critical: critical.length, high: high.length, medium: medium.length },
        issues,
      },
      null,
      2
    )
  );
  process.exit(critical.length > 0 ? 2 : high.length > 0 ? 1 : 0);
}

const hr = () => console.log("".padEnd(80, "="));
console.log("🔍 Cesium Viewer/Scene Configuration Audit");
hr();
console.log(`Files scanned: ${files.length}`);
console.log(`Critical: ${critical.length} | High: ${high.length} | Medium: ${medium.length}`);
hr();

function printGroup(title: string, arr: Issue[]) {
  if (!arr.length) return;
  console.log(title);
  console.log("-".repeat(80));
  arr.forEach((i, idx) => {
    console.log(`${idx + 1}. [${i.id}] ${i.severity.toUpperCase()} – ${i.message}`);
    console.log(`   File: ${i.file}${i.line ? `:${i.line}` : ""}`);
    console.log(`   Fix:  ${i.fix}`);
    console.log();
  });
}

printGroup("🔴 CRITICAL", critical);
printGroup("🟡 HIGH", high);
printGroup("🟢 MEDIUM", medium);

hr();

if (critical.length) {
  console.log("❌ Audit failed – Critical issues must be fixed");
  process.exit(2);
}
if (high.length) {
  console.log("⚠️  Audit passed with warnings – High priority issues recommended");
  process.exit(1);
}
console.log("✅ Audit passed");
process.exit(0);
