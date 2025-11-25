// packages/dev-audits/src/profiles/klorad/audits/ui-boundaries.audit.ts
/**
 * UI Boundaries Audit - Enforces React/MUI usage boundaries and design system rules
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

export const uiBoundariesAudit: AuditDefinition = {
  id: "ui-boundaries",
  title: "UI Boundaries & Design System Enforcement",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Get all packages to identify UI-allowed vs non-UI packages
    const packages = await ctx.workspace.getPackages();

    // Identify UI-allowed packages: @klorad/ui and anything under /apps/
    const uiAllowedPackages = new Set<string>();
    const nonUIPackages: Array<{ name: string; path: string }> = [];

    for (const pkg of packages) {
      if (pkg.packageJson.name === "@klorad/ui") {
        uiAllowedPackages.add(pkg.path);
      } else if (pkg.path.includes("/apps/")) {
        uiAllowedPackages.add(pkg.path);
      } else if (pkg.packageJson.name?.startsWith("@klorad/")) {
        nonUIPackages.push({ name: pkg.packageJson.name, path: pkg.path });
      }
    }

    // Check 1: Forbid React in non-UI packages
    for (const pkg of nonUIPackages) {
      // Skip dev-audits package itself
      if (pkg.name === "@klorad/dev-audits") continue;

      const pkgFiles = await ctx.workspace.findFiles("**/*.{ts,tsx}", {
        cwd: pkg.path,
        ignore: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
      });

      for (const file of pkgFiles) {
        const fullPath = path.isAbsolute(file) ? file : path.join(pkg.path, file);
        const content = await ctx.workspace.readFile(fullPath);

        // Check for React imports (more specific pattern to avoid false positives)
        // Match: import ... from "react" or import React from "react"
        const reactImportPattern = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+|\w+\s*,\s*\{[^}]*\})\s+from\s+['"]react['"]/g;
        const reactDomPattern = /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]react-dom['"]/g;

        let match;
        while ((match = reactImportPattern.exec(content)) !== null) {
          // Skip type-only imports
          const beforeMatch = content.substring(Math.max(0, match.index - 10), match.index);
          if (beforeMatch.includes("type ")) continue;

          const line = findLineNumber(content, match.index);
          items.push({
            message: "React usage is not allowed in this package; React components must live in @klorad/ui or apps/",
            file: fullPath,
            line,
            severity: "error",
            code: "REACT_IMPORT_OUTSIDE_UI",
          });
        }

        while ((match = reactDomPattern.exec(content)) !== null) {
          const beforeMatch = content.substring(Math.max(0, match.index - 10), match.index);
          if (beforeMatch.includes("type ")) continue;

          const line = findLineNumber(content, match.index);
          items.push({
            message: "React usage is not allowed in this package; React components must live in @klorad/ui or apps/",
            file: fullPath,
            line,
            severity: "error",
            code: "REACT_IMPORT_OUTSIDE_UI",
          });
        }

        // Check for JSX usage - only flag .tsx files or files with clear JSX patterns
        // Skip .ts files to avoid false positives from TypeScript generics
        if (file.endsWith(".tsx")) {
          // Look for JSX patterns: <ComponentName ...> or </ComponentName>
          // More specific: must have whitespace, attributes, or be a closing tag
          const jsxPattern = /<[A-Z][A-Za-z0-9]*\s+[^>]*>|<\/[A-Z][A-Za-z0-9]*>|<[A-Z][A-Za-z0-9]*\/>/g;
          const jsxMatches = [...content.matchAll(jsxPattern)];
          if (jsxMatches.length > 0) {
            const jsxMatch = jsxMatches[0];
            if (jsxMatch.index !== undefined) {
              // Skip if it's in a comment or string
              const beforeMatch = content.substring(Math.max(0, jsxMatch.index - 100), jsxMatch.index);
              if (!beforeMatch.includes("//") && !beforeMatch.match(/\/\*/)) {
                const line = findLineNumber(content, jsxMatch.index);
                items.push({
                  message: "JSX/React components are not allowed in this package; move to @klorad/ui or an app",
                  file: fullPath,
                  line,
                  severity: "error",
                  code: "JSX_OUTSIDE_UI",
                });
              }
            }
          }
        }
      }
    }

    // Check 2: Forbid MUI outside @klorad/ui
    const allFiles = await ctx.workspace.findFiles("**/*.{ts,tsx}", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/*.d.ts", "**/dev-audits/**"],
    });

    for (const file of allFiles) {
      const fullPath = path.isAbsolute(file) ? file : path.join(ctx.rootDir, file);
      const content = await ctx.workspace.readFile(fullPath);

      // Check if file is under @klorad/ui
      const isUIPackage = fullPath.includes("/packages/ui/") || fullPath.includes("packages\\ui\\");

      // Check for MUI imports
      const muiImportPattern = /from\s+['"](@mui\/[^'"]+)['"]/g;
      let match;
      while ((match = muiImportPattern.exec(content)) !== null) {
        if (!isUIPackage) {
          const line = findLineNumber(content, match.index);
          items.push({
            message: "MUI usage is restricted to @klorad/ui; use @klorad/ui components instead of importing MUI directly",
            file: fullPath,
            line,
            severity: "error",
            code: "MUI_OUTSIDE_UI",
          });
        }
      }
    }

    // Check 3: Apps should not define reusable components
    const appComponentFiles = await ctx.workspace.findFiles("apps/**/components/**/*.tsx", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    // Also check for apps/**/ui/**/*.tsx
    const appUIFiles = await ctx.workspace.findFiles("apps/**/ui/**/*.tsx", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    for (const file of [...appComponentFiles, ...appUIFiles]) {
      const fullPath = path.isAbsolute(file) ? file : path.join(ctx.rootDir, file);
      // Skip page.tsx, layout.tsx, template.tsx, etc. - those are route segments
      if (
        file.endsWith("page.tsx") ||
        file.endsWith("layout.tsx") ||
        file.endsWith("template.tsx") ||
        file.endsWith("loading.tsx") ||
        file.endsWith("error.tsx") ||
        file.endsWith("not-found.tsx")
      ) {
        continue;
      }

      items.push({
        message: "Reusable components under apps/**/components should live in @klorad/ui instead",
        file: fullPath,
        severity: "error",
        code: "APP_COMPONENT_OUTSIDE_UI",
      });
    }

    // Check 4: No inline styles anywhere
    const tsxFiles = await ctx.workspace.findFiles("**/*.tsx", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/*.d.ts", "**/dev-audits/**"],
    });

    for (const file of tsxFiles) {
      const fullPath = path.isAbsolute(file) ? file : path.join(ctx.rootDir, file);
      const content = await ctx.workspace.readFile(fullPath);

      // Find inline style patterns: style={{ ... }}
      const inlineStylePattern = /style\s*=\s*\{\s*\{/g;
      let match;
      while ((match = inlineStylePattern.exec(content)) !== null) {
        const line = findLineNumber(content, match.index);
        items.push({
          message: "Inline styles (style={{ ... }}) are not allowed; use @klorad/ui styling patterns instead",
          file: fullPath,
          line,
          severity: "error",
          code: "INLINE_STYLE_FORBIDDEN",
        });
      }
    }

    // Check 5: Warn on third-party UI imports in apps
    const appFiles = await ctx.workspace.findFiles("apps/**/*.tsx", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    const thirdPartyUIPatterns = [
      /^antd$/,
      /^@chakra-ui\//,
      /^@headlessui\//,
      /^react-bootstrap$/,
      /^@radix-ui\//,
      /^@mantine\//,
      /^@shadcn\//,
      /^@nextui-org\//,
    ];

    for (const file of appFiles) {
      const fullPath = path.isAbsolute(file) ? file : path.join(ctx.rootDir, file);
      const content = await ctx.workspace.readFile(fullPath);

      const importPattern = /from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importPattern.exec(content)) !== null) {
        const importedModule = match[1];
        for (const pattern of thirdPartyUIPatterns) {
          if (pattern.test(importedModule)) {
            const line = findLineNumber(content, match.index);
            items.push({
              message: `App imports UI directly from ${importedModule}; prefer using @klorad/ui as the abstraction layer`,
              file: fullPath,
              line,
              severity: "warning",
              code: "THIRDPARTY_UI_IN_APP",
            });
            break; // Only warn once per import
          }
        }
      }
    }

    // ok should be true if and only if there are no errors
    const hasError = items.some((i) => i.severity === "error");

    return {
      id: "ui-boundaries",
      title: "UI Boundaries & Design System Enforcement",
      ok: !hasError,
      items,
    };
  },
};

