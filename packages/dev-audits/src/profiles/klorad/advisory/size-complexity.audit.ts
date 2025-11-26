// packages/dev-audits/src/profiles/klorad/advisory/size-complexity.audit.ts
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
      ignore: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/*.d.ts", // Exclude type definition files (often auto-generated and legitimately large)
        "**/*.stories.tsx", // Exclude storybook files (documentation/test files)
      ],
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

      // Check React component complexity - only count props in interface/type definitions
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        // Find all Props interfaces/types
        const propsInterfacePattern = /(?:interface|type)\s+(\w+Props)\s*[=:]\s*\{/g;
        let match;

        while ((match = propsInterfacePattern.exec(content)) !== null) {
          const startIndex = match.index + match[0].length - 1; // Position after opening brace
          let braceDepth = 1;
          let currentIndex = startIndex;
          let propCount = 0;
          let inString = false;
          let stringChar = '';

          // Parse the interface body, handling nested braces and strings
          while (braceDepth > 0 && currentIndex < content.length) {
            const char = content[currentIndex];

            // Handle strings
            if ((char === '"' || char === "'" || char === '`') && content[currentIndex - 1] !== '\\') {
              if (!inString) {
                inString = true;
                stringChar = char;
              } else if (char === stringChar) {
                inString = false;
                stringChar = '';
              }
            }

            if (!inString) {
              if (char === '{') {
                braceDepth++;
              } else if (char === '}') {
                braceDepth--;
                if (braceDepth === 0) break;
              } else if (braceDepth === 1 && char === ':') {
                // Found a top-level property (prop name : type)
                // Check if it's a valid prop definition (has identifier before :)
                const beforeColon = content.substring(Math.max(0, currentIndex - 50), currentIndex).trim();
                if (beforeColon.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*[:?]?\s*$/)) {
                  propCount++;
                }
              }
            }

            currentIndex++;
          }

          if (propCount > 16) {
            const line = content.substring(0, match.index).split("\n").length;
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

    return {
      id: "size-complexity",
      title: "File Size & Component Complexity",
      ok: true, // Advisory audits always return ok
      items,
    };
  },
};

