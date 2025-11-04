#!/usr/bin/env node
/**
 * File Size & Component Complexity Guard
 *
 * Goal: Stop "god files/components"
 *
 * Checks:
 * - File lines: warn ≥ 300, fail > 500
 * - React component LOC: warn ≥ 200, fail > 350
 * - Props count: warn ≥ 12 props, fail > 16
 * - Cyclomatic complexity (function): warn ≥ 10, fail > 15
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();

interface Violation {
  file: string;
  line?: number;
  severity: "warn" | "fail";
  message: string;
}

const violations: Violation[] = [];

// Thresholds (configurable at top)
const FILE_LINES_WARN = 300;
const FILE_LINES_FAIL = 500;
const COMPONENT_LOC_WARN = 200;
const COMPONENT_LOC_FAIL = 350;
const PROPS_WARN = 12;
const PROPS_FAIL = 16;
const COMPLEXITY_WARN = 10;
const COMPLEXITY_FAIL = 15;

function countLines(content: string): number {
  return content.split("\n").length;
}

function parseComponentProps(content: string, componentName: string): number {
  // Try to find component definition
  const patterns = [
    // function ComponentName(props: {...})
    new RegExp(`function\\s+${componentName}\\s*\\([^)]*\\)\\s*:`, "s"),
    // const ComponentName: React.FC<{...}>
    new RegExp(`const\\s+${componentName}\\s*:\\s*React\\.FC<([^>]+)>`, "s"),
    // const ComponentName = ({ ... }: {...}) =>
    new RegExp(`const\\s+${componentName}\\s*=\\s*\\([^)]*\\)\\s*:\\s*([^=]+)=>`, "s"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      // Count props in the type definition
      const propsType = match[1] || "";
      const propMatches = propsType.match(/\w+\s*[:?]/g);
      return propMatches ? propMatches.length : 0;
    }
  }

  return 0;
}

function estimateComponentLOC(content: string): number {
  // Find React component boundaries
  const componentPatterns = [
    /(?:function|const)\s+\w+\s*(?::\s*React\.FC)?\s*[=<]?\s*\([^)]*\)\s*[:=]?\s*\{/g,
    /export\s+(?:default\s+)?(?:function|const)\s+\w+\s*(?::\s*React\.FC)?\s*[=<]?\s*\([^)]*\)\s*[:=]?\s*\{/g,
  ];

  let componentStart = -1;
  let componentEnd = -1;
  let braceDepth = 0;

  for (const pattern of componentPatterns) {
    const match = pattern.exec(content);
    if (match) {
      componentStart = match.index || 0;
      break;
    }
  }

  if (componentStart === -1) return 0;

  // Find the matching closing brace
  const afterStart = content.substring(componentStart);
  for (let i = 0; i < afterStart.length; i++) {
    if (afterStart[i] === "{") braceDepth++;
    if (afterStart[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) {
        componentEnd = componentStart + i;
        break;
      }
    }
  }

  if (componentEnd === -1) return 0;

  const componentContent = content.substring(componentStart, componentEnd + 1);
  return countLines(componentContent);
}

function estimateCyclomaticComplexity(content: string): number {
  // Simple estimation: count control flow statements
  const complexityPatterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bswitch\s*\(/g,
    /\bcatch\s*\(/g,
    /\?\s*.*\s*:/g, // ternary
    /\|\|/g,
    /&&/g,
  ];

  let complexity = 1; // Base complexity

  for (const pattern of complexityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  return complexity;
}

function checkFileSize() {
  console.log("🔍 Checking file sizes...");

  const sourceFiles = glob.sync("**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const lineCount = countLines(content);

    if (lineCount > FILE_LINES_FAIL) {
      violations.push({
        file,
        severity: "fail",
        message: `File too large: ${lineCount} lines (limit: ${FILE_LINES_FAIL})`,
      });
    } else if (lineCount >= FILE_LINES_WARN) {
      violations.push({
        file,
        severity: "warn",
        message: `File large: ${lineCount} lines (warn: ${FILE_LINES_WARN})`,
      });
    }
  }
}

function checkComponentComplexity() {
  console.log("🔍 Checking component complexity...");

  const componentFiles = glob.sync("**/*.{tsx,jsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
  });

  for (const file of componentFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    // Extract component names (simple heuristic)
    const componentNameMatches = content.match(/(?:export\s+(?:default\s+)?)?(?:function|const)\s+(\w+)\s*(?::\s*React\.FC)?/g);
    if (!componentNameMatches) continue;

    for (const match of componentNameMatches) {
      const nameMatch = match.match(/(?:function|const)\s+(\w+)/);
      if (!nameMatch) continue;

      const componentName = nameMatch[1];

      // Skip if it's a type/interface
      if (componentName[0] === componentName[0].toUpperCase() === false) continue;

      const componentLOC = estimateComponentLOC(content);
      const propsCount = parseComponentProps(content, componentName);
      const complexity = estimateCyclomaticComplexity(content);

      if (componentLOC > COMPONENT_LOC_FAIL) {
        violations.push({
          file,
          severity: "fail",
          message: `Component "${componentName}" too large: ${componentLOC} LOC (limit: ${COMPONENT_LOC_FAIL})`,
        });
      } else if (componentLOC >= COMPONENT_LOC_WARN) {
        violations.push({
          file,
          severity: "warn",
          message: `Component "${componentName}" large: ${componentLOC} LOC (warn: ${COMPONENT_LOC_WARN})`,
        });
      }

      if (propsCount > PROPS_FAIL) {
        violations.push({
          file,
          severity: "fail",
          message: `Component "${componentName}" has too many props: ${propsCount} (limit: ${PROPS_FAIL})`,
        });
      } else if (propsCount >= PROPS_WARN) {
        violations.push({
          file,
          severity: "warn",
          message: `Component "${componentName}" has many props: ${propsCount} (warn: ${PROPS_WARN})`,
        });
      }

      if (complexity > COMPLEXITY_FAIL) {
        violations.push({
          file,
          severity: "fail",
          message: `Component "${componentName}" too complex: ${complexity} (limit: ${COMPLEXITY_FAIL})`,
        });
      } else if (complexity >= COMPLEXITY_WARN) {
        violations.push({
          file,
          severity: "warn",
          message: `Component "${componentName}" complex: ${complexity} (warn: ${COMPLEXITY_WARN})`,
        });
      }
    }
  }
}

