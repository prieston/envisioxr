#!/usr/bin/env node

/**
 * WebGL Resource Lifecycle Audit (Public API Only)
 *
 * Checks for:
 * - ImageryLayers removed without destroy=true
 * - DataSources removed without destroy=true
 * - Primitive/Collection instances not destroyed
 * - PostProcessStage instances not removed/destroyed
 * - ScreenSpaceEventHandler not destroyed
 * - Event listeners not removed
 * - Viewer instances not destroyed in React components
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

function findFiles(dir: string, out: string[] = []): string[] {
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

function lineFromIndex(content: string, index: number | undefined | null): number | null {
  if (index == null || index < 0) return null;
  let line = 1;
  let i = 0;
  while ((i = content.indexOf("\n", i)) !== -1 && i < index) {
    line++;
    i++;
  }
  return line;
}

function columnFromIndex(content: string, index: number | undefined | null): number | null {
  if (index == null || index < 0) return null;
  const lastNewline = content.lastIndexOf("\n", index);
  return index - lastNewline;
}

function pushIssue(
  bucket: "critical" | "high" | "medium",
  filePath: string,
  content: string,
  issue: string,
  description: string,
  index: number | undefined | null,
  fix: string
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

function checkDestroyArgument(
  content: string,
  match: RegExpMatchArray,
  argIndex: number,
  _resourceName: string
): boolean {
  if (match.index === undefined) return false;
  const callStart = match.index + match[0].length;
  let depth = 0;
  let argCount = 0;
  let inString = false;
  let stringChar = "";
  let argStart = callStart;

  // Skip whitespace
  while (argStart < content.length && /\s/.test(content[argStart])) {
    argStart++;
  }

  // If looking for first argument (argIndex 0), check immediately after opening paren
  if (argIndex === 0) {
    const firstArg = content.slice(argStart).match(/^([^,)]+)/);
    if (firstArg) {
      const argValue = firstArg[1].trim();
      return argValue === "true" || /^\{\s*[^}]*destroy\s*:\s*true/.test(argValue);
    }
    return false;
  }

  // For subsequent arguments, find the comma-separated position
  for (let i = callStart; i < content.length; i++) {
    const char = content[i];
    if (inString) {
      if (char === stringChar && (i === 0 || content[i - 1] !== "\\")) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      if (depth === 0) {
        // Reached end of call - argIndex not found
        return false;
      }
      depth--;
    } else if (depth === 0 && char === ",") {
      argCount++;
      if (argCount === argIndex) {
        // Found the argument position, check next token
        const rest = content.slice(i + 1).trim();
        const argMatch = rest.match(/^([^,)]+)/);
        if (argMatch) {
          const argValue = argMatch[1].trim();
          return argValue === "true" || /^\{\s*[^}]*destroy\s*:\s*true/.test(argValue);
        }
        return false;
      }
    }
  }
  return false;
}

function analyzeFile(filePath: string, content: string) {
  // Check 1: ImageryLayers removed without destroy=true
  const imageryRemoveRe = /\.imageryLayers\.remove\s*\(/g;
  for (const m of content.matchAll(imageryRemoveRe)) {
    if (m.index === undefined) continue;
    // Check if 2nd argument is true
    const hasDestroy = checkDestroyArgument(content, m, 1, "imageryLayer");
    if (!hasDestroy) {
      pushIssue(
        "critical",
        filePath,
        content,
        "CRITICAL: ImageryLayer removed without destroy=true",
        "Removing imagery layers without destroy=true leaks WebGL resources.",
        m.index,
        "Use imageryLayers.remove(layer, true) to properly destroy resources."
      );
    }
  }

  const imageryRemoveAllRe = /\.imageryLayers\.removeAll\s*\(/g;
  for (const m of content.matchAll(imageryRemoveAllRe)) {
    if (m.index === undefined) continue;
    // Check if 1st argument is true
    const hasDestroy = checkDestroyArgument(content, m, 0, "imageryLayers");
    if (!hasDestroy) {
      pushIssue(
        "critical",
        filePath,
        content,
        "CRITICAL: ImageryLayers.removeAll() called without destroy=true",
        "removeAll() without destroy leaks WebGL resources.",
        m.index,
        "Use imageryLayers.removeAll(true) to properly destroy all layers."
      );
    }
  }

  // Check 2: DataSources removed without destroy=true
  const dataSourceRemoveRe = /\.dataSources\.remove\s*\(/g;
  for (const m of content.matchAll(dataSourceRemoveRe)) {
    if (m.index === undefined) continue;
    const hasDestroy = checkDestroyArgument(content, m, 1, "dataSource");
    if (!hasDestroy) {
      pushIssue(
        "critical",
        filePath,
        content,
        "CRITICAL: DataSource removed without destroy=true",
        "DataSources must be removed with destroy=true to clean up WebGL resources.",
        m.index,
        "Use viewer.dataSources.remove(ds, true) to properly destroy."
      );
    }
  }

  const dataSourceRemoveAllRe = /\.dataSources\.removeAll\s*\(/g;
  for (const m of content.matchAll(dataSourceRemoveAllRe)) {
    if (m.index === undefined) continue;
    const hasDestroy = checkDestroyArgument(content, m, 0, "dataSources");
    if (!hasDestroy) {
      pushIssue(
        "critical",
        filePath,
        content,
        "CRITICAL: DataSources.removeAll() called without destroy=true",
        "removeAll() without destroy leaks WebGL resources.",
        m.index,
        "Use viewer.dataSources.removeAll(true) to properly destroy all data sources."
      );
    }
  }

  // Check 3: Primitive/Collection instances not destroyed
  const primitiveTypes = [
    "Primitive",
    "PrimitiveCollection",
    "BillboardCollection",
    "LabelCollection",
    "PointPrimitiveCollection",
    "PolylineCollection",
  ];

  for (const type of primitiveTypes) {
    const createRe = new RegExp(`new\\s+Cesium\\.${type}\\s*\\(`, "g");
    for (const m of content.matchAll(createRe)) {
      if (m.index === undefined) continue;
      // Try to extract variable name
      const before = content.slice(Math.max(0, m.index - 100), m.index);
      const varMatch = before.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
      const varName = varMatch ? varMatch[1] : null;

      // Check for cleanup: .remove(..., true), .removeAll(true), or .destroy()
      const after = content.slice(m.index);
      let hasCleanup = false;

      if (varName) {
        // Check for remove with destroy
        const removeWithDestroy = new RegExp(
          `\\.(primitives|scene\\.primitives)\\.remove\\s*\\(\\s*${varName}\\s*,\\s*true\\s*\\)`,
          "g"
        );
        if (removeWithDestroy.test(after)) hasCleanup = true;

        // Check for destroy() call
        const destroyCall = new RegExp(`${varName}\\.destroy\\s*\\(`, "g");
        if (destroyCall.test(after)) hasCleanup = true;
      }

      // Check for removeAll(true) in cleanup context
      if (/\.(primitives|scene\.primitives)\.removeAll\s*\(\s*true\s*\)/.test(after)) {
        hasCleanup = true;
      }

      // Check for destroy in useEffect cleanup or finally block
      if (/useEffect|finally|cleanup/.test(after) && /\.destroy\s*\(/.test(after)) {
        hasCleanup = true;
      }

      if (!hasCleanup) {
        pushIssue(
          "high",
          filePath,
          content,
          `HIGH: ${type} created but not destroyed`,
          `${type} instances must be destroyed or removed with destroy=true to release WebGL resources.`,
          m.index,
          `Call ${varName ? `${varName}.destroy()` : "destroy()"} in cleanup, or use scene.primitives.remove(instance, true).`
        );
      }
    }
  }

  // Check 4: PostProcessStage instances not removed/destroyed
  const postProcessAddRe = /\.postProcessStages\.add\s*\(/g;
  for (const m of content.matchAll(postProcessAddRe)) {
    if (m.index === undefined) continue;
    // Try to find if result is stored
    const after = content.slice(m.index);
    const varMatch = after.match(/^\s*\)\s*;?\s*(?:const|let|var)\s+(\w+)\s*=/);
    const varName = varMatch ? varMatch[1] : null;

    let hasCleanup = false;
    if (varName) {
      // Check for remove or destroy
      const removeRe = new RegExp(`\\.postProcessStages\\.remove\\s*\\(\\s*${varName}`, "g");
      const destroyRe = new RegExp(`${varName}\\.destroy\\s*\\(`, "g");
      if (removeRe.test(after) || destroyRe.test(after)) {
        hasCleanup = true;
      }
    }

    // Check for removeAll in cleanup
    if (/\.postProcessStages\.removeAll\s*\(/.test(after) && /useEffect|finally|cleanup/.test(after)) {
      hasCleanup = true;
    }

    if (!hasCleanup) {
      pushIssue(
        "high",
        filePath,
        content,
        "HIGH: PostProcessStage added but not removed/destroyed",
        "PostProcessStages must be removed or destroyed to clean up framebuffers.",
        m.index,
        `Store the stage reference and call postProcessStages.remove(stage) or stage.destroy() in cleanup.`
      );
    }
  }

  // Check 5: ScreenSpaceEventHandler not destroyed
  const handlerCreateRe = /new\s+Cesium\.ScreenSpaceEventHandler\s*\(/g;
  for (const m of content.matchAll(handlerCreateRe)) {
    if (m.index === undefined) continue;
    // Extract variable name
    const before = content.slice(Math.max(0, m.index - 100), m.index);
    const varMatch = before.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
    const varName = varMatch ? varMatch[1] : null;

    const after = content.slice(m.index);
    let hasDestroy = false;

    if (varName) {
      const destroyRe = new RegExp(`${varName}\\.destroy\\s*\\(`, "g");
      if (destroyRe.test(after)) hasDestroy = true;
    }

    // Check in cleanup context
    if (/useEffect|finally|cleanup/.test(after) && /\.destroy\s*\(/.test(after)) {
      hasDestroy = true;
    }

    if (!hasDestroy) {
      pushIssue(
        "high",
        filePath,
        content,
        "HIGH: ScreenSpaceEventHandler not destroyed",
        "ScreenSpaceEventHandler must be destroyed to clean up event listeners.",
        m.index,
        `Call ${varName ? `${varName}.destroy()` : "handler.destroy()"} in cleanup function.`
      );
    }
  }

  // Check 6: Event listeners not removed
  const eventListenerRe = /\.(postRender|preRender|postUpdate|preUpdate)\.addEventListener\s*\(/g;
  for (const m of content.matchAll(eventListenerRe)) {
    if (m.index === undefined) continue;
    const eventType = m[1];
    const after = content.slice(m.index);
    // Check for corresponding removeEventListener
    const removeRe = new RegExp(`\\.${eventType}\\.removeEventListener`, "g");
    if (!removeRe.test(after)) {
      pushIssue(
        "high",
        filePath,
        content,
        `HIGH: ${eventType} event listener not removed`,
        `Event listeners added with addEventListener must be removed with removeEventListener.`,
        m.index,
        `Store the listener function and call scene.${eventType}.removeEventListener(listener) in cleanup.`
      );
    }
  }

  // Check 7: Viewer instances not destroyed in React components
  const viewerCreateRe = /new\s+Cesium\.Viewer\s*\(/g;
  const isReactFile = /\.(tsx|jsx)$/.test(filePath) || content.includes("useEffect") || content.includes("React");

  if (isReactFile) {
    for (const m of content.matchAll(viewerCreateRe)) {
      if (m.index === undefined) continue;
      // Extract variable name
      const before = content.slice(Math.max(0, m.index - 100), m.index);
      const varMatch = before.match(/(?:const|let|var)\s+(\w+)\s*=\s*$/);
      const varName = varMatch ? varMatch[1] : null;

      const after = content.slice(m.index);
      let hasDestroy = false;

      if (varName) {
        const destroyRe = new RegExp(`${varName}\\.destroy\\s*\\(`, "g");
        if (destroyRe.test(after)) hasDestroy = true;
      }

      // Check in useEffect cleanup
      if (/useEffect\s*\([^)]*=>\s*\{[\s\S]*return\s*\(?\s*\(?\s*\)?\s*=>\s*\{[\s\S]*\.destroy\s*\(/.test(after)) {
        hasDestroy = true;
      }

      if (!hasDestroy) {
        pushIssue(
          "critical",
          filePath,
          content,
          "CRITICAL: Viewer created in React component but not destroyed",
          "Viewer instances must be destroyed on component unmount to prevent memory leaks.",
          m.index,
          `Call ${varName ? `${varName}.destroy()` : "viewer.destroy()"} in useEffect cleanup function.`
        );
      }
    }
  }
}

// Main execution
console.log("🔍 Running WebGL Resource Lifecycle Audit (Public API Only)...\n");

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
  if (content.includes("Cesium") || content.includes("cesium")) {
    analyzeFile(file, content);
  }
}

// Generate report
console.log("=".repeat(80));
console.log("WEBGL RESOURCE LIFECYCLE AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! WebGL resources are properly managed.");
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
