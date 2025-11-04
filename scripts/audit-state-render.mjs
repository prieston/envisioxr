#!/usr/bin/env node

/**
 * State Management & Render Flow Audit
 *
 * Checks for:
 * - Components subscribing to entire store objects (bad)
 * - Hooks that derive state in render path (bad)
 * - Missing shallow or structural memoization
 * - setState inside useEffect without guards
 * - Zustand selector patterns
 * - Re-render triggers
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

const CRITICAL_COMPONENTS = [
  "SceneCanvas",
  "RightPanel",
  "IoTDevicePropertiesPanel",
  "CesiumFeatureProperties",
  "ModelPositioningManager",
  "useModelLoader",
];

let issues = {
  critical: [],
  high: [],
  medium: [],
  info: [],
};

// Recursively find all TypeScript/React files
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

  // Check 1: Entire store subscription (bad)
  const entireStorePattern = /const\s+\w+\s*=\s*use(Scene|World)Store\(\)/g;
  if (entireStorePattern.test(content)) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Component subscribes to entire store",
      description: "Subscribing to entire store causes re-render on ANY state change",
      line: findLineNumber(content, "useSceneStore()") || findLineNumber(content, "useWorldStore()"),
      fix: "Use selector: useSceneStore((s) => s.specificProperty)",
    });
  }

  // Check 2: Zustand selector without shallow comparison
  const selectorPattern = /use(Scene|World)Store\(\(.*?\)\s*=>\s*\{/gs;
  const selectorMatches = [...content.matchAll(selectorPattern)];
  for (const match of selectorMatches) {
    const selectorContent = extractSelectorBody(content, match.index);
    if (selectorContent && !selectorContent.includes("shallow") && selectorContent.includes("return")) {
      // Check if returning object/array (needs shallow)
      if (selectorContent.match(/return\s+\{/) || selectorContent.match(/return\s+\[/)) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: Selector returns new object/array without shallow comparison",
          description: "Returning new objects/arrays causes re-render even if values unchanged",
          line: findLineNumber(content, match[0]),
          fix: "Use shallow from zustand/shallow or extract only needed primitives",
        });
      }
    }
  }

  // Check 3: setState in useEffect without dependency guards
  const useEffectPattern = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[.*?\]\)/gs;
  const useEffectMatches = [...content.matchAll(useEffectPattern)];
  for (const match of useEffectMatches) {
    const effectBody = match[0].split("=>")[1]?.split("},")[0] || "";
    const deps = match[0].match(/\[(.*?)\]/)?.[1] || "";

    // Check for setState without guard
    if (effectBody.match(/setState|set[A-Z]\w+\(/)) {
      if (!effectBody.match(/if\s*\(|guard|check|return\s+early/i)) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: setState in useEffect without guard",
          description: "Can cause infinite loops or unnecessary re-renders",
          line: findLineNumber(content, match[0]),
          fix: "Add guard: if (!condition) return; before setState",
        });
      }
    }
  }

  // Check 4: Missing useMemo/useCallback for expensive computations
  const expensiveOps = [
    /\.map\(/,
    /\.filter\(/,
    /\.reduce\(/,
    /\.sort\(/,
    /\.find\(/,
    /Object\.entries/,
    /Object\.keys/,
  ];

  const renderBody = extractRenderBody(content);
  if (renderBody) {
    for (const pattern of expensiveOps) {
      if (pattern.test(renderBody)) {
        const matches = renderBody.match(pattern);
        if (matches && !content.includes("useMemo") && !content.includes("useCallback")) {
          issues.medium.push({
            file: relativePath,
            issue: "MEDIUM: Expensive operation in render without memoization",
            description: `Found ${pattern.source} in render body - consider useMemo`,
            line: findLineNumber(content, matches[0]),
            fix: "Wrap expensive computation in useMemo",
          });
          break; // Only report once per file
        }
      }
    }
  }

  // Check 5: Components without React.memo that receive props
  if (content.includes("export") && content.includes("React.FC") && !content.includes("React.memo")) {
    const propsMatch = content.match(/React\.FC<.*?\{([^}]+)\}/);
    if (propsMatch && propsMatch[1].includes(":")) {
      // Has props but no memo
      const isCritical = CRITICAL_COMPONENTS.some(c => relativePath.includes(c));
      if (isCritical) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: Critical component without React.memo",
          description: "Component receives props but not memoized - re-renders on parent updates",
          line: findLineNumber(content, "React.FC"),
          fix: "Wrap with React.memo()",
        });
      }
    }
  }

  // Check 6: Conditional hooks (React rules violation)
  // Only check React components/hooks, not store files
  if (!relativePath.includes("Store.ts") && !relativePath.includes("store.ts")) {
    // Extract component function bodies only
    const componentPattern = /(?:const\s+\w+\s*[:=]\s*React\.FC|export\s+(?:default\s+)?function\s+\w+|const\s+\w+\s*[:=]\s*\([^)]*\)\s*[:=]\s*\([^)]*\)\s*=>|export\s+(?:default\s+)?const\s+\w+\s*[:=]\s*React\.FC)/g;
    const componentMatches = [...content.matchAll(componentPattern)];

    for (const match of componentMatches) {
      // Extract the component body
      let depth = 0;
      let start = match.index;
      let inBody = false;
      let body = "";

      for (let i = start; i < content.length; i++) {
        const char = content[i];
        if (char === "{") {
          depth++;
          inBody = true;
        }
        if (inBody) body += char;
        if (char === "}") {
          depth--;
          if (depth === 0 && inBody) break;
        }
      }

      // Check for early return followed by hooks
      const returnMatch = body.match(/if\s*\([^)]+\)\s*\{[\s\S]*?return[\s\S]*?\}/);
      if (returnMatch) {
        const returnIndex = returnMatch.index;
        const hookMatch = body.substring(returnIndex + returnMatch[0].length).match(/(useState|useEffect|useMemo|useCallback|useSceneStore|useWorldStore)/);
        if (hookMatch) {
          issues.critical.push({
            file: relativePath,
            issue: "CRITICAL: Hook called after conditional return",
            description: "Hooks must be called unconditionally before any returns",
            line: findLineNumber(content, hookMatch[0]),
            fix: "Move hook calls before conditional return or use early return after all hooks",
          });
        }
      }
    }
  }

  // Check 7: Multiple store subscriptions in one component
  const storeSubscriptions = (content.match(/use(Scene|World)Store/g) || []).length;
  if (storeSubscriptions > 3) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: Too many store subscriptions",
      description: `Component has ${storeSubscriptions} store subscriptions - consider combining`,
      line: findLineNumber(content, "useSceneStore") || findLineNumber(content, "useWorldStore"),
      fix: "Combine multiple selectors into single subscription or split component",
    });
  }
}

function extractSelectorBody(content, startIndex) {
  let depth = 0;
  let inBody = false;
  let body = "";

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (char === "{") {
      depth++;
      inBody = true;
    }
    if (inBody) body += char;
    if (char === "}") {
      depth--;
      if (depth === 0 && inBody) break;
    }
  }

  return body;
}

function extractRenderBody(content) {
  const renderMatch = content.match(/return\s*\(([\s\S]*?)\)\s*;?\s*$/m);
  if (!renderMatch) {
    // Try without parentheses
    const returnMatch = content.match(/return\s+([\s\S]*?);/m);
    return returnMatch?.[1] || "";
  }
  return renderMatch[1] || "";
}

function findLineNumber(content, searchString) {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

function extractFunctionBodies(content) {
  const bodies = [];
  // Match function declarations and arrow functions
  const functionPattern = /(?:const\s+\w+\s*=\s*|function\s+\w+\s*\([^)]*\)\s*\{|\([^)]*\)\s*=>\s*\{)/g;
  let match;
  while ((match = functionPattern.exec(content)) !== null) {
    let depth = 0;
    let start = match.index + match[0].length;
    let body = "";

    for (let i = start; i < content.length; i++) {
      const char = content[i];
      if (char === "{") depth++;
      if (char === "}") {
        depth--;
        if (depth === 0) {
          body = content.substring(start, i);
          bodies.push(body);
          break;
        }
      }
    }
  }
  return bodies;
}

// Main execution
console.log("🔍 Running State Management & Render Flow Audit...\n");

const editorComponentsDir = path.join(workspaceRoot, "apps/editor/app/components");
const packagesDir = path.join(workspaceRoot, "packages");

// Analyze editor components
if (fs.existsSync(editorComponentsDir)) {
  const files = findReactFiles(editorComponentsDir);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    analyzeFile(file, content);
  }
}

// Analyze package components
if (fs.existsSync(packagesDir)) {
  const files = findReactFiles(packagesDir);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    analyzeFile(file, content);
  }
}

// Generate report
console.log("=".repeat(80));
console.log("STATE MANAGEMENT & RENDER FLOW AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! All components follow best practices.");
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
  console.log("⚠️  Audit passed with warnings - High priority issues recommended");
  process.exit(0);
}

console.log("✅ Audit passed");
process.exit(0);

