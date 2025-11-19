#!/usr/bin/env node
/**
 * Type-Safety Hot-Spots Audit
 *
 * Goal: Keep any from creeping back into core/editor hotspots
 *
 * Checks:
 * - In apps/editor/app/components/Builder/ and packages/src:
 *   Fail if any is used in prop types or exported public APIs
 * - Warn for Record<string, any> → suggest unknown
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();

interface Violation {
  file: string;
  line: number;
  severity: "fail" | "warn";
  message: string;
  isExported?: boolean;
}

const violations: Violation[] = [];

// Hot-spot directories
const HOTSPOT_PATTERNS = [
  "apps/editor/app/components/Builder/**",
  "packages/*/src/**",
];

function isExportedDeclaration(content: string, lineIndex: number): boolean {
  const lines = content.split("\n");

  // Check if the line is part of an exported declaration
  // Look backwards for export keyword
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 10); i--) {
    const line = lines[i].trim();
    if (line.startsWith("export ")) {
      return true;
    }
    if (line.includes("export default")) {
      return true;
    }
    // If we hit a non-empty line that's not a comment and not export, stop
    if (line && !line.startsWith("//") && !line.startsWith("/*") && !line.startsWith("*")) {
      break;
    }
  }

  return false;
}

function checkTypeSafety() {
  console.log("🔍 Checking type safety hot-spots...");

  // Load allowlist
  let allowlist: { types?: { allowAnyIn?: string[]; ignorePatterns?: string[] } } = {};
  try {
    const allowlistPath = path.join(WORKSPACE_ROOT, "scripts/audits/ALLOWLIST.json");
    if (fs.existsSync(allowlistPath)) {
      allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
    }
  } catch (error) {
    // Ignore allowlist errors
  }

  const sourceFiles: string[] = [];
  const ignorePatterns = [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    ...(allowlist.types?.ignorePatterns || []),
  ];

  for (const pattern of HOTSPOT_PATTERNS) {
    const files = glob.sync(pattern, {
      cwd: WORKSPACE_ROOT,
      ignore: ignorePatterns,
    });
    sourceFiles.push(...files);
  }

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);

    // Skip directories
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) continue;
    } catch {
      continue; // Skip if we can't stat the file
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n");

    // Check if file is in allowlist
    const allowAnyIn = allowlist.types?.allowAnyIn || [];
    const isAllowed = allowAnyIn.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
      return regex.test(file);
    });

    lines.forEach((line, index) => {
      // Skip if file is in allowlist
      if (isAllowed) {
        return;
      }

      // Check for explicit any in type annotations
      const anyPatterns = [
        /:\s*any\b/g, // : any
        /<any>/g, // <any>
        /any\[\]/g, // any[]
        /\bany\s*\|/g, // any |
        /\|\s*any\b/g, // | any
      ];

      for (const pattern of anyPatterns) {
        const matches = Array.from(line.matchAll(pattern));
        if (matches.length > 0) {
          // Check if it's in a prop type or exported API
          const isPropType = /(?:props|Props|interface\s+\w+Props|type\s+\w+Props)/i.test(line);
          const isExported = isExportedDeclaration(content, index);

          if (isPropType || isExported) {
            violations.push({
              file,
              line: index + 1,
              severity: "fail",
              message: `Explicit any in ${isPropType ? "prop type" : "exported API"}: "${line.trim()}"`,
              isExported: isExported,
            });
          } else {
            violations.push({
              file,
              line: index + 1,
              severity: "warn",
              message: `Explicit any found: "${line.trim()}"`,
            });
          }
        }
      }

      // Check for Record<string, any>
      if (/\bRecord<string,\s*any>/i.test(line) && !isAllowed) {
        violations.push({
          file,
          line: index + 1,
          severity: "warn",
          message: `Record<string, any> should be Record<string, unknown>: "${line.trim()}"`,
        });
      }
    });
  }
}

// Main execution
console.log("🔒 Type-Safety Hot-Spots Audit\n");

checkTypeSafety();

// Report results
const failures = violations.filter((v) => v.severity === "fail");
const warnings = violations.filter((v) => v.severity === "warn");

// In pre-commit/Vercel builds, only fail on Builder components (new code)
// Existing technical debt in packages is tracked but doesn't block builds
// In CI, fail on all exported API violations
const isPreCommit = process.env.HUSKY === "1" || process.env.GIT_HOOK === "1";
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

const criticalFailures = isPreCommit || isVercel
  ? failures.filter((v) => v.file.includes("apps/editor/app/components/Builder/"))
  : failures;

if (criticalFailures.length > 0 || warnings.length > 0) {
  if (criticalFailures.length > 0) {
    console.log(`\n❌ Found ${criticalFailures.length} failure(s):\n`);
    criticalFailures.forEach((v) => {
      console.log(`  ${v.file}:${v.line} - ${v.message}`);
    });
  }

  if (warnings.length > 0 && !isPreCommit && !isVercel) {
    console.log(`\n⚠️  Found ${warnings.length} warning(s):\n`);
    // Show top 20 warnings
    warnings.slice(0, 20).forEach((v) => {
      console.log(`  ${v.file}:${v.line} - ${v.message}`);
    });
    if (warnings.length > 20) {
      console.log(`  ... and ${warnings.length - 20} more warnings`);
    }
  }

  console.log("\n💡 How to fix:");
  console.log("   - Replace 'any' with specific types (FileDescriptor, FeatureProps, etc.)");
  console.log("   - Use 'unknown' for truly unknown data, then validate with zod");
  console.log("   - Example: const FeatureSchema = z.object({ id: z.string(), properties: z.record(z.unknown()) })");
  console.log("   - Add exceptions to scripts/audits/ALLOWLIST.json if needed\n");
  process.exit(criticalFailures.length > 0 ? 1 : 0);
} else {
  console.log("✅ All type safety checks passed!\n");
  process.exit(0);
}

