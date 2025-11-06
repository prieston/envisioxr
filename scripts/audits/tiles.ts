#!/usr/bin/env tsx

/**
 * Cesium 3D Tiles Audit (strict)
 * - Fewer false positives by tracking variable names & lifecycles
 * - Cross-file duplicate URL/asset detection
 * - Proper line numbers per match
 * - Treats destroy() or primitives.remove() as valid cleanup
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

type Severity = "critical" | "high" | "medium";

interface Issue {
  file: string;
  line: number | null;
  issue: string;
  description: string;
  fix: string;
  extra?: Record<string, unknown>;
}

const issues: Record<Severity, Issue[]> = {
  critical: [],
  high: [],
  medium: [],
};

const seenTilesetUrls = new Map<string, string[]>(); // url -> [file paths]

// ------------ utils -------------
function listSourceFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    if (["node_modules", "dist", ".next", ".turbo", "build", "coverage", "storybook-static", "cypress", "e2e", "public", "vendor"].includes(entry)) continue;
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      listSourceFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

function lineOf(content: string, index: number | null): number | null {
  if (index == null || index < 0) return null;
  let line = 1;
  let i = 0;
  while (i < index) {
    const j = content.indexOf("\n", i);
    if (j === -1 || j >= index) break;
    line++;
    i = j + 1;
  }
  return line;
}

function pushIssue(
  sev: Severity,
  file: string,
  matchIdx: number | null,
  content: string,
  partial: Omit<Issue, "file" | "line">
) {
  issues[sev].push({
    file: path.relative(workspaceRoot, file),
    line: lineOf(content, matchIdx),
    ...partial,
  });
}

function addSeenUrl(url: string, file: string) {
  const list = seenTilesetUrls.get(url) ?? [];
  if (!list.includes(file)) list.push(file);
  seenTilesetUrls.set(url, list);
}

// Very rough "scope" grab around a match
function snippet(content: string, i: number, radius = 600): string {
  const s = Math.max(0, i - radius);
  const e = Math.min(content.length, i + radius);
  return content.slice(s, e);
}

// ------------ audit per-file -------------
function auditFile(file: string) {
  const code = fs.readFileSync(file, "utf8");
  if (!/Cesium3DTileset|tileset/.test(code)) return;

  // 1) Find tileset creations and capture assigned variable name (best-effort)
  //    Matches:
  //      const ts = await Cesium.Cesium3DTileset.fromUrl(..., options?)
  //      const ts = viewer.scene.primitives.add(new Cesium.Cesium3DTileset(options))
  const createRe =
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s*)?(?:viewer\.scene\.primitives\.add\(\s*)?(?:new\s+Cesium\.Cesium3DTileset|Cesium3DTileset\.(?:fromUrl|fromIonAssetId))\s*\(([\s\S]*?)\)/g;
  const tilesets: Array<{ varName: string; idx: number; url?: string; hasConfig: boolean }> = [];

  for (const m of code.matchAll(createRe)) {
    const varName = m[1];
    const args = m[2];
    const idx = m.index ?? 0;

    // Try extract url or ion asset id
    let url: string | undefined;
    const urlM = args.match(/url\s*:\s*["'`](.+?)["'`]/) || args.match(/["'`](https?:\/\/[^"'`]+)["'`]/);
    if (urlM) url = urlM[1];
    const ionM = args.match(/assetId\s*:\s*(\d+)/);
    if (ionM) url = `ion:${ionM[1]}`;

    if (url) addSeenUrl(url, file);

    // Immediate options presence
    const hasSSE = /maximumScreenSpaceError|baseScreenSpaceError|dynamicScreenSpaceError/.test(args);
    const hasMem = /maximumMemoryUsage/.test(args);

    tilesets.push({ varName, idx, url, hasConfig: hasSSE && hasMem });
  }

  if (tilesets.length === 0) return;

  // 2) Find later assignments to the same var: ts.maximumScreenSpaceError = ...
  //    and cleanup patterns.
  const laterAssign = (name: string, prop: string) => new RegExp(`${name}\\s*\\.\\s*${prop}\\s*=`, "g");
  const laterDestroy = (name: string) =>
    new RegExp(`(?:${name}\\s*\\.\\s*destroy\\s*\\(|viewer\\.scene\\.primitives\\.remove\\s*\\(\\s*${name}\\s*\\))`);
  const hideAssign = (name: string) => new RegExp(`${name}\\s*\\.\\s*show\\s*=\\s*false`, "g");

  // Naive effect cleanup presence
  const hasEffectCleanup = (name: string, createIdx: number): boolean => {
    // Search forward for a `return () => { ...name.destroy()... }`
    const forward = code.slice(createIdx);
    return new RegExp(
      `return\\s*\\(\\s*\\)\\s*=>[\\s\\S]*?(?:${name}\\.destroy\\(|viewer\\.scene\\.primitives\\.remove\\s*\\(\\s*${name}\\s*\\))`
    ).test(forward);
  };

  // 3) Validate config + cleanup
  for (const ts of tilesets) {
    const near = code.slice(ts.idx, ts.idx + 2000); // Search window
    const hasSSE =
      /(maximumScreenSpaceError|baseScreenSpaceError|dynamicScreenSpaceError)/.test(near) ||
      laterAssign(ts.varName, "(?:maximumScreenSpaceError|baseScreenSpaceError|dynamicScreenSpaceError)").test(code);
    const hasMem =
      /maximumMemoryUsage/.test(near) || laterAssign(ts.varName, "maximumMemoryUsage").test(code);

    if (!hasSSE) {
      pushIssue("high", file, ts.idx, code, {
        issue: "Tileset missing screen-space error configuration",
        description:
          "No SSE config found (maximum/base/dynamic). Default may be suboptimal and cause perf issues.",
        fix: `${ts.varName}.maximumScreenSpaceError = 16 (or tune per scene) or enable dynamicScreenSpaceError with heuristics.`,
        extra: { var: ts.varName, url: ts.url ?? null },
      });
    }

    if (!hasMem) {
      pushIssue("medium", file, ts.idx, code, {
        issue: "Tileset missing maximumMemoryUsage",
        description: "No memory cap found. On dense scenes this can thrash GPU memory/VRAM.",
        fix: `${ts.varName}.maximumMemoryUsage = 512 (MB) as a starting point; benchmark per dataset.`,
        extra: { var: ts.varName, url: ts.url ?? null },
      });
    }

    // Cleanup
    const hasCleanup = laterDestroy(ts.varName).test(code) || hasEffectCleanup(ts.varName, ts.idx);
    if (!hasCleanup) {
      pushIssue("critical", file, ts.idx, code, {
        issue: "Tileset not removed/destroyed on unmount",
        description: "Primitive added but no destroy/remove found. This leaks GPU memory and event listeners.",
        fix: `Return a cleanup from the effect: return () => { viewer.scene.primitives.remove(${ts.varName}); ${ts.varName}.destroy?.(); };`,
        extra: { var: ts.varName },
      });
    }

    // Hidden but not removed anywhere
    const wasHidden = hideAssign(ts.varName).test(code);
    if (wasHidden && !laterDestroy(ts.varName).test(code)) {
      const hideIdx = code.indexOf(`${ts.varName}.show = false`);
      pushIssue("medium", file, hideIdx >= 0 ? hideIdx : null, code, {
        issue: "Tileset hidden but not removed",
        description: "Keeping hidden tilesets resident still consumes memory & traversal budget.",
        fix: "Remove the primitive when not needed; re-add when toggled back on.",
      });
    }

    // Events add/remove
    const evtAdd = new RegExp(
      `${ts.varName}\\.(ready|allTilesLoaded|tileLoad|tileFailed|tileVisible)\\.addEventListener\\(([^\\)]+)\\)`,
      "g"
    );
    for (const e of code.matchAll(evtAdd)) {
      const evt = e[1];
      const handler = (e[2] || "").trim().split(",")[0].trim();
      const idx = e.index ?? ts.idx;
      const hasRemove =
        new RegExp(`${ts.varName}\\.${evt}\\.removeEventListener\\s*\\(\\s*${handler}\\s*\\)`).test(code) ||
        hasCleanup;
      if (!hasRemove) {
        pushIssue("high", file, idx, code, {
          issue: `Tileset ${evt} listener not unsubscribed`,
          description:
            "Event handler added but never removed. Destroying the tileset is acceptable, but ensure that happens.",
          fix: `Store handler ref and remove in cleanup, or guarantee ${ts.varName}.destroy() is called on unmount.`,
        });
      }
    }

    // Per-frame style writes in pre/postRender or RAF
    const styleWrite = new RegExp(`(?:${ts.varName}\\.style|feature\\.(?:color|show|pointSize))\\s*=`, "g");
    for (const m of code.matchAll(styleWrite)) {
      const i = m.index ?? 0;
      const ctx = snippet(code, i);
      if (/pre(Update|Render)|post(Update|Render)|requestAnimationFrame/.test(ctx)) {
        pushIssue("critical", file, i, code, {
          issue: "Per-frame style/property writes",
          description: "Style re-evaluation each frame is expensive on large tilesets.",
          fix: "Move style changes to discrete data-change events; avoid mutating in render loops.",
        });
      }
    }
  }
}

// ------------ run -------------
console.log("🔍 Running Cesium 3D Tiles Audit (strict)…\n");

const roots = [
  path.join(workspaceRoot, "packages/engine-cesium/src"),
  path.join(workspaceRoot, "apps/editor/app"),
].filter(fs.existsSync);

const files = roots.flatMap((r) => listSourceFiles(r));
files.forEach(auditFile);

// Cross-file duplicate urls
for (const [url, filesWith] of seenTilesetUrls.entries()) {
  if (!url) continue;
  const uniq = Array.from(new Set(filesWith));
  if (uniq.length > 1) {
    // Flag once per file
    uniq.forEach((f) =>
      issues.medium.push({
        file: path.relative(workspaceRoot, f),
        line: null,
        issue: "Potential duplicate tileset across files",
        description: `Same tileset source used in multiple modules: ${url}`,
        fix: "Hoist into a shared loader/cache and reuse the instance.",
        extra: { url, files: uniq.map((x) => path.relative(workspaceRoot, x)) },
      })
    );
  }
}

// ------------ report -------------
const wantJson = process.argv.includes("--json");
const hasCrit = issues.critical.length > 0;
const hasHigh = issues.high.length > 0;

if (wantJson) {
  console.log(JSON.stringify(issues, null, 2));
  process.exit(hasCrit ? 2 : hasHigh ? 1 : 0);
}

function dump(sev: Severity, title: string, icon: string) {
  const arr = issues[sev];
  if (arr.length === 0) return;
  console.log(`${icon} ${title}: ${arr.length}`);
  console.log("-".repeat(80));
  arr.forEach((it, i) => {
    console.log(`\n${i + 1}. ${it.issue}`);
    console.log(`   File: ${it.file}${it.line ? `:${it.line}` : ""}`);
    console.log(`   ${it.description}`);
    console.log(`   Fix: ${it.fix}`);
    if (it.extra) console.log(`   Info: ${JSON.stringify(it.extra)}`);
  });
  console.log();
}

console.log("=".repeat(80));
console.log("3D TILES AUDIT REPORT");
console.log("=".repeat(80));
console.log();

dump("critical", "CRITICAL ISSUES", "🔴");
dump("high", "HIGH PRIORITY ISSUES", "🟡");
dump("medium", "MEDIUM PRIORITY ISSUES", "🟢");

console.log("=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`Critical: ${issues.critical.length}`);
console.log(`High: ${issues.high.length}`);
console.log(`Medium: ${issues.medium.length}`);
console.log();

if (hasCrit) {
  console.log("❌ Audit failed - Critical issues must be fixed");
  process.exit(2);
}
if (hasHigh) {
  console.log("⚠️  Audit passed with warnings - High priority issues recommended");
  process.exit(1);
}
console.log("✅ Audit passed");
process.exit(0);
