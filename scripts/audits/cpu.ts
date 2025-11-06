#!/usr/bin/env node

/**
 * CPU Hotspot Audit
 *
 * Checks for:
 * - Heavy per-frame operations on main thread
 * - Geometry/material churn in render loops
 * - Worker misuse (cloning vs transferables)
 * - Expensive calls in loops (JSON, Date, RegExp)
 * - Module-scope Cesium work
 * - requestRender spam
 * - Missing scratch object reuse
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

interface Issue {
  file: string;
  issue: string;
  description: string;
  line: number;
  col: number;
  fix: string;
}

const issues: {
  critical: Issue[];
  high: Issue[];
  medium: Issue[];
} = {
  critical: [],
  high: [],
  medium: [],
};

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  "storybook-static",
  "coverage",
  "cypress",
  "e2e",
  "public",
  "vendor",
]);

const IGNORE_FILE_RE = /\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/;

function findLineFromMatch(
  content: string,
  idx: number
): { line: number; col: number } {
  const before = content.slice(0, idx);
  const line = before.split("\n").length;
  const col = before.length - before.lastIndexOf("\n");
  return { line, col };
}

function findFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) findFiles(p, out);
    } else if (
      /\.(tsx|ts|jsx|js)$/.test(entry.name) &&
      !IGNORE_FILE_RE.test(entry.name)
    ) {
      out.push(p);
    }
  }
  return out;
}

function scoreHotspot(snippet: string): number {
  const math = (
    snippet.match(
      /Math\.(sin|cos|tan|atan2|sqrt|pow|hypot|floor|round|abs)\b/g
    ) || []
  ).length;
  const alloc = (
    snippet.match(
      /\bnew\s+(Cesium\.)?(Cartesian[23]|Matrix[234]|Color|Bounding|Quaternion|ScreenSpaceEventHandler)\b|[{[]\s*[}\]]/g
    ) || []
  ).length;
  const expensive = (
    snippet.match(
      /JSON\.(stringify|parse)|structuredClone|toLocaleString|new\s+Date|new\s+RegExp/g
    ) || []
  ).length;
  const geom = (
    snippet.match(
      /\b(GeometryInstance|Geometry|Primitive|Material|Appearance)\b/g
    ) || []
  ).length;
  const reqRender = (snippet.match(/requestRender\s*\(/g) || []).length;

  // Composite score: math*1 + alloc*2 + expensive*4 + geom*5 + reqRender*3
  return math * 1 + alloc * 2 + expensive * 4 + geom * 5 + reqRender * 3;
}

function pushIssue(
  bucket: "critical" | "high" | "medium",
  fileMeta: { relative: string; content: string },
  issue: string,
  description: string,
  idx: number,
  fix: string
) {
  const { line, col } = findLineFromMatch(fileMeta.content, idx);
  issues[bucket].push({
    file: fileMeta.relative,
    issue,
    description,
    line,
    col,
    fix,
  });
}

function extractCallbackBody(
  content: string,
  startIndex: number
): string | null {
  let depth = 0;
  let inBody = false;
  let body = "";
  let foundArrow = false;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (char === "=" && content[i + 1] === ">") {
      foundArrow = true;
      i++;
      continue;
    }
    if (foundArrow && char === "{") {
      depth++;
      inBody = true;
    }
    if (inBody) body += char;
    if (char === "}") {
      depth--;
      if (depth === 0 && inBody) return body;
    }
  }

  return null;
}

function analyzeFile(filePath: string, content: string) {
  const relativePath = path.relative(workspaceRoot, filePath);
  const fileMeta = { relative: relativePath, content };

  // 1) Per-frame contexts: scene listeners, rAF, MOUSE_MOVE handlers
  const frameRes: number[] = [];

  // Scene event listeners
  const sceneEvtRe =
    /(viewer\.)?scene\.(preUpdate|postUpdate|preRender|postRender)\.addEventListener\s*\(\s*(function|\()/g;
  for (const m of content.matchAll(sceneEvtRe)) {
    if (m.index !== undefined) frameRes.push(m.index);
  }

  // requestAnimationFrame loops
  const rAFRe = /requestAnimationFrame\s*\(\s*(function|\()/g;
  for (const m of content.matchAll(rAFRe)) {
    if (m.index !== undefined) frameRes.push(m.index);
  }

  // MOUSE_MOVE handlers
  const moveHandlerRe =
    /new\s+Cesium\.ScreenSpaceEventHandler\([^)]*\)\.setInputAction\s*\(\s*(\w+|\([^)]*\))\s*,\s*Cesium\.ScreenSpaceEventType\.MOUSE_MOVE/g;
  for (const m of content.matchAll(moveHandlerRe)) {
    if (m.index !== undefined) frameRes.push(m.index);
  }

  // Analyze each per-frame context
  for (const idx of frameRes) {
    const snippet = content.slice(
      Math.max(0, idx - 300),
      Math.min(content.length, idx + 400)
    );
    const score = scoreHotspot(snippet);

    if (score >= 25) {
      pushIssue(
        "critical",
        fileMeta,
        "CRITICAL: Heavy per-frame work on main thread",
        "High density of math/alloc/geometry inside a render/animation handler.",
        idx,
        "Move heavy work to a Web Worker, cache scratch objects, avoid geometry/material churn per frame."
      );
    } else if (score >= 12) {
      pushIssue(
        "high",
        fileMeta,
        "HIGH: Expensive per-frame operations",
        "Detected expensive operations inside render/mouse-move/rAF.",
        idx,
        "Cache results, reuse scratch objects, throttle work and consider workers."
      );
    }
  }

  // 2) Geometry/material churn specifically
  const geomRe =
    /\b(GeometryInstance|Geometry|Primitive|Material|Appearance)\b/g;
  for (const m of content.matchAll(geomRe)) {
    if (m.index === undefined) continue;
    const near = content.slice(
      Math.max(0, m.index - 120),
      Math.min(content.length, m.index + 120)
    );
    if (
      /pre(Update|Render)|post(Update|Render)|requestAnimationFrame|MOUSE_MOVE/.test(
        near
      )
    ) {
      pushIssue(
        "high",
        fileMeta,
        "HIGH: Geometry/material creation in frame loop",
        "Creating/changing geometry or materials per frame is expensive.",
        m.index,
        "Construct once, reuse; or precompute in a Worker and swap buffers."
      );
    }
  }

  // 3) Worker misuse: cloning large payloads
  const workerMsgRe = /postMessage\s*\(\s*([^)]+)\)/g;
  for (const m of content.matchAll(workerMsgRe)) {
    if (m.index === undefined) continue;
    const args = m[1];
    const isLarge = args.length > 500;
    const hasTransferable =
      /ArrayBuffer|SharedArrayBuffer|ImageBitmap|MessagePort/.test(args);
    if (isLarge && !hasTransferable) {
      pushIssue(
        "medium",
        fileMeta,
        "MEDIUM: Large worker messages without transferables",
        "Structured clone of large objects/arrays is costly.",
        m.index,
        "Send ArrayBuffer/TypedArray and pass .buffer in the transfer list."
      );
    }
  }

  // 4) Known expensive calls in loops
  const expensiveRe =
    /(JSON\.(stringify|parse)|structuredClone|toLocaleString|new\s+Date|new\s+RegExp)/g;
  for (const m of content.matchAll(expensiveRe)) {
    if (m.index === undefined) continue;
    const near = content.slice(
      Math.max(0, m.index - 120),
      Math.min(content.length, m.index + 120)
    );
    if (
      /for\s*\(|\.map\(|\.forEach\(|while\s*\(/.test(near) &&
      /pre|post|requestAnimationFrame|MOUSE_MOVE/.test(near)
    ) {
      pushIssue(
        "high",
        fileMeta,
        "HIGH: Expensive call inside per-frame loop",
        `Detected ${m[1]} in a hot path.`,
        m.index,
        "Hoist out of the loop, precompile, or memoize; move heavy parsing to a Worker."
      );
    }
  }

  // 5) Module-scope Cesium work (import-time)
  const moduleScopeRe = /^\s*new\s+Cesium\./m;
  const moduleScopeMatch = content.match(moduleScopeRe);
  if (moduleScopeMatch && moduleScopeMatch.index !== undefined) {
    pushIssue(
      "critical",
      fileMeta,
      "CRITICAL: Cesium object constructed at module scope",
      "Runs at import time on the main thread; breaks hot reload and SSR.",
      moduleScopeMatch.index,
      "Move construction inside a client-only effect and clean up on unmount."
    );
  }

  // 6) requestRender spam
  const reqRenderRe = /requestRender\s*\(/g;
  for (const m of content.matchAll(reqRenderRe)) {
    if (m.index === undefined) continue;
    const near = content.slice(
      Math.max(0, m.index - 200),
      Math.min(content.length, m.index + 100)
    );
    if (/for\s*\(|while\s*\(|MOUSE_MOVE|requestAnimationFrame/.test(near)) {
      pushIssue(
        "medium",
        fileMeta,
        "MEDIUM: requestRender in tight loop/handler",
        "Spamming requestRender negates render-on-demand.",
        m.index,
        "Throttle: only call once per frame and collapse bursts."
      );
    }
  }

  // 7) Missing scratch object reuse (new Cartesian3 in loops)
  const cartesianRe = /\bnew\s+Cesium\.Cartesian[23]\s*\(/g;
  for (const m of content.matchAll(cartesianRe)) {
    if (m.index === undefined) continue;
    const near = content.slice(
      Math.max(0, m.index - 150),
      Math.min(content.length, m.index + 150)
    );
    if (/for\s*\(|while\s*\(|\.map\(|\.forEach\(/.test(near)) {
      pushIssue(
        "medium",
        fileMeta,
        "MEDIUM: Creating scratch objects in loop",
        "Creating new Cartesian3/Matrix objects per iteration causes allocations.",
        m.index,
        "Create scratch object once outside loop: const scratch = new Cesium.Cartesian3(); reuse inside."
      );
    }
  }

  // 8) Style rebuilds over many features
  const styleRe =
    /(feature\.(color|show|pointSize|label)|tileset\.style\s*=\s*new\s+Cesium\.Cesium3DTileStyle)/g;
  for (const m of content.matchAll(styleRe)) {
    if (m.index === undefined) continue;
    const near = content.slice(
      Math.max(0, m.index - 200),
      Math.min(content.length, m.index + 200)
    );
    if (
      (/for\s*\(|\.map\(|\.forEach\(/.test(near) &&
        /pre|post|requestAnimationFrame/.test(near)) ||
      /tileset\.style\s*=\s*new\s+Cesium\.Cesium3DTileStyle/.test(near)
    ) {
      pushIssue(
        "high",
        fileMeta,
        "HIGH: Rebuilding styles over many features per frame",
        "Updating feature styles or tileset.style every frame is expensive.",
        m.index,
        "Batch updates, toggle only dirty features, or use GPU expressions set once."
      );
    }
  }

  // 9) rAF loops without requestRenderMode check
  const rAFMatches = [...content.matchAll(rAFRe)];
  if (rAFMatches.length > 0) {
    const hasRequestRenderMode =
      content.includes("requestRenderMode") ||
      content.includes("requestRenderMode: true");
    if (!hasRequestRenderMode) {
      for (const m of rAFMatches) {
        if (m.index !== undefined) {
          pushIssue(
            "medium",
            fileMeta,
            "MEDIUM: requestAnimationFrame without requestRenderMode",
            "rAF loops should check if requestRenderMode is enabled.",
            m.index,
            "Enable requestRenderMode and use requestRender() on state changes instead of continuous rAF."
          );
        }
      }
    }
  }

  // 10) MOUSE_MOVE handlers with heavy operations
  for (const m of content.matchAll(moveHandlerRe)) {
    if (m.index === undefined) continue;
    const handlerBody = extractCallbackBody(content, m.index);
    if (handlerBody) {
      const heavyOps = handlerBody.match(
        /Math\.(sin|cos|atan2|sqrt|pow)|new\s+Cesium\.(Cartesian|Matrix)|JSON\.(stringify|parse)/
      );
      if (heavyOps) {
        pushIssue(
          "high",
          fileMeta,
          "HIGH: Heavy operations in MOUSE_MOVE handler",
          "MOUSE_MOVE fires frequently; heavy math/allocations cause jank.",
          m.index,
          "Debounce with requestAnimationFrame, store state, do work in single frame step."
        );
      }
    }
  }
}

// Main execution
console.log("🔍 Running CPU Hotspot Audit...\n");

const cesiumDir = path.join(workspaceRoot, "packages/engine-cesium/src");
const editorDir = path.join(workspaceRoot, "apps/editor/app");

const files: string[] = [];
if (fs.existsSync(cesiumDir)) {
  files.push(...findFiles(cesiumDir));
}
if (fs.existsSync(editorDir)) {
  files.push(...findFiles(editorDir));
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  analyzeFile(file, content);
}

// Generate report
console.log("=".repeat(80));
console.log("CPU HOTSPOT AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (
  issues.critical.length === 0 &&
  issues.high.length === 0 &&
  issues.medium.length === 0
) {
  console.log("✅ No issues found! CPU-intensive operations are optimized.");
  process.exit(0);
}

if (issues.critical.length > 0) {
  console.log("🔴 CRITICAL ISSUES:", issues.critical.length);
  console.log("-".repeat(80));
  issues.critical.forEach((issue, i) => {
    console.log(`\n${i + 1}. ${issue.issue}`);
    console.log(`   File: ${issue.file}:${issue.line}:${issue.col}`);
    console.log(`   ${issue.description}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log();
}

if (issues.high.length > 0) {
  console.log("🟡 HIGH PRIORITY ISSUES:", issues.high.length);
  console.log("-".repeat(80));
  issues.high.forEach((issue, i) => {
    console.log(`\n${i + 1}. ${issue.issue}`);
    console.log(`   File: ${issue.file}:${issue.line}:${issue.col}`);
    console.log(`   ${issue.description}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log();
}

if (issues.medium.length > 0) {
  console.log("🟢 MEDIUM PRIORITY ISSUES:", issues.medium.length);
  console.log("-".repeat(80));
  issues.medium.forEach((issue, i) => {
    console.log(`\n${i + 1}. ${issue.issue}`);
    console.log(`   File: ${issue.file}:${issue.line}:${issue.col}`);
    console.log(`   ${issue.description}`);
    console.log(`   Fix: ${issue.fix}`);
  });
  console.log();
}

console.log("=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`Critical: ${issues.critical.length}`);
console.log(`High: ${issues.high.length}`);
console.log(`Medium: ${issues.medium.length}`);
console.log();

// Deterministic exit codes: 2 for critical, 1 for high, 0 clean
if (issues.critical.length > 0) {
  console.log("❌ Audit failed - Critical issues must be fixed");
  process.exit(2);
}

if (issues.high.length > 0) {
  console.log(
    "⚠️  Audit passed with warnings - High priority issues recommended"
  );
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);
