/**
 * Audit runner - executes audits for a profile
 */

import type { ProjectProfile, AuditResult, AuditContext } from "./types.js";
import { createWorkspace } from "./workspace.js";

export async function runProfileAudits(
  profile: ProjectProfile,
  rootDir: string,
  mode: "core" | "advisory"
): Promise<AuditResult[]> {
  // Load manifest
  const manifest = await profile.loadManifest(rootDir);

  // Create workspace
  const workspace = createWorkspace(rootDir);

  // Create audit context
  const ctx: AuditContext = {
    rootDir,
    manifest,
    workspace,
  };

  // Get audits based on mode
  const audits =
    mode === "core"
      ? await profile.getCoreAudits(rootDir)
      : await profile.getAdvisoryAudits(rootDir);

  // Run audits sequentially
  const results: AuditResult[] = [];
  for (const audit of audits) {
    try {
      const result = await audit.run(ctx);
      results.push(result);
    } catch (error) {
      results.push({
        id: audit.id,
        title: audit.title,
        ok: false,
        items: [
          {
            message: `Audit failed with error: ${error instanceof Error ? error.message : String(error)}`,
            severity: "error",
          },
        ],
      });
    }
  }

  return results;
}
