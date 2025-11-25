// packages/dev-audits/src/profiles/klorad/audits/ssr-rsc.audit.ts
/**
 * SSR/RSC Audit - Server/client boundary correctness
 * Merges logic from: ssr-guards.ts, hydration.ts
 */

import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";

const BANNED_IMPORTS = [
  /^three$/,
  /^@react-three\//,
  /^cesium$/,
  /^@cesium\//,
  /^3d-tiles-renderer$/,
  /^mapbox-gl$/,
  /^react-dom$/,
];

const BANNED_GLOBALS = [
  /\bwindow\s*[.=]/,
  /\bdocument\s*[.=]/,
  /\bnavigator\s*[.=]/,
  /\blocalStorage\s*[.=]/,
  /\bsessionStorage\s*[.=]/,
];

function isServerFile(filePath: string, content: string): boolean {
  const hasUseClient =
    content.includes('"use client"') || content.includes("'use client'");

  const isApiRoute = filePath.includes("/api/") && filePath.endsWith("route.ts");
  const isLayout = filePath.endsWith("layout.tsx");
  const isPage = filePath.endsWith("page.tsx");
  const isServerComponent =
    filePath.includes("/app/") &&
    (filePath.endsWith(".tsx") || filePath.endsWith(".ts"));

  if (hasUseClient) {
    return false;
  }

  return isApiRoute || isLayout || isPage || isServerComponent;
}

function findLineNumber(content: string, index: number): number {
  return content.substring(0, index).split("\n").length;
}

export const ssrRscAudit: AuditDefinition = {
  id: "ssr-rsc",
  title: "SSR/RSC Boundary Correctness",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Find all app files
    const appFiles = await ctx.workspace.findFiles("apps/**/*.{ts,tsx}", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    for (const file of appFiles) {
      const content = await ctx.workspace.readFile(file);

      if (!isServerFile(file, content)) {
        continue;
      }

      // Check for banned imports
      const importPattern = /from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importPattern.exec(content)) !== null) {
        const importedModule = match[1];
        for (const banned of BANNED_IMPORTS) {
          if (banned.test(importedModule)) {
            const line = findLineNumber(content, match.index);
            items.push({
              message: `Server file imports client-only module: ${importedModule}`,
              file,
              line,
              severity: "error",
              code: "SSR_CLIENT_IMPORT",
            });
          }
        }
      }

      // Check for banned globals (but skip if they're in string literals or typeof checks)
      for (const banned of BANNED_GLOBALS) {
        // Ensure regex is global for matchAll
        const globalRegex = new RegExp(banned.source, banned.flags.includes('g') ? banned.flags : banned.flags + 'g');
        const globalMatches = [...content.matchAll(globalRegex)];
        for (const globalMatch of globalMatches) {
          if (globalMatch.index === undefined) continue;

          // Check if it's in a string literal or typeof check
          const beforeMatch = content.substring(Math.max(0, globalMatch.index - 50), globalMatch.index);
          const afterMatch = content.substring(globalMatch.index, Math.min(content.length, globalMatch.index + 50));

          // Skip if it's in a typeof check or string literal
          if (
            beforeMatch.includes("typeof") ||
            beforeMatch.match(/['"`][^'"`]*$/) ||
            afterMatch.match(/^[^'"`]*['"`]/)
          ) {
            continue;
          }

          const line = findLineNumber(content, globalMatch.index);
          items.push({
            message: `Server file uses browser global: ${globalMatch[0]}`,
            file,
            line,
            severity: "error",
            code: "SSR_BROWSER_GLOBAL",
          });
        }
      }

      // Check for Cesium imports in server components
      const cesiumImportRe =
        /from\s+['"](@klorad\/engine-cesium|@cesium\/|cesium|@klorad\/ion-sdk)/g;
      let cesiumMatch;
      while ((cesiumMatch = cesiumImportRe.exec(content)) !== null) {
        const line = findLineNumber(content, cesiumMatch.index);
        items.push({
          message: `Server component imports Cesium: ${cesiumMatch[1]}`,
          file,
          line,
          severity: "error",
          code: "SSR_CESIUM_IMPORT",
        });
      }

      // Check for window/document in RSC (but skip dangerouslySetInnerHTML scripts)
      if (
        (content.includes("window") || content.includes("document")) &&
        !content.includes("typeof window") &&
        !content.includes("typeof document") &&
        !content.includes("dangerouslySetInnerHTML")
      ) {
        // Find actual usage (not in comments or strings)
        const windowMatches = [...content.matchAll(/\bwindow\b/g)];
        const docMatches = [...content.matchAll(/\bdocument\b/g)];

        for (const match of [...windowMatches, ...docMatches]) {
          if (match.index === undefined) continue;

          // Skip if in dangerouslySetInnerHTML context
          const beforeMatch = content.substring(Math.max(0, match.index - 100), match.index);
          if (beforeMatch.includes("dangerouslySetInnerHTML")) {
            continue;
          }

          const line = findLineNumber(content, match.index);
          items.push({
            message: "Server component uses window/document without guard",
            file,
            line,
            severity: "error",
            code: "SSR_WINDOW_DOC",
          });
          break; // Only report once per file
        }
      }
    }

    // Check for missing "use client" on Cesium components
    const cesiumComponentFiles = await ctx.workspace.findFiles(
      "**/*.{ts,tsx}",
      {
        ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
      }
    );

    for (const file of cesiumComponentFiles) {
      const content = await ctx.workspace.readFile(file);
      const hasCesiumImport =
        /from\s+['"](@klorad\/engine-cesium|@cesium\/|cesium)/.test(content);
      const hasUseClient =
        content.includes('"use client"') || content.includes("'use client'");
      const isInApp = file.includes("/app/");

      if (hasCesiumImport && isInApp && !hasUseClient) {
        items.push({
          message: "Cesium component missing 'use client' directive",
          file,
          severity: "error",
          code: "MISSING_USE_CLIENT",
        });
      }
    }

    return {
      id: "ssr-rsc",
      title: "SSR/RSC Boundary Correctness",
      ok: items.filter((i) => i.severity === "error").length === 0,
      items,
    };
  },
};

