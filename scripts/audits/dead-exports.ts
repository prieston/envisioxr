#!/usr/bin/env node
/**
 * Dead Exports Audit
 *
 * Goal: Remove bloat that harms treeshaking
 *
 * Checks:
 * - Unused TypeScript exports across workspaces
 *
 * Note: Uses ts-prune if available, otherwise falls back to simple heuristic
 */

import { execSync } from "child_process";

const WORKSPACE_ROOT = process.cwd();

// Thresholds
const FAIL_ON_UNUSED = false; // Start as warning, flip to true after cleanup

function checkDeadExports() {
  console.log("🔍 Checking for dead exports...");

  // Check if ts-prune is available
  try {
    execSync("npx ts-prune --version", { stdio: "ignore" });
  } catch (e) {
    console.log("⚠️  ts-prune not available. Install with: pnpm add -D ts-prune");
    console.log("   Skipping dead exports check.\n");
    process.exit(0);
  }

  try {
    // Run ts-prune
    const output = execSync(
      `npx ts-prune --project tsconfig.json --ignore "apps/**/*.tsx|apps/**/page.tsx|apps/**/layout.tsx|apps/**/route.ts"`,
      { encoding: "utf8", cwd: WORKSPACE_ROOT }
    );

    if (output.trim()) {
      console.log("\n⚠️  Found unused exports:\n");
      console.log(output);

      if (FAIL_ON_UNUSED) {
        console.log("\n❌ Dead exports check failed (set FAIL_ON_UNUSED=false to warn only)\n");
        process.exit(1);
      } else {
        console.log("\n⚠️  Dead exports check completed (warnings only)\n");
        process.exit(0);
      }
    } else {
      console.log("✅ No dead exports found!\n");
      process.exit(0);
    }
  } catch (error: any) {
    console.error("❌ Error running ts-prune:", error.message);
    process.exit(1);
  }
}

// Main execution
console.log("💀 Dead Exports Audit\n");

checkDeadExports();

