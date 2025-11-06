#!/usr/bin/env node

/**
 * Hydration & SSR/CSR Mismatch Audit
 *
 * Checks for:
 * - Cesium components rendered on server
 * - window/document usage in RSC
 * - Missing "use client" on Cesium components
 * - Double mount causing leaks
 * - Server-side Cesium imports
 * - Shared non-client modules importing Cesium
 * - Module-scope side effects
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
  "storybook-static",
  "coverage",
  "cypress",
  "e2e",
  "public",
  "vendor",
]);

const IGNORE_FILE_RE = /\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/;

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findLineFromRegex(content: string, re: RegExp): number | null {
  re.lastIndex = 0;
  const m = re.exec(content);
  if (!m || m.index === undefined) return null;
  const upto = content.slice(0, m.index);
  return upto.split("\n").length;
}

function findReactFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        findReactFiles(filePath, fileList);
      }
    } else if (
      /\.(tsx|ts|jsx|js)$/.test(entry.name) &&
      !IGNORE_FILE_RE.test(entry.name)
    ) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function analyzeFile(filePath: string, content: string) {
  const relativePath = path.relative(workspaceRoot, filePath);
  const inApp = filePath.includes(`${path.sep}app${path.sep}`);
  const isExplicitClient = /\.client\.(t|j)sx?$/.test(filePath);
  const isClient =
    isExplicitClient ||
    content.includes('"use client"') ||
    content.includes("'use client'");
  const isServerComponent = inApp && !isClient;

  // Check 1: Cesium imports in server components
  const cesiumImportRe =
    /import\s+.*from\s+['"](?:cesium|@cesium\/engine)[^'"]*['"]/;
  if (isServerComponent && cesiumImportRe.test(content)) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Cesium imported in server component",
      description:
        "Cesium is client-only. Importing in an RSC causes hydration mismatches.",
      line: findLineFromRegex(content, cesiumImportRe),
      fix: "Move to a client component or wrap with dynamic(() => import(...), { ssr: false }).",
    });
  }

  // Check 2: Cesium imports in shared non-client modules
  if (
    !isClient &&
    filePath.includes(`${path.sep}packages${path.sep}`) &&
    cesiumImportRe.test(content)
  ) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Cesium imported in shared non-client module",
      description: "Shared module imports will pull Cesium into RSC trees.",
      line: findLineFromRegex(content, cesiumImportRe),
      fix: "Mark the module as client-only (.client.tsx) or refactor to lazy client boundary.",
    });
  }

  // Check 3: Browser APIs in server components (ignore guarded code)
  const hasWindowGuard = /typeof\s+window\s*!==\s*['"]undefined['"]/.test(
    content
  );
  const browserRe =
    /(window\.|document\.|navigator\.|localStorage|sessionStorage)/;
  if (isServerComponent && browserRe.test(content) && !hasWindowGuard) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Browser API used in server component",
      description: "Accessing browser APIs in RSCs breaks hydration.",
      line: findLineFromRegex(content, browserRe),
      fix: "Move into a client component or guard with typeof window !== 'undefined'.",
    });
  }

  // Check 4: Cesium components without 'use client' in app/ only
  const cesiumUsageRe = /(new\s+Cesium\.Viewer|Cesium3DTileset|<CesiumViewer)/;
  if (inApp && !isClient && cesiumUsageRe.test(content)) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Cesium usage in server component",
      description: "Cesium usage requires a client boundary.",
      line: findLineFromRegex(content, cesiumUsageRe),
      fix: 'Add "use client" or isolate the Cesium part behind a client component.',
    });
  }

  // Check 5: useEffect init without guard or cleanup
  const effectRe =
    /useEffect\s*\(\s*\([\s\S]*?\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
  for (const m of content.matchAll(effectRe)) {
    const body = m[1];
    if (
      /(new\s+Cesium|Cesium\.Viewer|\.primitives\.add|\.entities\.add)/.test(
        body
      )
    ) {
      const guarded =
        /(initialized|initRef|createdRef|mountedRef|hasMountedRef|onceRef)\.current/.test(
          body
        );
      const hasCleanup =
        /return\s*\(\s*=>\s*\{[\s\S]*?(destroy|remove|dispose)/i.test(body);
      if (!guarded && !hasCleanup) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: Cesium resources initialized without guard or cleanup",
          description:
            "Double-mount in dev can duplicate resources and leak on hydrate.",
          line: findLineFromRegex(content, effectRe),
          fix: "Gate with a ref and add a disposal cleanup that runs before re-init.",
        });
      }
    }
  }

  // Check 6: Dynamic import without ssr:false for Cesium
  const dynNoSSR =
    /dynamic\s*\(\s*\(\s*=>\s*import\((['"])([^'"]+)\1\)\s*\)\s*(?:,\s*\{[^}]*\})?\s*\)/g;
  for (const m of content.matchAll(dynNoSSR)) {
    const full = m[0];
    const mod = m[2];
    const isCesiumish = /^(cesium|@cesium\/engine|@?envisio\/ion-sdk)/i.test(
      mod
    );
    const hasSSRFalse = /\{\s*[^}]*ssr\s*:\s*false[^}]*\}/.test(full);
    if (isCesiumish && !hasSSRFalse) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Dynamic Cesium import without ssr:false",
        description: "Next must skip SSR for Cesium-bearing modules.",
        line: findLineFromRegex(content, new RegExp(escapeRegExp(full))),
        fix: "Use dynamic(() => import(mod), { ssr: false }).",
      });
    }
  }

  // Check 7: Metadata/generateMetadata in client files
  if (isClient) {
    if (/export\s+const\s+metadata\s*=/.test(content)) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: Metadata export in client component",
        description: "Metadata can only be exported from server components.",
        line: findLineFromRegex(content, /export\s+const\s+metadata\s*=/),
        fix: "Move metadata to parent server component or layout.",
      });
    }
    if (/export\s+async\s+function\s+generateMetadata/.test(content)) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: generateMetadata in client component",
        description: "Metadata functions must be on server components.",
        line: findLineFromRegex(
          content,
          /export\s+async\s+function\s+generateMetadata/
        ),
        fix: "Move it to a layout/page server component.",
      });
    }
  }

  // Check 8: Module-scope Cesium side effects
  const moduleScopeCesium =
    /^\s*(?!.*useEffect)[\s\S]*\bnew\s+Cesium\.Viewer\b/m.test(content);
  if (moduleScopeCesium) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Cesium Viewer constructed at module scope",
      description:
        "Side-effects at import time break SSR/CSR boundaries and hot reload.",
      line: findLineFromRegex(content, /\bnew\s+Cesium\.Viewer\b/),
      fix: "Move construction inside a client-only effect with cleanup.",
    });
  }
}

// Main execution
console.log("🔍 Running Hydration & SSR/CSR Mismatch Audit...\n");

const appDir = path.join(workspaceRoot, "apps/editor/app");
const packagesDir = path.join(workspaceRoot, "packages");

const files: string[] = [];
if (fs.existsSync(appDir)) {
  files.push(...findReactFiles(appDir));
}
if (fs.existsSync(packagesDir)) {
  files.push(...findReactFiles(packagesDir));
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  analyzeFile(file, content);
}

// Generate report
console.log("=".repeat(80));
console.log("HYDRATION & SSR/CSR MISMATCH AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (
  issues.critical.length === 0 &&
  issues.high.length === 0 &&
  issues.medium.length === 0
) {
  console.log("✅ No issues found! SSR/CSR boundaries are correct.");
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