// Main execution
console.log("📏 File Size & Component Complexity Guard\n");

checkFileSize();
checkComponentComplexity();

// Report results
const failures = violations.filter((v) => v.severity === "fail");
const warnings = violations.filter((v) => v.severity === "warn");

if (failures.length > 0 || warnings.length > 0) {
  if (failures.length > 0) {
    console.log(`\n❌ Found ${failures.length} failure(s):\n`);
    failures.forEach((v) => {
      console.log(`  ${v.file}${v.line ? `:${v.line}` : ""} - ${v.message}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warning(s):\n`);
    // Show top 20 warnings
    warnings.slice(0, 20).forEach((v) => {
      console.log(`  ${v.file}${v.line ? `:${v.line}` : ""} - ${v.message}`);
    });
    if (warnings.length > 20) {
      console.log(`  ... and ${warnings.length - 20} more warnings`);
    }
  }

  console.log("\n💡 How to fix:");
  console.log("   - Split large components: Extract UI parts (< 300 LOC) and hooks separately");
  console.log("   - Reduce props: Group related props into objects, use Context for shared state");
  console.log("   - Reduce complexity: Extract helper functions, use early returns\n");

  // In pre-commit, only fail on critical issues (vendor files excluded)
  // Full audit runs in CI
  const criticalFailures = failures.filter((v) => {
    // Don't fail on vendor files in pre-commit
    if (v.file.includes("/vendor/")) return false;
    // Don't fail on type definition files
    if (v.file.endsWith(".d.ts")) return false;
    return true;
  });

  process.exit(criticalFailures.length > 0 ? 1 : 0);
} else {
  console.log("✅ All size/complexity checks passed!\n");
  process.exit(0);
}

