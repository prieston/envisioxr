#!/usr/bin/env node

/**
 * Mesh Loading & Asset Pipeline Audit
 *
 * Checks for:
 * - Duplicate loader creation
 * - Model scale normalization consistency
 * - Promise cancellation / disposal on route change
 * - LOD strategy existence
 * - Redundant network fetch cycles
 */

import fs from "fs";
import path from "path";

const WORKSPACE_ROOT = process.cwd();

interface Issue {
  file: string;
  issue: string;
  description: string;
  line: number | null;
  fix: string;
}

const issues = {
  critical: [] as Issue[],
  high: [] as Issue[],
  medium: [] as Issue[],
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
    } else if (file.match(/\.(tsx|ts)$/)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function analyzeFile(filePath: string, content: string): void {
  const relativePath = path.relative(WORKSPACE_ROOT, filePath);

  // Check 1: Multiple loader instances (should be singleton or cached)
  const loaderPatterns = [
    /new\s+GLTFLoader\(/g,
    /new\s+Rhino3dmLoader\(/g,
    /new\s+DRACOLoader\(/g,
    /new\s+OBJLoader\(/g,
    /new\s+IFCLoader\(/g,
  ];

  for (const pattern of loaderPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 1) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: Multiple loader instances created",
        description: `Found ${matches.length} instances of loader - should reuse singleton`,
        line: findLineNumber(content, pattern.source),
        fix: "Cache loader instance or use singleton pattern",
      });
    }
  }

  // Check 2: useLoader without cleanup on unmount
  if (content.includes("useLoader")) {
    // Check if component unmounts properly
    if (!content.includes("useEffect") || !content.match(/return\s*\(\)\s*=>/)) {
      issues.high.push({
        file: relativePath,
        issue: "HIGH: useLoader without cleanup",
        description: "useLoader may cache models - no cleanup on unmount",
        line: findLineNumber(content, "useLoader"),
        fix: "Consider cleanup if models should be disposed on route change",
      });
    }
  }

  // Check 3: Fetch without AbortController
  const fetchPattern = /fetch\(/g;
  const abortControllerPattern = /AbortController|signal/g;
  const fetchMatches = (content.match(fetchPattern) || []).length;

  if (fetchMatches > 0 && !abortControllerPattern.test(content)) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: Fetch without cancellation support",
      description: `Found ${fetchMatches} fetch calls without AbortController - cannot cancel on unmount`,
      line: findLineNumber(content, "fetch("),
      fix: "Use AbortController to cancel fetch on component unmount",
    });
  }

  // Check 4: Model loading in useEffect without loading state
  if (content.includes("useEffect") && content.match(/\.(glb|gltf|3dm|obj|ifc)/i)) {
    const hasLoadingState = content.includes("loading") || content.includes("isLoading");
    if (!hasLoadingState) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: Model loading without loading state",
        description: "Loading models but no loading state management",
        line: findLineNumber(content, "useEffect"),
        fix: "Add loading state to prevent duplicate loads",
      });
    }
  }

  // Check 5: No LOD strategy detected
  if (content.includes("Model") || content.includes("load")) {
    const lodPatterns = [
      /LOD|LevelOfDetail|level.*detail/i,
      /distance.*scale|scale.*distance/i,
      /camera.*distance/i,
    ];

    const hasLOD = lodPatterns.some(p => p.test(content));
    if (!hasLOD && content.includes("useSceneStore")) {
      issues.medium.push({
        file: relativePath,
        issue: "MEDIUM: No LOD strategy detected",
        description: "Loading models but no Level-of-Detail strategy found",
        line: findLineNumber(content, "Model"),
        fix: "Consider implementing LOD for scenes with many models",
      });
    }
  }

  // Check 6: Scale normalization inconsistency
  const scalePatterns = [
    /scale\s*[:=]\s*\[/g,
    /\.scale\s*=/g,
  ];

  let hasScale = false;
  for (const pattern of scalePatterns) {
    if (pattern.test(content)) {
      hasScale = true;
      break;
    }
  }

  if (hasScale && !content.includes("normalize") && !content.includes("normalizeScale")) {
    issues.medium.push({
      file: relativePath,
      issue: "MEDIUM: Scale handling without normalization",
      description: "Models may have inconsistent scales - no normalization found",
      line: findLineNumber(content, "scale"),
      fix: "Consider normalizing model scales to consistent units",
    });
  }
}

function findLineNumber(content: string, searchString: string): number | null {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

console.log("🔍 Running Mesh Loading & Asset Pipeline Audit...\n");

const assetFiles = [
  path.join(WORKSPACE_ROOT, "apps/editor/app/components/Builder"),
  path.join(WORKSPACE_ROOT, "apps/editor/app/hooks"),
  path.join(WORKSPACE_ROOT, "packages/engine-three/src/components"),
];

for (const dir of assetFiles) {
  if (fs.existsSync(dir)) {
    const files = findReactFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      analyzeFile(file, content);
    }
  }
}

console.log("=".repeat(80));
console.log("MESH LOADING & ASSET PIPELINE AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.critical.length === 0 && issues.high.length === 0 && issues.medium.length === 0) {
  console.log("✅ No issues found! Asset pipeline is optimized.");
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
  console.log("❌ Audit failed - Critical issues found");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);

