#!/usr/bin/env node
/**
 * Package Boundaries & Exports Audit
 *
 * Goal: Prevent src/ leaks, wrong exports, and cross-layer imports
 *
 * Checks:
 * - Each workspace package exports only from dist/. Fail if any package.json exports or main/types point to src/
 * - No app imports @klorad packages from src/ or deep internals (chunk-*)
 * - No forbidden cross-layer imports (apps importing from packages/src or UI importing Cesium directly)
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, "packages");

interface Violation {
  file: string;
  line?: number;
  message: string;
}

const violations: Violation[] = [];

// Thresholds (configurable at top)
const FAIL_ON_VIOLATION = true;

function findLineNumber(content: string, pattern: string): number {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) {
      return i + 1;
    }
  }
  return 0;
}

// Check 1: Package.json exports must point to dist/**, not src/**
function checkPackageExports() {
  console.log("🔍 Checking package.json exports...");

  const packageDirs = fs.readdirSync(PACKAGES_DIR);

  for (const pkgName of packageDirs) {
    const pkgPath = path.join(PACKAGES_DIR, pkgName);
    const pkgJsonPath = path.join(pkgPath, "package.json");

    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    // Check main, module, types
    const checkFields = [
      { key: "main", value: pkgJson.main },
      { key: "module", value: pkgJson.module },
      { key: "types", value: pkgJson.types },
    ];

    for (const field of checkFields) {
      if (field.value && typeof field.value === "string") {
        if (field.value.includes("/src/") || field.value.startsWith("src/")) {
          violations.push({
            file: pkgJsonPath,
            message: `❌ ${pkgJson.name}: ${field.key} points to src/: "${field.value}"`,
          });
        }
      }
    }

    // Check exports field
    if (pkgJson.exports) {
      const checkExports = (exports: any, prefix = "") => {
        if (typeof exports === "string") {
          if (exports.includes("/src/") || exports.startsWith("src/")) {
            violations.push({
              file: pkgJsonPath,
              message: `❌ ${pkgJson.name}: exports${prefix} points to src/: "${exports}"`,
            });
          }
        } else if (typeof exports === "object") {
          for (const [key, value] of Object.entries(exports)) {
            checkExports(value, `${prefix}.${key}`);
          }
        }
      };
      checkExports(pkgJson.exports);
    }
  }
}

// Check 2: No app imports from @klorad/*/src/** or /dist/chunk-*
function checkAppImports() {
  console.log("🔍 Checking app imports...");

  const sourceFiles = glob.sync("apps/**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    // Check for @klorad/*/src/** imports
    const srcImportPattern = /from\s+['"](@klorad\/[^'"]+\/src\/[^'"]+)['"]/g;
    let match;
    while ((match = srcImportPattern.exec(content)) !== null) {
      violations.push({
        file,
        line: findLineNumber(content, match[0]),
        message: `❌ Import from src/: "${match[1]}"`,
      });
    }

    // Check for deep internals (/dist/chunk-*)
    const chunkImportPattern =
      /from\s+['"](@klorad\/[^'"]+\/dist\/chunk-[^'"]+)['"]/g;
    while ((match = chunkImportPattern.exec(content)) !== null) {
      violations.push({
        file,
        line: findLineNumber(content, match[0]),
        message: `❌ Import from internal chunk: "${match[1]}"`,
      });
    }
  }
}

// Check 3: No forbidden cross-layer imports
function checkCrossLayerImports() {
  console.log("🔍 Checking cross-layer imports...");

  const sourceFiles = glob.sync("packages/**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: ["**/node_modules/**", "**/dist/**"],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    // UI should not import Cesium directly
    if (file.includes("packages/ui/")) {
      const cesiumImportPattern = /from\s+['"](cesium|@cesium\/[^'"]+)['"]/g;
      let match;
      while ((match = cesiumImportPattern.exec(content)) !== null) {
        violations.push({
          file,
          line: findLineNumber(content, match[0]),
          message: `❌ UI package imports Cesium directly: "${match[1]}"`,
        });
      }
    }

    // Core should not import engine packages
    if (file.includes("packages/core/")) {
      const engineImportPattern =
        /from\s+['"](@klorad\/(engine-cesium|engine-three|ion-sdk))[^'"]*['"]/g;
      let match;
      while ((match = engineImportPattern.exec(content)) !== null) {
        violations.push({
          file,
          line: findLineNumber(content, match[0]),
          message: `❌ Core package imports engine: "${match[1]}"`,
        });
      }
    }
  }
}

// Check 4: Cesium engine boundaries - only engine-cesium should import Cesium
function checkCesiumEngineBoundaries() {
  console.log("🔍 Checking Cesium engine boundaries...");

  const sourceFiles = glob.sync("**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/dev-audits/**",
      "**/scripts/audits/**",
    ],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    // Skip files in engine-cesium - they're allowed to import Cesium
    if (file.includes("packages/engine-cesium/")) {
      continue;
    }

    // Track matches to avoid duplicates (same file, line, and module)
    const seenMatches = new Set<string>();

    // Check for Cesium imports - match "from 'cesium'" or "from '@cesium/...'"
    const cesiumImportPattern = /from\s+['"](cesium|@cesium\/[^'"]+)['"]/g;
    let match;
    while ((match = cesiumImportPattern.exec(content)) !== null) {
      // Skip type-only imports
      const beforeMatch = content.substring(
        Math.max(0, match.index - 20),
        match.index
      );
      if (beforeMatch.includes("type ")) continue;

      // Extract the imported module name
      const importedModule = match[1];
      const line = findLineNumber(content, match[0]);

      // Create a unique key to avoid duplicates
      const matchKey = `${file}:${line}:${importedModule}`;
      if (seenMatches.has(matchKey)) {
        continue;
      }
      seenMatches.add(matchKey);

      violations.push({
        file,
        line,
        message: `❌ Cesium imports must go through @klorad/engine-cesium; found direct import from "${importedModule}"`,
      });
    }
  }
}

// Check 5: Three.js engine boundaries - only engine-three should import Three.js
function checkThreejsEngineBoundaries() {
  console.log("🔍 Checking Three.js engine boundaries...");

  const sourceFiles = glob.sync("**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/dev-audits/**",
      "**/scripts/audits/**",
    ],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    // Skip files in engine-three - they're allowed to import Three.js
    if (file.includes("packages/engine-three/")) {
      continue;
    }

    // Track matches to avoid duplicates (same file, line, and module)
    const seenMatches = new Set<string>();

    // Check for Three.js imports
    const threejsImportPatterns = [
      /from\s+['"]three['"]/g,
      /from\s+['"]@react-three\/[^'"]+['"]/g,
      /from\s+['"]@react-spring\/three['"]/g,
      /from\s+['"]3d-tiles-renderer['"]/g,
    ];

    for (const pattern of threejsImportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // Skip type-only imports
        const beforeMatch = content.substring(
          Math.max(0, match.index - 20),
          match.index
        );
        if (beforeMatch.includes("type ")) continue;

        // Extract the imported module name
        const importMatch = match[0].match(/['"]([^'"]+)['"]/);
        const importedModule = importMatch ? importMatch[1] : "three";
        const line = findLineNumber(content, match[0]);

        // Create a unique key to avoid duplicates
        const matchKey = `${file}:${line}:${importedModule}`;
        if (seenMatches.has(matchKey)) {
          continue;
        }
        seenMatches.add(matchKey);

        violations.push({
          file,
          line,
          message: `❌ Three.js imports must go through @klorad/engine-three; found direct import from "${importedModule}"`,
        });
      }
    }
  }
}

// Main execution
console.log("📦 Package Boundaries & Exports Audit\n");

checkPackageExports();
checkAppImports();
checkCrossLayerImports();
checkCesiumEngineBoundaries();
checkThreejsEngineBoundaries();

// Report results
if (violations.length > 0) {
  console.log(`\n❌ Found ${violations.length} violation(s):\n`);
  violations.forEach((v) => {
    if (v.line) {
      console.log(`  ${v.file}:${v.line} - ${v.message}`);
    } else {
      console.log(`  ${v.file} - ${v.message}`);
    }
  });
  console.log("\n💡 How to fix:");
  console.log(
    "   - Package.json exports: Change 'src/' paths to 'dist/' in package.json"
  );
  console.log(
    "   - App imports from src/: Import from package root, not internal paths"
  );
  console.log(
    "   - Deep internals: Import public exports only, avoid chunk-* files"
  );
  console.log(
    "   - Cross-layer: Move imports to allowed layers or use peer dependencies"
  );
  console.log(
    "   - Cesium imports: All Cesium code must be imported through @klorad/engine-cesium"
  );
  console.log(
    "   - Three.js imports: All Three.js code must be imported through @klorad/engine-three\n"
  );
  process.exit(FAIL_ON_VIOLATION ? 1 : 0);
} else {
  console.log("✅ All package boundaries checks passed!\n");
  process.exit(0);
}
