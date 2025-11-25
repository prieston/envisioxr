#!/usr/bin/env tsx

/**
 * RSC Boundaries & Bundle Audit (hardened)
 *
 * Improvements:
 * - Correct line/column from regex match indices
 * - Detect real "use client" directive (top-of-file only)
 * - Strip comments/strings before scanning (reduces false positives)
 * - Configurable allowlist for Cesium routes via CESIUM_ROUTE_ALLOWLIST (csv)
 * - Check template.tsx / not-found.tsx / error.tsx in addition to layout.tsx
 * - Better dynamic(() => import(...), { ssr:false }) detection per identifier
 * - Wider ignore set and CLI flags: --dir, --json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type Severity = "critical" | "high" | "medium";

interface Issue {
  file: string;
  issue: string;
  description: string;
  line?: number;
  column?: number;
  fix?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

// ---- CLI flags ----
const argv = process.argv.slice(2);
const dirFlagIndex = argv.indexOf("--dir");
const rootDir = path.resolve(
  workspaceRoot,
  dirFlagIndex >= 0 ? argv[dirFlagIndex + 1] : "apps/editor/app"
);
const outputJSON = argv.includes("--json");

// ---- Configurable allowlist for Cesium routes ----
const cesiumAllowCsv = process.env.CESIUM_ROUTE_ALLOWLIST ?? "viewer,cesium,builder";
const CESIUM_ALLOWLIST = new Set(
  cesiumAllowCsv
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

// ---- Report bucket ----
const issues: Record<Severity, Issue[]> = {
  critical: [],
  high: [],
  medium: [],
};

// ---- Utils ----
const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  ".git",
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

function listFiles(dir: string, acc: string[] = []): string[] {
  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of files) {
    const filePath = path.join(dir, name);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(name)) listFiles(filePath, acc);
    } else if (/\.(tsx?|jsx?)$/.test(name) && !/\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/.test(name)) {
      acc.push(filePath);
    }
  }
  return acc;
}

/** Strip comments and string literals to reduce false positives. */
function stripNoise(src: string): string {
  // Remove block comments
  let out = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  // Remove line comments
  out = out.replace(/(^|[^:])\/\/.*$/gm, (m) => m[0] + " ".repeat(m.length - 1));
  // Replace single/double/backtick strings (naive but robust enough for linting)
  out = out.replace(
    /(['"`])(?:\\[\s\S]|(?!\1)[\s\S])*?\1/g,
    (m) => m[0] + " ".repeat(Math.max(0, m.length - 2)) + m[m.length - 1]
  );
  return out;
}

function posFromIndex(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < index; i++) {
    if (text[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, column: col };
}

/** Real RSC directive: must be the very first statement. */
function hasUseClientDirective(src: string): boolean {
  // Skip BOM and leading whitespace/comments
  const trimmed = src.replace(/^\uFEFF/, "");
  // Find first non-empty, non-comment tokenized line
  const lines = trimmed.split("\n");
  let i = 0;
  // Skip empty lines
  while (i < lines.length && lines[i].trim() === "") i++;
  // Also skip line comments at the very top
  while (i < lines.length && /^\s*\/\/.*/.test(lines[i])) i++;
  const first = lines[i]?.trim() || "";
  return first === '"use client"' || first === "'use client'";
}

function isServerComponent(filePath: string, isClient: boolean): boolean {
  // In App Router, anything under /app that's not a client component is RSC by default
  return !isClient && filePath.split(path.sep).includes("app");
}

function pathLooksCesiumAllowed(filePath: string): boolean {
  const segments = filePath.toLowerCase().split(path.sep);
  return segments.some((seg) => CESIUM_ALLOWLIST.has(seg));
}

// ---- Core analysis ----
function analyzeFile(filePath: string, raw: string) {
  const relative = path.relative(workspaceRoot, filePath);
  const noiseFree = stripNoise(raw);
  const isClient = hasUseClientDirective(raw);
  const serverish = isServerComponent(filePath, isClient);

  // 1) Mis-tagged client component (no client-only APIs)
  if (isClient) {
    const clientOnly =
      /\b(useState|useEffect|useLayoutEffect|useRef|useMemo|useCallback)\b|(?:\bwindow\b|\bdocument\b|\blocalStorage\b)|\b(onClick|onChange|onSubmit|onPointerDown|onKeyDown)\b|(?:\bCesium\b|@cesium\/engine|\bthree\b|@react-three)/;
    if (!clientOnly.test(noiseFree)) {
      issues.medium.push({
        file: relative,
        issue: "MEDIUM: Client component could be a server component",
        description:
          "Top-level 'use client' present but no client-only APIs detected; consider converting to RSC.",
        line: 1,
        column: 1,
        fix: "Remove the 'use client' directive if interactivity isn't required.",
      });
    }
  }

  // 2) Cesium imported on non-Cesium routes
  if (filePath.includes(`${path.sep}app${path.sep}`) && !pathLooksCesiumAllowed(filePath)) {
    const cesiumImport =
      /(import[\s\S]*?from\s+['"]cesium['"])|(import[\s\S]*?from\s+['"]@cesium\/engine['"])|(import\s+\*\s+as\s+Cesium\b)/g;
    let m: RegExpExecArray | null;
    while ((m = cesiumImport.exec(noiseFree))) {
      const { line, column } = posFromIndex(raw, m.index);
      issues.critical.push({
        file: relative,
        issue: "CRITICAL: Cesium imported on a non-Cesium route",
        description:
          "Cesium (~2MB+) pulled into a route not marked as Cesium-allowed. Expect severe bundle bloat.",
        line,
        column,
        fix: "Gate viewer code behind dynamic(() => import(...), { ssr:false }) and move imports into a Cesium-allowed segment.",
      });
    }
  }

  // 3) Static import of known heavy viewer components without dynamic wrapper
  const heavyNames = [
    "CesiumViewer",
    "CesiumScene",
    "CesiumCanvas",
    "Cesium3DTileset",
    "SceneCanvas",
    "ThreeJSScene",
  ];
  const importDecl = new RegExp(
    `import\\s+(?:\\{[^}]*\\b(${heavyNames.join("|")})\\b[^}]*\\}|(?:\\*\\s+as\\s+\\w+|\\w+))\\s+from\\s+['"][^'"]+['"]`,
    "g"
  );
  const dynamicDecl =
    /(?:const|let|var)\s+(\w+)\s*=\s*dynamic\s*\(\s*\(\s*?\)\s*=>\s*import\(['"][^'"]+['"]\)\s*,\s*\{\s*ssr\s*:\s*false\s*\}/g;

  const staticallyImported = new Set<string>();
  let mi: RegExpExecArray | null;
  while ((mi = importDecl.exec(noiseFree))) {
    if (mi[1]) staticallyImported.add(mi[1]);
  }

  const dynamicallyWrapped = new Set<string>();
  while ((mi = dynamicDecl.exec(noiseFree))) {
    dynamicallyWrapped.add(mi[1]);
  }

  for (const name of staticallyImported) {
    // If it's also dynamically assigned elsewhere, allow it
    if (!dynamicallyWrapped.has(name)) {
      const idx = noiseFree.indexOf(name);
      const { line, column } = posFromIndex(raw, Math.max(0, idx));
      issues.high.push({
        file: relative,
        issue: "HIGH: Heavy component statically imported",
        description: `${name} is statically imported; viewer-only modules should be code-split and client-only.`,
        line,
        column,
        fix: `Use: const ${name} = dynamic(() => import('...'), { ssr: false })`,
      });
    }
  }

  // 4) Barrel imports heuristic
  const barrel = /from\s+['"]@klorad\/(engine-cesium|engine-three|ion-sdk)['"];?/g;
  let mb: RegExpExecArray | null;
  while ((mb = barrel.exec(noiseFree))) {
    // Find the import specifier block near this match
    const start = Math.max(0, mb.index - 200);
    const snippet = raw.slice(start, mb.index + 200);
    const brace = snippet.match(/\{([^}]+)\}/);
    if (brace) {
      const count = brace[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean).length;
      if (count >= 4) {
        const { line, column } = posFromIndex(raw, mb.index);
        issues.medium.push({
          file: relative,
          issue: "MEDIUM: Barrel import with many symbols",
          description:
            "Large named-import sets from barrels often defeat optimal tree-shaking depending on build config.",
          line,
          column,
          fix: "Prefer deep, per-module imports and ensure ESM + sideEffects:false on the published package.",
        });
      }
    }
  }

  // 5) RSC fetch without cache config / with no-store
  if (serverish) {
    const fetchRe = /\bfetch\s*\(([\s\S]*?)\)/g;
    let mf: RegExpExecArray | null;
    while ((mf = fetchRe.exec(noiseFree))) {
      const callText = mf[0];
      const isAsset = /\.(?:jpg|jpeg|png|svg|gif|css|js|webp|ico)(?:['")?]|$)/i.test(callText);
      if (
        !/cache\s*:|revalidate\s*:|next\s*:\s*\{[^}]*revalidate\s*:/.test(callText) &&
        !isAsset
      ) {
        const { line, column } = posFromIndex(raw, mf.index);
        issues.medium.push({
          file: relative,
          issue: "MEDIUM: RSC fetch without cache/revalidate",
          description:
            "Server component fetch should specify ISR/edge caching to avoid default in-memory behavior.",
          line,
          column,
          fix: "Add { next: { revalidate: 3600 } } or { cache: 'force-cache' } as appropriate.",
        });
      }
      if (/no-store/.test(callText)) {
        const { line, column } = posFromIndex(raw, mf.index);
        issues.high.push({
          file: relative,
          issue: "HIGH: RSC fetch uses no-store",
          description: "no-store disables ISR and edge caching—only use when absolutely necessary.",
          line,
          column,
          fix: "Prefer revalidate windows unless true real-time data is required.",
        });
      }
    }
  }

  // 6) Heavy libs in global layouts/templates/not-found/error
  const isGlobalShell = /(?:^|\/)(layout|template|not-found|error)\.(tsx|ts|jsx|js)$/.test(filePath);
  if (isGlobalShell) {
    const heavy = /(from\s+['"]cesium['"])|(from\s+['"]three['"])|(from\s+['"]@react-three)/g;
    let mh: RegExpExecArray | null;
    while ((mh = heavy.exec(noiseFree))) {
      const { line, column } = posFromIndex(raw, mh.index);
      issues.critical.push({
        file: relative,
        issue: "CRITICAL: Heavy lib imported in app shell",
        description: "Heavy import in a global shell loads on every route. Expect catastrophic bundle bloat.",
        line,
        column,
        fix: "Move viewer code behind per-route dynamic imports with ssr:false.",
      });
    }
  }
}

// ---- Run ----
console.log(`🔍 RSC Boundaries & Bundle Audit scanning: ${rootDir}\n`);

const files = listFiles(rootDir);

for (const f of files) {
  try {
    const src = fs.readFileSync(f, "utf8");
    analyzeFile(f, src);
  } catch {
    // Ignore unreadable files
  }
}

// ---- Output ----
const summary = {
  critical: issues.critical.length,
  high: issues.high.length,
  medium: issues.medium.length,
};

if (outputJSON) {
  console.log(JSON.stringify({ summary, issues }, null, 2));
} else {
  const hr = () => console.log("".padEnd(80, "="));
  hr();
  console.log("RSC BOUNDARIES & BUNDLE AUDIT REPORT");
  hr();
  const printBucket = (label: string, bucket: Issue[]) => {
    if (bucket.length === 0) return;
    console.log(`\n${label}: ${bucket.length}`);
    console.log("-".repeat(80));
    bucket.forEach((it, i) => {
      console.log(`\n${i + 1}. ${it.issue}`);
      console.log(
        `   File: ${it.file}${it.line ? `:${it.line}${it.column ? `:${it.column}` : ""}` : ""}`
      );
      console.log(`   ${it.description}`);
      if (it.fix) console.log(`   Fix: ${it.fix}`);
    });
  };
  printBucket("🔴 CRITICAL", issues.critical);
  printBucket("🟡 HIGH", issues.high);
  printBucket("🟢 MEDIUM", issues.medium);
  hr();
  console.log("SUMMARY");
  hr();
  console.log(`Critical: ${summary.critical}`);
  console.log(`High:     ${summary.high}`);
  console.log(`Medium:   ${summary.medium}\n`);
}

if (summary.critical > 0) {
  console.log("❌ Audit failed — fix critical issues.");
  process.exit(2);
}
if (summary.high > 0) {
  console.log("⚠️  Audit passed with warnings.");
  process.exit(1);
}
console.log("✅ Audit passed");
process.exit(0);
