#!/usr/bin/env tsx

/**
 * Render Loop & Scheduling Audit (hardened)
 *
 * Checks for:
 * - requestRenderMode configuration in Viewer options
 * - Scene event listeners (addEventListener patterns)
 * - Manual render() calls without requestRenderMode
 * - Timers/RAF inside scene callbacks
 * - Per-frame allocations in render callbacks
 * - Unguarded requestRender() calls
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
  line: number | null;
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
  ".turbo",
  "coverage",
  ".cache",
  ".output",
  "build",
  "storybook-static",
  "cypress",
  "e2e",
  "public",
  "vendor",
]);

function listFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      listFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

function findLineNumber(content: string, index: number | null): number | null {
  if (index == null || index < 0) return null;
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

function analyzeFile(filePath: string, content: string) {
  const relativePath = path.relative(workspaceRoot, filePath);

  // === Check 1: requestRenderMode configured ===
  // a) Viewer options object: new Cesium.Viewer(el, { requestRenderMode: true, maximumRenderTimeChange: ... })
  const viewerCtorRegex = /new\s+Cesium\.Viewer\s*\(\s*[^,)]*(?:,\s*({[\s\S]*?}))?\s*\)/g;
  let hasRrmInOptions = false;

  for (const m of content.matchAll(viewerCtorRegex)) {
    const optionsObj = m[1];
    if (optionsObj) {
      if (/\brequestRenderMode\s*:\s*true\b/.test(optionsObj)) {
        hasRrmInOptions = true;
      }
      // Mild nudge if RRM is set but MRTChange is huge (defeats purpose)
      if (
        /\brequestRenderMode\s*:\s*true\b/.test(optionsObj) &&
        /\bmaximumRenderTimeChange\s*:\s*(\d+(\.\d+)?)/.test(optionsObj)
      ) {
        const valMatch = /\bmaximumRenderTimeChange\s*:\s*(\d+(\.\d+)?)/.exec(optionsObj);
        if (valMatch) {
          const val = Number(valMatch[1]);
          if (val > 0.5) {
            issues.medium.push({
              file: relativePath,
              issue: "MEDIUM: Large maximumRenderTimeChange",
              description: `maximumRenderTimeChange=${val} may cause frequent renders even with requestRenderMode.`,
              line: findLineNumber(content, m.index ?? null),
              fix: "Use a small value (e.g., 0.1–0.2) or omit unless truly needed.",
            });
          }
        }
      }
    } else {
      // b) Post-construction assignment: viewer.scene.requestRenderMode = true
      const afterCreationIndex = (m.index ?? 0) + m[0].length;
      const windowSlice = content.slice(afterCreationIndex, afterCreationIndex + 800); // Small window after ctor
      if (/\.scene\.requestRenderMode\s*=\s*true\b/.test(windowSlice)) {
        hasRrmInOptions = true;
      }
    }
  }

  // If Cesium appears but no instance configured with RRM anywhere, warn once
  if (content.includes("Cesium") && !hasRrmInOptions) {
    const viewerMatch = content.match(/new\s+Cesium\.Viewer/);
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: requestRenderMode not configured",
      description: "Ensure Viewer uses requestRenderMode to avoid continuous rendering.",
      line: findLineNumber(content, viewerMatch?.index ?? null),
      fix: "Pass { requestRenderMode: true } to Viewer or set viewer.scene.requestRenderMode = true after creation.",
    });
  }

  // === Check 2: Manual render() calls (narrowed) ===
  // Cesium's render is on Scene (and Viewer proxies it). Avoid catching unrelated libs.
  const sceneRenderMatches = [
    ...content.matchAll(/\b(?:viewer(?:\.\w+)?|[\w$]+\.scene)\.render\s*\(\s*\)/g),
  ];
  if (
    sceneRenderMatches.length > 0 &&
    !/\brequestRenderMode\s*:\s*true\b/.test(content) &&
    !/\.scene\.requestRenderMode\s*=\s*true\b/.test(content)
  ) {
    issues.high.push({
      file: relativePath,
      issue: "HIGH: Manual render() without requestRenderMode",
      description: `Found ${sceneRenderMatches.length} scene render() calls with no requestRenderMode.`,
      line: findLineNumber(content, sceneRenderMatches[0].index ?? null),
      fix: "Enable requestRenderMode and replace render() loops with requestRender() on state changes.",
    });
  }

  // === Check 3: Scene event listeners (true Cesium hot path) ===
  // Catch: viewer.scene.preRender.addEventListener(fn) and postRender/preUpdate/postUpdate
  const sceneEventRegex = /\.\s*(preRender|postRender|preUpdate|postUpdate)\s*\.addEventListener\s*\(([\s\S]*?)\)/g;
  for (const m of content.matchAll(sceneEventRegex)) {
    const cb = m[2];
    const body = extractCallbackBody(cb);
    const line = findLineNumber(content, m.index ?? null);

    if (!body) continue;

    if (/setInterval|setTimeout|requestAnimationFrame/.test(body)) {
      issues.critical.push({
        file: relativePath,
        issue: "CRITICAL: Timer/RAF inside scene event callback",
        description: "Timers/RAF in scene callbacks keep the pipeline hot and defeat RRM.",
        line,
        fix: "Move timers outside scene callbacks; derive animation from Cesium clock or tick events.",
      });
    }

    // Per-frame allocations
    if (
      /\bnew\s+(?:Object|Array|Date|RegExp|Map|Set|Float32Array|Uint16Array|Uint32Array)\s*\(/.test(body) ||
      (/\[[^\]]*\]/.test(body) && /push\(|concat\(|spread/.test(body))
    ) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Per-frame allocations in scene callback",
        description: "Allocations in render/update callbacks cause GC churn.",
        line,
        fix: "Hoist allocations and reuse buffers/objects.",
      });
    }

    // requestRender misuse inside per-frame callbacks (no throttles)
    if (
      /\.requestRender\s*\(\s*\)/.test(body) &&
      !/(if\s*\(|needs(Update|Render)|dirty|throttle|debounce|rafGate|frameGate|tickModulo|%|everyNFrames)/i.test(body)
    ) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: requestRender() each frame without guard",
        description: "Calling requestRender unconditionally per frame negates RRM.",
        line,
        fix: "Guard with a dirty flag or throttle to state changes.",
      });
    }
  }

  // === Check 4: setInterval/setTimeout outside scene callbacks that poke rendering ===
  const timerRegex = /\bset(?:Interval|Timeout)\s*\(\s*([^),]+)\s*,\s*(\d+)/g;
  for (const m of content.matchAll(timerRegex)) {
    const intervalMs = Number(m[2]);
    const cbBody = extractCallbackBody(m[1]) ?? "";
    if (intervalMs < 100 && /(render|requestRender)\s*\(/.test(cbBody)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: High-frequency timer driving renders",
        description: `Timer ${intervalMs}ms calls render/requestRender.`,
        line: findLineNumber(content, m.index ?? null),
        fix: "Use requestRender on actual state changes, or tie updates to Cesium clock events.",
      });
    }
  }

  // === Check 5: requestRender() calls (general) ===
  const rrMatches = [
    ...content.matchAll(/\b(?:viewer(?:\.\w+)?|[\w$]+\.scene)\.requestRender\s*\(\s*\)/g),
  ];
  for (const m of rrMatches) {
    const ctx = extractContext(content, m.index ?? 0);
    if (
      !/(if\s*\(|dirty|needs(Update|Render)|throttle|debounce|rafGate|frameGate|mod\s*\d+|%)/i.test(ctx)
    ) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: requestRender() without guard",
        description: "Looks unconditional; may cause near-continuous rendering.",
        line: findLineNumber(content, m.index ?? null),
        fix: "Wrap with a dirty/needsUpdate flag or a throttle.",
      });
    }
  }
}

function extractCallbackBody(callbackSource: string): string | null {
  // Handles: () => { ... }, function (...) { ... }, and inline identifiers
  // 1) Arrow with block
  const arrowIdx = callbackSource.indexOf("=>");
  if (arrowIdx !== -1) {
    const braceIdx = callbackSource.indexOf("{", arrowIdx);
    if (braceIdx !== -1) return readBalanced(callbackSource, braceIdx);
    return null; // Arrow without block (expression body) – ignore
  }
  // 2) function (...) { ... }
  const funcIdx = callbackSource.indexOf("function");
  if (funcIdx !== -1) {
    const braceIdx = callbackSource.indexOf("{", funcIdx);
    if (braceIdx !== -1) return readBalanced(callbackSource, braceIdx);
  }
  return null;
}

function readBalanced(src: string, startBrace: number): string | null {
  let depth = 0;
  let inStr: string | null = null;
  let prev = "";
  for (let i = startBrace; i < src.length; i++) {
    const c = src[i];
    // Basic string/comment skipping
    if (!inStr && (c === "'" || c === '"' || c === "`")) {
      inStr = c;
      prev = c;
      continue;
    }
    if (inStr) {
      if (c === inStr && prev !== "\\") inStr = null;
      prev = c;
      continue;
    }
    if (c === "{") {
      depth++;
    }
    if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(startBrace, i + 1);
    }
    prev = c;
  }
  return null;
}

function extractContext(content: string, index: number): string {
  const start = Math.max(0, index - 240);
  const end = Math.min(content.length, index + 160);
  return content.slice(start, end);
}

// Main execution
console.log("🔍 Running Render Loop & Scheduling Audit (hardened)…\n");

const cesiumDir = path.join(workspaceRoot, "packages/engine-cesium/src");
const editorDir = path.join(workspaceRoot, "apps/editor/app");

const files: string[] = [];
if (fs.existsSync(cesiumDir)) {
  files.push(...listFiles(cesiumDir));
}
if (fs.existsSync(editorDir)) {
  files.push(...listFiles(editorDir));
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("Cesium") || content.includes("cesium")) {
    analyzeFile(file, content);
  }
}

// Generate report
console.log("=".repeat(80));
console.log("RENDER LOOP & SCHEDULING AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! Render loop is optimized.");
  process.exit(0);
}

if (issues.critical.length > 0) {
  console.log("🔴 CRITICAL ISSUES:", issues.critical.length);
  console.log("-".repeat(80));
  issues.critical.forEach((issue, i) => {
    console.log(`\n${i + 1}. ${issue.issue}`);
    console.log(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
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
    console.log(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
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
    console.log(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ""}`);
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

if (issues.critical.length > 0) {
  console.log("❌ Audit failed - Critical issues must be fixed");
  process.exit(2);
}

if (issues.high.length > 0) {
  console.log("⚠️  Audit passed with warnings - High priority issues recommended");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);
