// packages/dev-audits/src/profiles/klorad/audits/threejs-engine-boundaries.audit.ts
/**
 * Three.js Engine Boundaries Audit - Enforces that all Three.js code is imported through @klorad/engine-three
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

export const threejsEngineBoundariesAudit: AuditDefinition = {
  id: "threejs-engine-boundaries",
  title: "Three.js Engine Boundaries Enforcement",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Get all packages to identify engine-three package
    const packages = await ctx.workspace.getPackages();

    // Identify engine-three package path
    let engineThreePath: string | null = null;
    for (const pkg of packages) {
      if (pkg.packageJson.name === "@klorad/engine-three") {
        engineThreePath = pkg.path;
        break;
      }
    }

    if (!engineThreePath) {
      // If engine-three package doesn't exist, that's a problem but not something this audit can fix
      return {
        id: "threejs-engine-boundaries",
        title: "Three.js Engine Boundaries Enforcement",
        ok: false,
        items: [
          {
            message: "@klorad/engine-three package not found in workspace",
            severity: "error",
            code: "ENGINE_THREE_MISSING",
          },
        ],
      };
    }

    // Normalize paths for comparison
    const normalizedEnginePath = path.normalize(engineThreePath);

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

      // Check if file is inside engine-three package
      const isInEngineThree =
        normalizedFilePath.includes(normalizedEnginePath) ||
        normalizedFilePath.replace(/\\/g, "/").includes(
          normalizedEnginePath.replace(/\\/g, "/")
        );

      // Skip files in engine-three - they're allowed to import Three.js
      if (isInEngineThree) {
        continue;
      }

      const content = await ctx.workspace.readFile(fullPath);

      // Track matches to avoid duplicates (same file, line, and module)
      const seenMatches = new Set<string>();

      // Check for Three.js imports - match "from 'three'" or "from '@react-three/...'" etc.
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
          const line = findLineNumber(content, match.index);

          // Create a unique key to avoid duplicates
          const matchKey = `${fullPath}:${line}:${importedModule}`;
          if (seenMatches.has(matchKey)) {
            continue;
          }
          seenMatches.add(matchKey);

          items.push({
            message: `Three.js imports must go through @klorad/engine-three; found direct import from "${importedModule}"`,
            file: fullPath,
            line,
            severity: "error",
            code: "THREEJS_IMPORT_OUTSIDE_ENGINE",
          });
        }
      }
    }

    // ok should be true if and only if there are no errors
    const hasError = items.some((i) => i.severity === "error");

    return {
      id: "threejs-engine-boundaries",
      title: "Three.js Engine Boundaries Enforcement",
      ok: !hasError,
      items,
    };
  },
};

