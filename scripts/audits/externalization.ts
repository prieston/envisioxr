#!/usr/bin/env node
/**
 * Externalization & PeerDeps Audit
 *
 * Goal: Ensure heavy libs aren't bundled accidentally
 *
 * Checks:
 * - For each packages/*/tsup.config.ts:
 *   external must include cesium, @cesium packages, three, @react-three packages, zustand, uuid (as applicable)
 * - For each package.json:
 *   If a module appears in external, it must be listed in peerDependencies (or dependencies if truly required at runtime)
 * - Fail if mismatch or missing externalization
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, "packages");

interface Violation {
  file: string;
  message: string;
}

const violations: Violation[] = [];

// Required externals by package type
const REQUIRED_EXTERNALS: Record<string, string[]> = {
  "engine-cesium": ["cesium", "@cesium/"],
  "engine-three": ["three", "@react-three/"],
  "core": ["zustand", "uuid"],
  "ion-sdk": ["cesium", "@cesium/"],
};

function parseTsupConfig(configPath: string): { external?: string[] } {
  const content = fs.readFileSync(configPath, "utf8");

  // Simple regex extraction (for JS/TS configs)
  // Try to find external array
  const externalMatch = content.match(/external:\s*\[([^\]]+)\]/s);
  if (!externalMatch) {
    return {};
  }

  const externalStr = externalMatch[1];
  const externals: string[] = [];

  // Extract strings from array
  const stringMatches = externalStr.matchAll(/["']([^"']+)["']/g);
  for (const match of stringMatches) {
    externals.push(match[1]);
  }

  // Also check for regex patterns
  const regexMatches = externalStr.matchAll(/\/\^([^$]+)\$\//g);
  for (const match of regexMatches) {
    externals.push(match[1]);
  }

  return { external: externals };
}

function checkExternalization() {
  console.log("🔍 Checking externalization...");

  const packages = fs.readdirSync(PACKAGES_DIR);

  for (const pkgName of packages) {
    const pkgPath = path.join(PACKAGES_DIR, pkgName);
    const tsupConfigPath = path.join(pkgPath, "tsup.config.ts");
    const pkgJsonPath = path.join(pkgPath, "package.json");

    if (!fs.existsSync(tsupConfigPath) || !fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const tsupConfig = parseTsupConfig(tsupConfigPath);

    // Check required externals
    const required = REQUIRED_EXTERNALS[pkgName] || [];
    const externals = tsupConfig.external || [];

    for (const requiredExternal of required) {
      const isExternalized = externals.some((ext) => {
        if (ext === requiredExternal) return true;
        if (ext.startsWith("/^") && ext.endsWith("$/")) {
          // Regex pattern
          const pattern = ext.slice(2, -2);
          return new RegExp(pattern).test(requiredExternal);
        }
        return false;
      });

      if (!isExternalized) {
        violations.push({
          file: tsupConfigPath,
          message: `Missing externalization: ${requiredExternal} should be in external array`,
        });
      }
    }

    // Check that externals are in peerDependencies
    for (const external of externals) {
      // Skip regex patterns and internal packages
      if (external.startsWith("/") || external.startsWith("@klorad/")) continue;

      const allDeps = {
        ...pkgJson.dependencies,
        ...pkgJson.peerDependencies,
      };

      const isDeclared = Object.keys(allDeps).some((dep) => {
        if (dep === external) return true;
        // Check if external matches a pattern (e.g., "cesium" matches "@cesium/engine")
        if (external.startsWith("@") && dep.startsWith(external.split("/")[0])) {
          return true;
        }
        return false;
      });

      if (!isDeclared && !external.startsWith("/")) {
        violations.push({
          file: pkgJsonPath,
          message: `External "${external}" should be declared in peerDependencies or dependencies`,
        });
      }
    }
  }
}

// Main execution
console.log("🔗 Externalization & PeerDeps Audit\n");

checkExternalization();

if (violations.length > 0) {
  console.log(`\n❌ Found ${violations.length} violation(s):\n`);
  violations.forEach((v) => {
    console.log(`  ${v.file} - ${v.message}`);
  });
  console.log("\n");
  process.exit(1);
} else {
  console.log("✅ All externalization checks passed!\n");
  process.exit(0);
}

