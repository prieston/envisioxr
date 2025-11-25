/**
 * Cesium Lifecycle Audit
 * Based on: cesium-lifecycle.ts
 */

import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";

function findLineNumber(content: string, searchString: string): number | null {
  const index = content.indexOf(searchString);
  if (index === -1) return null;
  return content.substring(0, index).split("\n").length;
}

export const cesiumAudit: AuditDefinition = {
  id: "cesium",
  title: "Cesium Lifecycle & Memory",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Focus on Cesium-related files
    const cesiumFiles = await ctx.workspace.findFiles(
      "**/*.{ts,tsx}",
      {
        ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
      }
    );

    const relevantFiles = cesiumFiles.filter(
      (file) =>
        (file.includes("engine-cesium") ||
        file.includes("cesium") ||
        file.includes("Cesium") ||
        file.includes("Builder")) &&
        !file.includes("scripts/audits") && // Skip audit scripts themselves
        !file.includes("dev-audits") && // Skip audit package files
        !file.includes(".d.ts") // Skip type definition files
    );

    for (const file of relevantFiles) {
      const content = await ctx.workspace.readFile(file);

      // Check 1: primitives.add() without matching remove()
      // Only flag if there's a significant mismatch (allows for conditional cleanup)
      const primitiveAdds = (content.match(/\.primitives\.add\(/g) || []).length;
      const primitiveRemoves =
        (content.match(/\.primitives\.remove\(/g) || []).length;
      const primitiveRemoveAlls =
        (content.match(/\.primitives\.removeAll\(/g) || []).length;

      if (primitiveAdds > 0) {
        const totalRemoves = primitiveRemoves + primitiveRemoveAlls;
        // Only flag if adds significantly exceed removes (allows for conditional cleanup in useEffect)
        // Also skip if there's a cleanup function in useEffect
        const hasCleanup = content.includes("return () =>") || content.includes("return() =>");
        if (primitiveAdds > totalRemoves && !hasCleanup && primitiveAdds - totalRemoves > 1) {
          const line = findLineNumber(content, ".primitives.add(");
          items.push({
            message: `Found ${primitiveAdds} primitives.add() but only ${totalRemoves} remove() calls - memory leak risk`,
            file,
            line: line || undefined,
            severity: "error",
            code: "CESIUM_PRIMITIVE_LEAK",
          });
        }
      }

      // Check 2: viewer.entities.add() without remove()
      const entityAdds = (content.match(/\.entities\.add\(/g) || []).length;
      const entityRemoves = (content.match(/\.entities\.remove\(/g) || []).length;
      const entityRemoveAlls =
        (content.match(/\.entities\.removeAll\(/g) || []).length;

      if (entityAdds > 0 && entityAdds > entityRemoves + entityRemoveAlls) {
        const line = findLineNumber(content, ".entities.add(");
        items.push({
          message: `Found ${entityAdds} entities.add() but only ${entityRemoves + entityRemoveAlls} remove() calls - memory leak`,
          file,
          line: line || undefined,
          severity: "error",
          code: "CESIUM_ENTITY_LEAK",
        });
      }

      // Check 3: Multiple viewer instances
      const viewerInstances =
        (content.match(/new\s+Cesium\.Viewer\(/g) || []).length;
      if (viewerInstances > 1) {
        const line = findLineNumber(content, "new Cesium.Viewer");
        items.push({
          message: `Found ${viewerInstances} Cesium Viewer instances - should only have one per component`,
          file,
          line: line || undefined,
          severity: "error",
          code: "CESIUM_MULTIPLE_VIEWERS",
        });
      }

      // Check 4: useEffect without cleanup when using Cesium APIs
      if (content.includes("cesiumViewer") || content.includes("viewer.")) {
        const useEffectPattern =
          /useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*\[.*?\]\)/g;
        const matches = [...content.matchAll(useEffectPattern)];

        for (const match of matches) {
          const effectBody = match[1];
          if (
            effectBody.match(/\.(add|remove|set|update)/) &&
            !effectBody.includes("return")
          ) {
            const line = findLineNumber(content, match[0]);
            items.push({
              message:
                "useEffect modifies Cesium entities/primitives but no cleanup function",
              file,
              line: line || undefined,
              severity: "error",
              code: "CESIUM_MISSING_CLEANUP",
            });
          }
        }
      }

      // Check 5: TilesRenderer without cleanup
      if (content.includes("TilesRenderer")) {
        const tilesRendererInstances =
          (content.match(/new\s+TilesRenderer\(/g) || []).length;
        const disposePattern = /\.dispose\(/;

        if (tilesRendererInstances > 0 && !disposePattern.test(content)) {
          const line = findLineNumber(content, "TilesRenderer");
          items.push({
            message: "TilesRenderer created but no dispose() call found",
            file,
            line: line || undefined,
            severity: "error",
            code: "CESIUM_TILES_NO_DISPOSE",
          });
        }
      }
    }

    return {
      id: "cesium",
      title: "Cesium Lifecycle & Memory",
      ok: items.length === 0,
      items,
    };
  },
};

