#!/usr/bin/env node

/**
 * Folder / Module Responsibility Boundaries Audit
 * 
 * Checks for:
 * - Files exceeding 300 lines
 * - UI components that also modify state (bad)
 * - Hooks that also do fetching (should split)
 * - Package boundaries are clean
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
  const lines = content.split("\n");
  const lineCount = lines.length;
  
  // Check 1: Files exceeding 300 lines
  if (lineCount > 300) {
    const severity = lineCount > 500 ? "critical" : lineCount > 400 ? "high" : "medium";
    issues[severity].push({
      file: relativePath,
      issue: `${severity.toUpperCase()}: File exceeds ${lineCount > 500 ? "500" : "300"} lines`,
      description: `File has ${lineCount} lines - should be split into smaller modules`,
      line: null,
      fix: `Split into smaller components/hooks (target: <300 lines)`,
    });
  }
  
  // Check 2: UI components that also modify state
  if (content.includes("React.FC") || content.includes("React.Component")) {
    const hasStateModification = content.match(/setState|set[A-Z]\w+\(|useSceneStore.*set/) !== null;
    const hasFetching = content.match(/fetch\(|axios\.|\.get\(|\.post\(/) !== null;
    
    if (hasStateModification && hasFetching) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: UI component does both rendering and data fetching",
        description: "Component mixes UI rendering with data fetching - violates separation of concerns",
        line: findLineNumber(content, "React.FC") || findLineNumber(content, "Component"),
        fix: "Extract data fetching to custom hook or service",
      });
    } else if (hasStateModification && lineCount > 200) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: Large UI component modifies state",
        description: "Component handles UI and state management - consider splitting",
        line: findLineNumber(content, "setState"),
        fix: "Move state management to hook or separate component",
      });
    }
  }
  
  // Check 3: Hooks that also do fetching
  if (content.includes("function use") || content.match(/const\s+use\w+\s*=/)) {
    const hasFetching = content.match(/fetch\(|axios\.|\.get\(|\.post\(/) !== null;
    const hasStateManagement = content.match(/useState|useReducer|useSceneStore/) !== null;
    
    if (hasFetching && hasStateManagement && lineCount > 150) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Hook combines fetching and state management",
        description: "Hook does both data fetching and state management - should be split",
        line: findLineNumber(content, "use"),
        fix: "Split into separate hooks: useFetchData and useManageState",
      });
    }
  }
  
  // Check 4: Package boundary violations
  // Check if packages import from apps or vice versa incorrectly
  if (relativePath.startsWith("packages/")) {
    // Packages should not import from apps
    if (content.match(/from\s+["']\.\.\/apps\//) || content.match(/from\s+["']@envisioxr\//)) {
      issues.critical.push({
        file: relativePath,
        issue: "CRITICAL: Package imports from app",
        description: "Packages should not depend on apps - violates dependency direction",
        line: findLineNumber(content, "from"),
        fix: "Move shared code to packages or refactor dependency",
      });
    }
  }
  
  // Check 5: Mixed concerns in single file
  const concerns = {
    rendering: /return\s*\(|JSX|React\.createElement/,
    state: /useState|useReducer|useSceneStore|useWorldStore/,
    fetching: /fetch\(|axios|\.get\(|\.post\(/,
    sideEffects: /useEffect/,
    utils: /function\s+\w+\(|const\s+\w+\s*=\s*\(/,
  };
  
  const activeConcerns = Object.entries(concerns)
    .filter(([_, pattern]) => pattern.test(content))
    .map(([name]) => name);
  
  if (activeConcerns.length >= 4 && lineCount > 200) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: File mixes multiple concerns",
      description: `File handles: ${activeConcerns.join(", ")} - consider splitting`,
      line: null,
      fix: "Split into separate files by concern",
    });
  }
  
  // Check 6: Store files that are too large
  if (relativePath.includes("Store.ts") || relativePath.includes("store.ts")) {
    if (lineCount > 500) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Store file exceeds 500 lines",
        description: `Store has ${lineCount} lines - should be split into slices`,
        line: null,
        fix: "Split store into multiple slices using Zustand slices pattern",
      });
    }
  }
}

function findLineNumber(content, searchString) {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

console.log("🔍 Running Folder / Module Responsibility Boundaries Audit...\n");

const allFiles = [
  path.join(workspaceRoot, "apps/editor/app/components"),
  path.join(workspaceRoot, "apps/editor/app/hooks"),
  path.join(workspaceRoot, "packages"),
];

for (const dir of allFiles) {
  if (fs.existsSync(dir)) {
    const files = findReactFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      analyzeFile(file, content);
    }
  }
}

console.log("=".repeat(80));
console.log("FOLDER / MODULE RESPONSIBILITY BOUNDARIES AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! Module boundaries are clean.");
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
  console.log("❌ Audit failed - Critical boundary violations");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);

