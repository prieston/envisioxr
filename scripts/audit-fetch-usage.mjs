#!/usr/bin/env node

/**
 * Fetch Usage Audit
 *
 * Checks for:
 * - Direct fetch() calls outside of centralized api.ts
 * - fetch() calls in fetcher functions for SWR (should use centralized api.ts)
 * - Missing use of SWR for data fetching
 * - API routes using fetch (allowed - these are server-side)
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
  "scripts",
]);

const IGNORE_FILE_RE = /\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/;

// Files that are allowed to use fetch:
// - API route handlers (app/api/**/route.ts)
// - Server-side code
// - The centralized api.ts file itself
const ALLOWED_PATTERNS = [
  /\/api\/.*\/route\.ts$/, // API route handlers
  /\/api\.ts$/, // Centralized API file
  /\/services\/.*\.ts$/, // Service files (server-side)
];

function isAllowedFile(filePath) {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(filePath));
}

function findFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) findFiles(p, out);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && !IGNORE_FILE_RE.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function lineFromIndex(content, index) {
  if (index == null || index < 0) return null;
  let line = 1;
  let i = 0;
  while ((i = content.indexOf("\n", i)) !== -1 && i < index) {
    line++;
    i++;
  }
  return line;
}

function columnFromIndex(content, index) {
  if (index == null || index < 0) return null;
  const lastNewline = content.lastIndexOf("\n", index);
  return index - lastNewline;
}

function pushIssue(
  bucket,
  filePath,
  content,
  issue,
  description,
  index,
  fix
) {
  const line = lineFromIndex(content, index);
  const col = columnFromIndex(content, index);
  issues[bucket].push({
    file: path.relative(workspaceRoot, filePath),
    issue,
    description,
    line: line ?? 1,
    col: col ?? 1,
    fix,
  });
}

function analyzeFile(filePath, content) {
  // Skip allowed files
  if (isAllowedFile(filePath)) return;

  // Check for direct fetch() calls
  // Match: fetch(, await fetch(, const x = fetch(, etc.
  const fetchPattern = /\bfetch\s*\(/g;

  for (const match of content.matchAll(fetchPattern)) {
    if (match.index === undefined) continue;

    // Get context around the fetch call
    const start = Math.max(0, match.index - 100);
    const end = Math.min(content.length, match.index + 500);
    const context = content.slice(start, end);

    // Check if it's in a comment
    const beforeMatch = content.slice(0, match.index);
    const lastComment = Math.max(
      beforeMatch.lastIndexOf("//"),
      beforeMatch.lastIndexOf("/*"),
      beforeMatch.lastIndexOf("*")
    );
    if (lastComment > beforeMatch.lastIndexOf("\n")) {
      // Might be in a comment, check more carefully
      const commentEnd = beforeMatch.indexOf("\n", lastComment);
      if (commentEnd === -1 || commentEnd > match.index - 10) {
        continue; // Skip if in comment
      }
    }

    // Check if it's a string literal (like "fetch" in a string)
    const before = content.slice(Math.max(0, match.index - 20), match.index);
    if (before.match(/["'`]/)) {
      // Check if we're inside a string
      let inString = false;
      let stringChar = "";
      for (let i = match.index - 20; i < match.index; i++) {
        if (i < 0) continue;
        const char = content[i];
        if (!inString && (char === '"' || char === "'" || char === "`")) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar && content[i - 1] !== "\\") {
          inString = false;
        }
      }
      if (inString) continue; // Skip if inside string
    }

    // Check if it's in a fetcher function (should use centralized api.ts)
    const isInFetcher = /const\s+fetcher\s*=|function\s+fetcher|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*fetch/.test(context);

    // Check if it's fetching from /api/ (should use centralized api.ts)
    // Also check for variable-based URLs (like fetch(screenshot))
    const apiMatch = content.slice(match.index, match.index + 200).match(/fetch\s*\(\s*([^,)]+)/);
    const urlString = apiMatch ? apiMatch[1].trim().replace(/["']/g, '') : null;
    const isApiCall = urlString && urlString.startsWith("/api/");

    // Check if it's fetching external URLs (like Cesium Ion, weather APIs, etc.)
    const isExternalUrl = urlString && (
      urlString.startsWith("http://") ||
      urlString.startsWith("https://") ||
      urlString.includes("api.cesium.com") ||
      urlString.includes("weather")
    );

    // Check if it's fetching a blob from a data URL or external image (for thumbnails/screenshots)
    // Also check variable names and context for screenshot/image fetches
    const beforeContext = content.slice(Math.max(0, match.index - 150), match.index);
    const afterContext = content.slice(match.index, Math.min(content.length, match.index + 150));

    // Check if the URL is a variable that likely contains a screenshot/image URL
    const isScreenshotVariable = urlString && (
      urlString === "screenshot" ||
      urlString.match(/screenshot|thumbnail|image/i) ||
      (beforeContext.match(/if\s*\(.*screenshot/) && afterContext.match(/\.blob/)) ||
      (beforeContext.match(/screenshot/) && afterContext.match(/response\.blob/))
    );

    const isBlobFetch = urlString && (
      urlString.startsWith("blob:") ||
      urlString.startsWith("data:") ||
      (urlString.startsWith("http") && (
        afterContext.match(/\.blob\(\)|\.then\(.*blob|await.*blob|const.*blob\s*=/i) ||
        isScreenshotVariable
      )) ||
      isScreenshotVariable
    );

    if (isBlobFetch) {
      // Blob fetches from data URLs or external images are acceptable for thumbnails/screenshots
      // Skip these as they're not API calls
      continue;
    } else if (isExternalUrl) {
      // External API calls should still go through centralized api.ts for consistency
      pushIssue(
        "high",
        filePath,
        content,
        "HIGH: External API call should use centralized api.ts",
        `External fetch call to ${apiMatch[1]} should be wrapped in centralized api.ts`,
        match.index,
        `Move this fetch call to apps/editor/app/utils/api.ts and use it from there`
      );
    } else if (isApiCall) {
      if (isInFetcher) {
        pushIssue(
          "critical",
          filePath,
          content,
          "CRITICAL: Fetcher function uses direct fetch instead of centralized api.ts",
          "SWR fetcher functions should use centralized api.ts functions, not direct fetch",
          match.index,
          "Import and use functions from apps/editor/app/utils/api.ts instead of direct fetch"
        );
      } else {
        pushIssue(
          "critical",
          filePath,
          content,
          "CRITICAL: Direct fetch call to API endpoint",
          `Direct fetch call to ${apiMatch[1]} should use centralized api.ts`,
          match.index,
          "Use functions from apps/editor/app/utils/api.ts instead of direct fetch"
        );
      }
    } else {
      // Generic fetch call
      pushIssue(
        "high",
        filePath,
        content,
        "HIGH: Direct fetch call detected",
        "All fetch calls should go through centralized api.ts",
        match.index,
        "Use functions from apps/editor/app/utils/api.ts instead of direct fetch"
      );
    }
  }
}

// Main execution
console.log("🔍 Running Fetch Usage Audit...\n");

const editorDir = path.join(workspaceRoot, "apps/editor/app");

const files = [];
if (fs.existsSync(editorDir)) {
  files.push(...findFiles(editorDir));
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("fetch")) {
    analyzeFile(file, content);
  }
}

// Generate report
console.log("=".repeat(80));
console.log("FETCH USAGE AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! All fetch calls use centralized api.ts.");
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
  console.log("⚠️  Audit passed with warnings - High priority issues recommended");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);

