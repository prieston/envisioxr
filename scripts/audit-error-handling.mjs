#!/usr/bin/env node

/**
 * Error Boundary & Failure Handling Audit
 *
 * Checks for:
 * - Components that perform side-effects without fallback
 * - Missing try/catch around Cesium async APIs
 * - Upload workflows without onError UI recovery
 * - White screen risks
 * - Stuck loading states
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

let issues = {
  critical: [],
  high: [],
  medium: [],
};

function findReactFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && file !== ".next") {
        findReactFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx|ts)$/)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function analyzeFile(filePath, content) {
  const relativePath = path.relative(workspaceRoot, filePath);

  // Check 1: Cesium async APIs without try/catch
  const cesiumAsyncPatterns = [
    /\.pickPosition\(/,
    /\.pickEllipsoid\(/,
    /\.flyTo\(/,
    /\.zoomTo\(/,
    /\.entities\.add\(/,
    /\.primitives\.add\(/,
    /Ion\.Resource\.load/,
    /Cesium\.Ion\.fromAssetId/,
  ];

  for (const pattern of cesiumAsyncPatterns) {
    if (pattern.test(content)) {
      // Check if wrapped in try/catch
      const lines = content.split("\n");
      const matchIndex = content.indexOf(pattern.source.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"));
      if (matchIndex !== -1) {
        const lineIndex = content.substring(0, matchIndex).split("\n").length;
        const contextStart = Math.max(0, lineIndex - 10);
        const contextEnd = Math.min(lines.length, lineIndex + 10);
        const context = lines.slice(contextStart, contextEnd).join("\n");

        if (!context.includes("try") && !context.includes("catch")) {
          issues.high.push({
            file: relativePath,
            issue: "HIGH: Cesium async API without error handling",
            description: `Cesium API call found without try/catch - may throw unhandled errors`,
            line: lineIndex,
            fix: "Wrap in try/catch: try { ... } catch (error) { logger.error(...) }",
          });
        }
      }
    }
  }

  // Check 2: Upload workflows without error handling
  if (content.includes("upload") || content.includes("Upload")) {
    const uploadPatterns = [
      /fetch.*upload/i,
      /FormData/i,
      /\.upload\(/,
    ];

    const hasUpload = uploadPatterns.some(p => p.test(content));
    if (hasUpload) {
      const hasErrorHandling = content.includes("catch") || content.includes("onError") || content.includes("error");
      if (!hasErrorHandling) {
        issues.critical.push({
          file: relativePath,
          issue: "CRITICAL: Upload workflow without error handling",
          description: "Upload operations without error recovery - users may see stuck states",
          line: findLineNumber(content, "upload"),
          fix: "Add error handling with user-facing error messages",
        });
      }
    }
  }

  // Check 3: Async operations without loading state
  const asyncPatterns = [
    /await\s+fetch\(/,
    /\.then\(/,
    /async\s+function/,
  ];

  for (const pattern of asyncPatterns) {
    if (pattern.test(content)) {
      const hasLoadingState = content.includes("loading") || content.includes("isLoading") || content.includes("setLoading");
      const hasErrorState = content.includes("error") || content.includes("catch");

      if (!hasLoadingState && !hasErrorState) {
        issues.medium.push({
          file: relativePath,
          issue: "MEDIUM: Async operation without loading/error state",
          description: "Async operation found but no loading or error state management",
          line: findLineNumber(content, pattern.source),
          fix: "Add loading and error state for better UX",
        });
      }
    }
  }

  // Check 4: Components without ErrorBoundary usage
  // This is more of a structural check - we'll flag critical components
  const criticalComponents = [
    "CesiumViewer",
    "Scene",
    "SceneCanvas",
  ];

  const isCritical = criticalComponents.some(c => relativePath.includes(c));
  if (isCritical && !content.includes("ErrorBoundary") && !content.includes("error boundary")) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: Critical component not wrapped in ErrorBoundary",
      description: "Critical rendering component should be wrapped in ErrorBoundary",
      line: findLineNumber(content, "export"),
      fix: "Wrap component in ErrorBoundary to prevent white screens",
    });
  }

  // Check 5: Side effects in render without error handling
  if (content.includes("useEffect") && content.match(/\.(add|remove|set|update)/)) {
    const effectPattern = /useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[.*?\]\)/g;
    const matches = [...content.matchAll(effectPattern)];

    for (const match of matches) {
      const effectBody = match[1];
      if (effectBody.match(/\.(add|remove|set|update)/) && !effectBody.includes("try") && !effectBody.includes("catch")) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: Side effect in useEffect without error handling",
          description: "useEffect performs side effects but no error handling",
          line: findLineNumber(content, match[0]),
          fix: "Wrap side effects in try/catch to prevent silent failures",
        });
      }
    }
  }

  // Check 6: Ion SDK operations without error handling
  if (content.includes("Ion") || content.includes("ion")) {
    const ionPatterns = [
      /Ion\.Resource\.load/,
      /fromAssetId/,
      /createAsset/,
      /uploadAsset/,
    ];

    for (const pattern of ionPatterns) {
      if (pattern.test(content)) {
        const context = extractContext(content, pattern);
        if (!context.includes("try") && !context.includes("catch")) {
          issues.high.push({
            file: relativePath,
            issue: "HIGH: Ion SDK operation without error handling",
            description: "Ion SDK operations can fail - need error handling",
            line: findLineNumber(content, pattern.source),
            fix: "Wrap Ion SDK calls in try/catch with user feedback",
          });
        }
      }
    }
  }
}

function extractContext(content, pattern) {
  const index = content.search(pattern);
  if (index === -1) return "";
  const start = Math.max(0, index - 500);
  const end = Math.min(content.length, index + 500);
  return content.substring(start, end);
}

function findLineNumber(content, searchString) {
  const regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const match = content.match(regex);
  if (!match) return null;
  const index = match.index;
  return content.substring(0, index).split("\n").length;
}

console.log("🔍 Running Error Boundary & Failure Handling Audit...\n");

const criticalFiles = [
  path.join(workspaceRoot, "apps/editor/app/components"),
  path.join(workspaceRoot, "apps/editor/app/api"),
  path.join(workspaceRoot, "packages/engine-cesium/src"),
];

for (const dir of criticalFiles) {
  if (fs.existsSync(dir)) {
    const files = findReactFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      analyzeFile(file, content);
    }
  }
}

console.log("=".repeat(80));
console.log("ERROR BOUNDARY & FAILURE HANDLING AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! All error paths are handled.");
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
  console.log("❌ Audit failed - Critical error handling issues");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);

