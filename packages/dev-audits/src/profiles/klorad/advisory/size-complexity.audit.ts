/**
 * Size & Complexity Audit (Advisory)
 * Based on: size-complexity.ts
 */

import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";

export const sizeComplexityAudit: AuditDefinition = {
  id: "size-complexity",
  title: "File Size & Component Complexity",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    const sourceFiles = await ctx.workspace.findFiles("**/*.{ts,tsx}", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    for (const file of sourceFiles) {
      const content = await ctx.workspace.readFile(file);
      const lines = content.split("\n");
      const lineCount = lines.length;

      // Warn on large files
      if (lineCount > 500) {
        items.push({
          message: `File exceeds 500 lines (${lineCount} lines) - should be split`,
          file,
          severity: "warning",
          code: "FILE_TOO_LARGE",
        });
      } else if (lineCount > 300) {
        items.push({
          message: `File exceeds 300 lines (${lineCount} lines) - consider splitting`,
          file,
          severity: "info",
          code: "FILE_LARGE",
        });
      }

      // Check React component complexity
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        const componentMatches = content.match(/export\s+(?:default\s+)?(?:function|const)\s+\w+/g);
        if (componentMatches) {
          // Simple heuristic: count props
          const propsMatches = content.match(/:\s*\{[^}]*\}/g);
          if (propsMatches) {
            for (const propsMatch of propsMatches) {
              const propCount = (propsMatch.match(/:/g) || []).length - 1; // Subtract 1 for the opening brace
              if (propCount > 16) {
                const line = content.substring(0, content.indexOf(propsMatch)).split("\n").length;
                items.push({
                  message: `Component has ${propCount} props (threshold: 16) - consider splitting`,
                  file,
                  line,
                  severity: "warning",
                  code: "TOO_MANY_PROPS",
                });
              }
            }
          }
        }
      }
    }

    return {
      id: "size-complexity",
      title: "File Size & Component Complexity",
      ok: true, // Advisory audits always return ok
      items,
    };
  },
};

