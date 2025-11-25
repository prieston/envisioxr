// packages/dev-audits/src/profiles/klorad/audits/cesium-engine-boundaries.audit.ts
/**
 * Cesium Engine Boundaries Audit - Enforces that all Cesium code is imported through @klorad/engine-cesium
 */

import path from "path";
import type {
  AuditDefinition,
  AuditContext,
  AuditResult,
} from "../../../core/types.js";

function findLineNumber(content: string, index: number): number {
  return content.substring(0, index).split("\n").length;
}

export const cesiumEngineBoundariesAudit: AuditDefinition = {
  id: "cesium-engine-boundaries",
  title: "Cesium Engine Boundaries Enforcement",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Get all packages to identify engine-cesium package
    const packages = await ctx.workspace.getPackages();

    // Identify engine-cesium package path
    let engineCesiumPath: string | null = null;
    for (const pkg of packages) {
      if (pkg.packageJson.name === "@klorad/engine-cesium") {
        engineCesiumPath = pkg.path;
        break;
      }
    }

    if (!engineCesiumPath) {
      // If engine-cesium package doesn't exist, that's a problem but not something this audit can fix
      return {
        id: "cesium-engine-boundaries",
        title: "Cesium Engine Boundaries Enforcement",
        ok: false,
        items: [
          {
            message: "@klorad/engine-cesium package not found in workspace",
            severity: "error",
            code: "ENGINE_CESIUM_MISSING",
          },
        ],
      };
    }

    // Normalize paths for comparison
    const normalizedEnginePath = path.normalize(engineCesiumPath);

    // Find all TypeScript/TSX files in the workspace
    const allFiles = await ctx.workspace.findFiles("**/*.{ts,tsx}", {
      ignore: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/*.d.ts",
        "**/dev-audits/**",
        "**/scripts/audits/**",
      ],
    });


    for (const file of allFiles) {
      const fullPath = path.isAbsolute(file)
        ? file
        : path.join(ctx.rootDir, file);
      const normalizedFilePath = path.normalize(fullPath);

      // Check if file is inside engine-cesium package
      const isInEngineCesium =
        normalizedFilePath.includes(normalizedEnginePath) ||
        normalizedFilePath.replace(/\\/g, "/").includes(
          normalizedEnginePath.replace(/\\/g, "/")
        );

      // Skip files in engine-cesium - they're allowed to import Cesium
      if (isInEngineCesium) {
        continue;
      }

      const content = await ctx.workspace.readFile(fullPath);

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
        const line = findLineNumber(content, match.index);

        // Create a unique key to avoid duplicates
        const matchKey = `${fullPath}:${line}:${importedModule}`;
        if (seenMatches.has(matchKey)) {
          continue;
        }
        seenMatches.add(matchKey);

        items.push({
          message: `Cesium imports must go through @klorad/engine-cesium; found direct import from "${importedModule}"`,
          file: fullPath,
          line,
          severity: "error",
          code: "CESIUM_IMPORT_OUTSIDE_ENGINE",
        });
      }
    }

    // ok should be true if and only if there are no errors
    const hasError = items.some((i) => i.severity === "error");

    return {
      id: "cesium-engine-boundaries",
      title: "Cesium Engine Boundaries Enforcement",
      ok: !hasError,
      items,
    };
  },
};

