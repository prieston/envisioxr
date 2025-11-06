#!/usr/bin/env node

/**
 * Network & Tiling Audit
 *
 * Checks for:
 * - HTTP cache headers for imagery/terrain endpoints
 * - Throttling/backoff on tile errors
 * - Spamming metadata endpoints
 * - Multiple CreditDisplays
 * - Duplicate Ion initializations
 * - Missing request throttling
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const issues = {
  critical: [],
  high: [],
  medium: [],
};

function findReactFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".next") {
        findReactFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function findLineNumber(content: string, searchString: string): number | null {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

function analyzeFile(filePath: string, content: string) {
  const relativePath = path.relative(workspaceRoot, filePath);

  // Check 1: Multiple CreditDisplays
  const creditDisplayPattern = /new\s+Cesium\.CreditDisplay\(/g;
  const creditDisplays = [...content.matchAll(creditDisplayPattern)];

  if (creditDisplays.length > 1) {
    issues.high.push({
      file: relativePath,
      issue: "HIGH: Multiple CreditDisplays created",
      description: `Found ${creditDisplays.length} CreditDisplay instances - should reuse viewer's creditDisplay`,
      line: findLineNumber(content, creditDisplays[0][0]),
      fix: "Use viewer.creditDisplay instead of creating new instances",
    });
  }

  // Check 2: Duplicate Ion initializations
  const ionInitPattern =
    /Cesium\.Ion\.(defaultAccessToken|fromAccessToken)\s*=/g;
  const ionInits = [...content.matchAll(ionInitPattern)];

  if (ionInits.length > 1) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Multiple Cesium Ion initializations",
      description: `Found ${ionInits.length} Ion initializations - should initialize once`,
      line: findLineNumber(content, ionInits[0][0]),
      fix: "Initialize Cesium Ion once at app startup, not in multiple places",
    });
  }

  // Check 3: ImageryProvider without error handling/throttling
  const imageryProviderPattern =
    /new\s+Cesium\.(UrlTemplateImageryProvider|ArcGisMapServerImageryProvider|OpenStreetMapImageryProvider)/g;
  const imageryMatches = [...content.matchAll(imageryProviderPattern)];

  for (const match of imageryMatches) {
    const afterCreation = content.substring(match.index!, match.index! + 500);
    // Check for error event handler
    if (!afterCreation.match(/errorEvent|tileErrorEvent|tileFailedEvent/)) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: ImageryProvider without error handling",
        description: `${match[1]} created without error event handler - failed tiles may spam requests`,
        line: findLineNumber(content, match[0]),
        fix: "Add errorEvent.addEventListener to handle tile failures with backoff",
      });
    }
  }

  // Check 4: TerrainProvider without error handling
  const terrainProviderPattern =
    /new\s+Cesium\.(EllipsoidTerrainProvider|ArcGisMapServerTerrainProvider|CesiumTerrainProvider)/g;
  const terrainMatches = [...content.matchAll(terrainProviderPattern)];

  for (const match of terrainMatches) {
    const afterCreation = content.substring(match.index!, match.index! + 500);
    if (!afterCreation.match(/errorEvent|tileErrorEvent/)) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: TerrainProvider without error handling",
        description: `${match[1]} created without error event handler`,
        line: findLineNumber(content, match[0]),
        fix: "Add errorEvent.addEventListener for terrain tile failures",
      });
    }
  }

  // Check 5: Fetch calls without cache headers or throttling
  const fetchPattern = /fetch\s*\([^)]*\)/g;
  const fetchMatches = [...content.matchAll(fetchPattern)];

  for (const match of fetchMatches) {
    const fetchCall = match[0];
    // Check if it's fetching imagery/terrain/tiles
    if (fetchCall.match(/imagery|terrain|tiles|tile|ion/)) {
      // Check for cache headers
      if (!fetchCall.match(/cache|Cache-Control|headers/)) {
        issues.medium.push({
          file: relativePath,
          issue: "MEDIUM: Tile fetch without cache headers",
          description:
            "Fetching tiles without cache headers may cause unnecessary network requests",
          line: findLineNumber(content, match[0]),
          fix: "Add cache headers: { headers: { 'Cache-Control': 'public, max-age=3600' } }",
        });
      }
    }
  }

  // Check 6: Metadata endpoint calls in loops or frequently
  const metadataPattern =
    /fetch.*metadata|fetch.*asset.*metadata|ion.*asset.*metadata/gi;
  const metadataMatches = [...content.matchAll(metadataPattern)];

  for (const match of metadataMatches) {
    const context = extractContext(content, match.index!);
    // Check if it's in a loop or frequently called function
    if (context?.match(/for\s*\(|while\s*\(|\.map\s*\(|useEffect.*\[\]/)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Metadata endpoint called in loop",
        description: "Fetching metadata in loops causes excessive API calls",
        line: findLineNumber(content, match[0]),
        fix: "Cache metadata or fetch once outside the loop",
      });
    }
  }

  // Check 7: RequestAnimationFrame without throttling for network calls
  const rafPattern = /requestAnimationFrame\s*\(/g;
  const rafMatches = [...content.matchAll(rafPattern)];

  for (const match of rafMatches) {
    const callback = extractCallbackBody(content, match.index!);
    if (callback && callback.match(/fetch|axios|request/)) {
      issues.critical.push({
        file: relativePath,
        issue: "CRITICAL: Network calls in requestAnimationFrame",
        description: "Making network requests every frame will spam servers",
        line: findLineNumber(content, match[0]),
        fix: "Throttle network calls or move outside animation loop",
      });
    }
  }

  // Check 8: Tile loading without retry/backoff logic
  const tileLoadPattern = /tileLoad|tileFailed|tileError/gi;
  const tileLoadMatches = [...content.matchAll(tileLoadPattern)];

  for (const match of tileLoadMatches) {
    const context = extractContext(content, match.index!);
    // Check for retry/backoff logic
    if (!context?.match(/retry|backoff|delay|setTimeout|throttle/i)) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: Tile error handling without retry/backoff",
        description:
          "Tile error handlers should implement retry with exponential backoff",
        line: findLineNumber(content, match[0]),
        fix: "Add retry logic with exponential backoff for failed tiles",
      });
    }
  }

  // Check 9: Multiple requests to same endpoint without debouncing
  const endpointPattern = /["']([^"']+\.(json|xml|geojson|czml))["']/g;
  const endpoints = new Map<string, number>();

  for (const match of content.matchAll(endpointPattern)) {
    const endpoint = match[1];
    endpoints.set(endpoint, (endpoints.get(endpoint) || 0) + 1);
  }

  for (const [endpoint, count] of endpoints.entries()) {
    if (count > 3) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: Same endpoint called multiple times",
        description: `Endpoint ${endpoint} referenced ${count} times - consider caching or debouncing`,
        line: findLineNumber(content, endpoint),
        fix: "Cache responses or debounce requests to same endpoint",
      });
    }
  }
}

function extractContext(content: string, index: number): string | null {
  const start = Math.max(0, index - 300);
  const end = Math.min(content.length, index + 200);
  return content.substring(start, end);
}

function extractCallbackBody(
  content: string,
  startIndex: number
): string | null {
  let depth = 0;
  let inBody = false;
  let body = "";
  let foundParen = false;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (char === "(") {
      foundParen = true;
      continue;
    }
    if (foundParen && char === "{") {
      depth++;
      inBody = true;
    }
    if (inBody) body += char;
    if (char === "}") {
      depth--;
      if (depth === 0 && inBody) return body;
    }
    if (depth === 0 && inBody && char === ")") break;
  }

  return null;
}

// Main execution
console.log("🔍 Running Network & Tiling Audit...\n");

const cesiumDir = path.join(workspaceRoot, "packages/engine-cesium/src");
const editorDir = path.join(workspaceRoot, "apps/editor/app");

const files: string[] = [];
if (fs.existsSync(cesiumDir)) {
  files.push(...findReactFiles(cesiumDir));
}
if (fs.existsSync(editorDir)) {
  files.push(...findReactFiles(editorDir));
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (
    content.includes("Cesium") ||
    content.includes("fetch") ||
    content.includes("Ion")
  ) {
    analyzeFile(file, content);
  }
}

// Generate report
console.log("=".repeat(80));
console.log("NETWORK & TILING AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (
  issues.critical.length === 0 &&
  issues.high.length === 0 &&
  issues.medium.length === 0
) {
  console.log("✅ No issues found! Network requests are optimized.");
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
  process.exit(1);
}

if (issues.high.length > 0) {
  console.log(
    "⚠️  Audit passed with warnings - High priority issues recommended"
  );
  process.exit(0);
}

console.log("✅ Audit passed");
process.exit(0);

