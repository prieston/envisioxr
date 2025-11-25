#!/usr/bin/env node
// packages/dev-audits/src/bin/run-core-audits.ts
/**
 * Run core (blocking) audits
 */
/* eslint-disable no-console */

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { kloradProfile } from "../profiles/klorad/index.js";
import { runProfileAudits } from "../core/audit-runner.js";
import { printReport } from "../core/reporter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find repo root (go up from packages/dev-audits/dist/bin to repo root)
const repoRoot = resolve(__dirname, "../../../..");

async function main() {
  console.log("🔍 Running core audits...\n");
  console.log("=".repeat(80));

  const results = await runProfileAudits(kloradProfile, repoRoot, "core");
  const report = printReport(results);

  if (!report.ok) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

