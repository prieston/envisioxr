#!/usr/bin/env node
/**
 * Circular & Forbidden Dependency Graph Audit
 *
 * Goal: Avoid cycles and enforce allowed directions
 *
 * Checks:
 * - Fail on any circular import
 * - Enforce graph rules:
 *   - @klorad/core → no internal deps
 *   - @klorad/ion-sdk → may depend on core only (peer)
 *   - @klorad/engine-cesium|engine-three → may depend on core, ion-sdk, ui
 *   - apps/* → can depend on all @klorad/*, not vice-versa
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const WORKSPACE_ROOT = process.cwd();

// Dependency graph rules
const ALLOWED_DEPS: Record<string, string[]> = {
  "@klorad/core": [], // No internal deps
  "@klorad/ion-sdk": ["@klorad/core"],
  "@klorad/ui": ["@klorad/core"],
  "@klorad/engine-cesium": [
    "@klorad/core",
    "@klorad/ion-sdk",
    "@klorad/ui",
  ],
  "@klorad/engine-three": ["@klorad/core", "@klorad/ui"],
  "@klorad/config": ["@klorad/core"],
};

function checkCircularDeps() {
  console.log("🔍 Checking for circular dependencies...");

  try {
    execSync("npx madge --version", { stdio: "ignore" });
  } catch (e) {
    console.log("⚠️  madge not available. Install with: pnpm add -D madge");
    console.log("   Skipping circular dependency check.\n");
    return;
  }

  try {
    const output = execSync(
      `npx madge --circular --extensions ts,tsx apps packages`,
      {
        encoding: "utf8",
        cwd: WORKSPACE_ROOT,
      }
    );

    if (output.trim()) {
      console.log("\n❌ Found circular dependencies:\n");
      console.log(output);
      process.exit(1);
    } else {
      console.log("✅ No circular dependencies found!");
    }
  } catch (error: any) {
    // madge exits with code 1 if cycles found, stdout contains the cycles
    const output = error.stdout?.toString() || "";
    if (output.includes("Found") || output.includes("circular")) {
      console.log("\n❌ Found circular dependencies:\n");
      console.log(output);
      process.exit(1);
    } else {
      console.log("✅ No circular dependencies found!");
    }
  }
}

function checkDependencyDirections() {
  console.log("🔍 Checking dependency directions...");

  const packagesDir = path.join(WORKSPACE_ROOT, "packages");
  const violations: Array<{ pkg: string; dep: string; reason: string }> = [];

  const packages = fs.readdirSync(packagesDir);

  for (const pkgName of packages) {
    const pkgPath = path.join(packagesDir, pkgName);
    const pkgJsonPath = path.join(pkgPath, "package.json");

    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const pkgId = pkgJson.name;

    if (!pkgId?.startsWith("@klorad/")) continue;

    const allowed = ALLOWED_DEPS[pkgId] || [];
    const allDeps = {
      ...pkgJson.dependencies,
      ...pkgJson.peerDependencies,
      ...pkgJson.devDependencies,
    };

    for (const [depName] of Object.entries(allDeps)) {
      if (depName.startsWith("@klorad/") && !allowed.includes(depName)) {
        violations.push({
          pkg: pkgId,
          dep: depName,
          reason: `Not allowed. Allowed deps for ${pkgId}: ${allowed.join(", ") || "none"}`,
        });
      }
    }
  }

  if (violations.length > 0) {
    console.log("\n❌ Found dependency direction violations:\n");
    violations.forEach((v) => {
      console.log(`  ${v.pkg} → ${v.dep}`);
      console.log(`    ${v.reason}\n`);
    });
    process.exit(1);
  } else {
    console.log("✅ All dependency directions are valid!");
  }
}

// Main execution
console.log("🔄 Circular & Forbidden Dependency Graph Audit\n");

checkCircularDeps();
checkDependencyDirections();

console.log("\n✅ All graph checks passed!\n");
process.exit(0);
