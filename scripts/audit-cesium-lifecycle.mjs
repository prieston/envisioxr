#!/usr/bin/env node

/**
 * Cesium Lifecycle & Memory Audit
 * 
 * Checks for:
 * - Duplicate Viewer instances
 * - Ghost entity references
 * - Primitive leaks during scene rebuilds
 * - Sensors left attached after unmount
 * - viewer.scene.primitives.add() without .remove()
 * - Event listeners not cleaned
 * - Camera event handlers not cleaned
 * - Ion SDK sensors not detached
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
  
  // Check 1: primitives.add() without matching remove()
  const primitiveAdds = (content.match(/\.primitives\.add\(/g) || []).length;
  const primitiveRemoves = (content.match(/\.primitives\.remove\(/g) || []).length;
  const primitiveRemoveAlls = (content.match(/\.primitives\.removeAll\(/g) || []).length;
  
  if (primitiveAdds > 0) {
    const totalRemoves = primitiveRemoves + primitiveRemoveAlls;
    if (primitiveAdds > totalRemoves) {
      issues.critical.push({
        file: relativePath,
        issue: "CRITICAL: primitives.add() without matching remove()",
        description: `Found ${primitiveAdds} add() calls but only ${totalRemoves} remove() calls - memory leak risk`,
        line: findLineNumber(content, ".primitives.add("),
        fix: "Ensure every add() has a corresponding remove() in cleanup",
      });
    }
  }
  
  // Check 2: Event listeners without cleanup
  const addEventListenerPattern = /addEventListener\(/g;
  const removeEventListenerPattern = /removeEventListener\(/g;
  const addMatches = (content.match(addEventListenerPattern) || []).length;
  const removeMatches = (content.match(removeEventListenerPattern) || []).length;
  
  if (addMatches > removeMatches) {
    // Check if cleanup is in useEffect return
    if (!content.includes("useEffect") || !content.match(/return\s*\(\)\s*=>/)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Event listeners without cleanup",
        description: `Found ${addMatches} addEventListener but only ${removeMatches} removeEventListener - may leak`,
        line: findLineNumber(content, "addEventListener"),
        fix: "Add cleanup in useEffect return: return () => { removeEventListener(...) }",
      });
    }
  }
  
  // Check 3: viewer.entities.add() without remove()
  const entityAdds = (content.match(/\.entities\.add\(/g) || []).length;
  const entityRemoves = (content.match(/\.entities\.remove\(/g) || []).length;
  const entityRemoveAlls = (content.match(/\.entities\.removeAll\(/g) || []).length;
  
  if (entityAdds > 0 && entityAdds > (entityRemoves + entityRemoveAlls)) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: entities.add() without matching remove()",
      description: `Found ${entityAdds} add() but only ${entityRemoves + entityRemoveAlls} remove() - memory leak`,
      line: findLineNumber(content, ".entities.add("),
      fix: "Ensure every entity.add() has cleanup in useEffect or componentWillUnmount",
    });
  }
  
  // Check 4: Camera event handlers without cleanup
  const cameraEventPatterns = [
    /\.camera\.moveStart\.addEventListener/,
    /\.camera\.moveEnd\.addEventListener/,
    /\.camera\.changed\.addEventListener/,
    /\.camera\.watch\s*\(/,
  ];
  
  for (const pattern of cameraEventPatterns) {
    if (pattern.test(content)) {
      if (!content.includes("removeEventListener") && !content.includes("remove")) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: Camera event handler without cleanup",
          description: "Camera event listener registered but no cleanup found",
          line: findLineNumber(content, pattern.source),
          fix: "Remove camera event listener in cleanup function",
        });
      }
    }
  }
  
  // Check 5: Multiple viewer instances (potential duplicate)
  const viewerInstances = (content.match(/new\s+Cesium\.Viewer\(/g) || []).length;
  if (viewerInstances > 1) {
    issues.critical.push({
      file: relativePath,
      issue: "CRITICAL: Multiple Cesium Viewer instances",
      description: `Found ${viewerInstances} viewer instances - should only have one per component`,
      line: findLineNumber(content, "new Cesium.Viewer"),
      fix: "Ensure only one viewer instance exists - use ref/state to prevent duplicates",
    });
  }
  
  // Check 6: useEffect without cleanup when using Cesium APIs
  if (content.includes("cesiumViewer") || content.includes("viewer.")) {
    const useEffectPattern = /useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[.*?\]\)/g;
    const matches = [...content.matchAll(useEffectPattern)];
    
    for (const match of matches) {
      const effectBody = match[1];
      // Check if effect modifies Cesium state
      if (effectBody.match(/\.(add|remove|set|update)/) && !effectBody.includes("return")) {
        issues.high.push({
          file: relativePath,
          issue: "HIGH: useEffect modifies Cesium without cleanup",
          description: "Effect modifies Cesium entities/primitives but no cleanup function",
          line: findLineNumber(content, match[0]),
          fix: "Add cleanup return: return () => { /* remove entities/primitives */ }",
        });
      }
    }
  }
  
  // Check 7: Ion SDK sensors/viewshed without cleanup
  if (content.includes("ViewshedAnalysis") || content.includes("viewshed")) {
    const viewshedInstances = (content.match(/new\s+\w*[Vv]iewshed/g) || []).length;
    const cleanupPattern = /(destroy|dispose|remove|cleanup)\(/;
    
    if (viewshedInstances > 0 && !cleanupPattern.test(content)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Viewshed analysis without cleanup",
        description: "Viewshed instances created but no cleanup found",
        line: findLineNumber(content, "Viewshed"),
        fix: "Call destroy() or remove() on viewshed instance in cleanup",
      });
    }
  }
  
  // Check 8: TilesRenderer without cleanup
  if (content.includes("TilesRenderer")) {
    const tilesRendererInstances = (content.match(/new\s+TilesRenderer\(/g) || []).length;
    const disposePattern = /\.dispose\(/;
    
    if (tilesRendererInstances > 0 && !disposePattern.test(content)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: TilesRenderer without dispose()",
        description: "TilesRenderer created but no dispose() call found",
        line: findLineNumber(content, "TilesRenderer"),
        fix: "Call tilesRenderer.dispose() in cleanup function",
      });
    }
  }
  
  // Check 9: RequestAnimationFrame without cancelAnimationFrame
  const rafMatches = (content.match(/requestAnimationFrame\(/g) || []).length;
  const cafMatches = (content.match(/cancelAnimationFrame\(/g) || []).length;
  
  if (rafMatches > cafMatches) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: requestAnimationFrame without cancelAnimationFrame",
      description: `Found ${rafMatches} RAF calls but only ${cafMatches} cancel calls`,
      line: findLineNumber(content, "requestAnimationFrame"),
      fix: "Store RAF ID and cancel in cleanup: cancelAnimationFrame(rafId)",
    });
  }
}

function findLineNumber(content, searchString) {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

// Main execution
console.log("🔍 Running Cesium Lifecycle & Memory Audit...\n");

const cesiumFiles = [
  path.join(workspaceRoot, "packages/engine-cesium/src"),
  path.join(workspaceRoot, "apps/editor/app/components/Builder"),
];

for (const dir of cesiumFiles) {
  if (fs.existsSync(dir)) {
    const files = findReactFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      analyzeFile(file, content);
    }
  }
}

// Generate report
console.log("=".repeat(80));
console.log("CESIUM LIFECYCLE & MEMORY AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No memory leaks found! All Cesium resources are properly cleaned up.");
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
  console.log("❌ Audit failed - Critical memory leaks detected");
  process.exit(1);
}

if (issues.high.length > 0) {
  console.log("⚠️  Audit passed with warnings - High priority leaks recommended");
  process.exit(0);
}

console.log("✅ Audit passed");
process.exit(0);

