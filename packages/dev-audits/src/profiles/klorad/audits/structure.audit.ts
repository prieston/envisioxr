/**
 * Structure Audit - Package boundaries, dependency graph, and module organization
 * Merges logic from: boundaries.ts, graph.ts, dependencies.ts, module-boundaries.ts
 */

import { execSync } from "child_process";
import path from "path";
import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";
import type { KloradManifest } from "../klorad.manifest.js";

export const structureAudit: AuditDefinition = {
  id: "structure",
  title: "Package Structure & Dependencies",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const manifest = ctx.manifest as KloradManifest;
    const items: AuditResult["items"] = [];

    // Check 1: Package.json exports must point to dist/**, not src/**
    const packages = await ctx.workspace.getPackages();
    for (const pkg of packages) {
      if (!pkg.packageJson.name?.startsWith("@klorad/")) continue;

      // Check main, module, types
      const checkFields = [
        { key: "main", value: pkg.packageJson.main },
        { key: "module", value: pkg.packageJson.module },
        { key: "types", value: pkg.packageJson.types },
      ];

      for (const field of checkFields) {
        if (field.value && typeof field.value === "string") {
          if (field.value.includes("/src/") || field.value.startsWith("src/")) {
            items.push({
              message: `${pkg.name}: ${field.key} points to src/: "${field.value}"`,
              file: path.join(pkg.path, "package.json"),
              severity: "error",
              code: "EXPORT_SRC_LEAK",
            });
          }
        }
      }

      // Check exports field
      if (pkg.packageJson.exports) {
        const checkExports = (exports: unknown, prefix = ""): void => {
          if (typeof exports === "string") {
            if (exports.includes("/src/") || exports.startsWith("src/")) {
              items.push({
                message: `${pkg.name}: exports${prefix} points to src/: "${exports}"`,
                file: path.join(pkg.path, "package.json"),
                severity: "error",
                code: "EXPORT_SRC_LEAK",
              });
            }
          } else if (typeof exports === "object" && exports !== null) {
            for (const [key, value] of Object.entries(exports)) {
              checkExports(value, `${prefix}.${key}`);
            }
          }
        };
        checkExports(pkg.packageJson.exports);
      }
    }

    // Check 2: No app imports from @klorad/*/src/** or /dist/chunk-*
    const appFiles = await ctx.workspace.findFiles("apps/**/*.{ts,tsx}", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    for (const file of appFiles) {
      const content = await ctx.workspace.readFile(file);
      const importPattern = /from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importPattern.exec(content)) !== null) {
        const imported = match[1];
        if (
          imported.includes("@klorad/") &&
          (imported.includes("/src/") || imported.includes("/dist/chunk-"))
        ) {
          const line = content.substring(0, match.index).split("\n").length;
          items.push({
            message: `App imports from internal path: ${imported}`,
            file,
            line,
            severity: "error",
            code: "APP_IMPORT_INTERNAL",
          });
        }
      }
    }

    // Check 3: Circular dependencies
    try {
      execSync("npx madge --version", {
        stdio: "ignore",
      });
    } catch {
      items.push({
        message: "madge not available. Install with: pnpm add -D madge",
        severity: "warning",
        code: "MADGE_MISSING",
      });
    }

    try {
      execSync(
        `npx madge --circular --extensions ts,tsx apps packages`,
        {
          encoding: "utf8",
          cwd: ctx.rootDir,
          stdio: "pipe",
        }
      );
      // If output is empty, no cycles
    } catch (error: unknown) {
      const err = error as { stdout?: Buffer; stderr?: Buffer };
      const output = err.stdout?.toString() || err.stderr?.toString() || "";
      if (output.includes("Found") || output.includes("circular")) {
        items.push({
          message: `Circular dependencies detected:\n${output}`,
          severity: "error",
          code: "CIRCULAR_DEPS",
        });
      }
    }

    // Check 4: Dependency direction rules
    for (const pkg of packages) {
      if (!pkg.packageJson.name?.startsWith("@klorad/")) continue;

      const allDeps = {
        ...pkg.packageJson.dependencies,
        ...pkg.packageJson.peerDependencies,
        ...pkg.packageJson.devDependencies,
      };

      // Check against manifest rules
      for (const rule of manifest.dependencyRules) {
        const fromPattern = rule.from.replace(/\*/g, ".*");
        const fromRegex = new RegExp(`^${fromPattern}$`);

        if (!fromRegex.test(pkg.packageJson.name)) continue;

        if (rule.forbidden) {
          // Check if any @klorad dependency matches the forbidden pattern
          const toPattern = rule.to?.replace(/\*/g, ".*") || ".*";
          const toRegex = new RegExp(`^${toPattern}$`);

          for (const [depName] of Object.entries(allDeps)) {
            // Only check @klorad/* dependencies for forbidden rules
            if (depName.startsWith("@klorad/") && toRegex.test(depName)) {
              items.push({
                message: `${pkg.name} → ${depName} violates forbidden rule: ${rule.from} → ${rule.to}`,
                file: path.join(pkg.path, "package.json"),
                severity: "error",
                code: "FORBIDDEN_DEP",
              });
            }
          }
        } else if (rule.to) {
          // Check if @klorad dependencies match allowed pattern
          const toPattern = rule.to.replace(/\*/g, ".*");
          const toRegex = new RegExp(`^${toPattern}$`);

          for (const [depName] of Object.entries(allDeps)) {
            // Only check @klorad/* dependencies
            if (depName.startsWith("@klorad/") && !toRegex.test(depName)) {
              items.push({
                message: `${pkg.name} → ${depName} not allowed. Allowed pattern: ${rule.to}`,
                file: path.join(pkg.path, "package.json"),
                severity: "error",
                code: "INVALID_DEP",
              });
            }
          }
        }
      }
    }

    // Check 5: Files exceeding reasonable size (from module-boundaries)
    // Skip vendor files, generated files, and scripts
    const sourceFiles = await ctx.workspace.findFiles("**/*.{ts,tsx}", {
      ignore: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/vendor/**",
        "**/*.d.ts",
        "scripts/**",
      ],
    });

    for (const file of sourceFiles) {
      // Skip vendor and generated files, and audit files themselves
      if (
        file.includes("/vendor/") ||
        file.includes(".d.ts") ||
        file.startsWith("scripts/") ||
        file.includes("dev-audits") ||
        file.includes("audits/")
      ) {
        continue;
      }

      const content = await ctx.workspace.readFile(file);
      const lines = content.split("\n");
      const lineCount = lines.length;

      // Skip API client files, admin pages (internal tools), and generated files - they're legitimately large
      const isApiClient = file.includes("/utils/api.ts") || file.includes("/api/");
      const isGenerated = file.includes(".generated.") || file.includes(".d.ts");
      const isAdminPage = file.includes("/admin/") || file.includes("AdminDashboard");
      // Detect page components more accurately - they're in app directory and named page.tsx/page.ts
      const isPageComponent = (file.includes("/page.tsx") || file.includes("/page.ts")) &&
                              (file.includes("/app/") || file.includes("apps/"));

      // Files that are legitimately complex and should have higher thresholds
      const isHookFile = file.includes("/hooks/") || (file.includes("use") && file.endsWith(".ts"));
      const isStyleFile = file.includes(".styles.ts") || file.includes(".styles.tsx");
      const isStoryFile = file.includes(".stories.") || file.includes("/stories/");
      // SDK files include sdk/, helpers/, lib/ (utility libraries), and sync files
      const isSDKFile = file.includes("/sdk/") || file.includes("/helpers/") ||
                       file.includes("/lib/") || file.includes("sync.ts");
      const isComponentFile = file.includes("/components/") && (file.endsWith(".tsx") || file.endsWith(".ts"));

      // Admin pages and API routes are exempt from strict size limits
      if (isAdminPage || isApiClient || isGenerated) {
        continue;
      }

      // Different thresholds for different file types
      // Check special cases first (order matters!)
      let errorThreshold = 1000;
      let warningThreshold = 500;
      let infoThreshold = 300;

      // Special handling for Cesium control files - they're complex by nature (check first)
      if (file.includes("CesiumControls") || file.includes("controllers/") || file.includes("CameraController")) {
        errorThreshold = 500;
        warningThreshold = 450;
        infoThreshold = 450; // Increased from 400
      } else if (isPageComponent) {
        // Page components can be complex with forms, tables, modals, etc.
        errorThreshold = 1500;
        warningThreshold = 1200; // Increased from 1000 to accommodate complex pages
        infoThreshold = 1100; // Increased from 800 to eliminate false positives
      } else if (isHookFile || isSDKFile) {
        // Hooks and SDK files often need to be cohesive
        errorThreshold = 800;
        warningThreshold = 550; // Increased from 500
        infoThreshold = 500; // Increased from 450
      } else if (isStyleFile) {
        // Style files can be large due to theme definitions
        errorThreshold = 600;
        warningThreshold = 500; // Increased from 400
        infoThreshold = 450; // Increased from 400
      } else if (isStoryFile) {
        // Storybook files can be large with multiple stories
        errorThreshold = 500;
        warningThreshold = 400;
        infoThreshold = 350;
      } else if (isComponentFile) {
        // Components can be complex but should still be manageable
        // Dashboard/layout components can be larger due to navigation logic
        const isDashboardComponent = file.includes("Dashboard") || file.includes("Sidebar") || file.includes("Layout");
        errorThreshold = isDashboardComponent ? 900 : 600;
        warningThreshold = isDashboardComponent ? 900 : 500; // Increased from 700/450
        infoThreshold = isDashboardComponent ? 900 : 500; // Increased from 700 to eliminate false positives
      }

      if (lineCount > errorThreshold) {
        items.push({
          message: `File exceeds ${errorThreshold} lines (${lineCount} lines) - should be split`,
          file,
          severity: "error",
          code: "FILE_TOO_LARGE",
        });
      } else if (lineCount > warningThreshold) {
        items.push({
          message: `File exceeds ${warningThreshold} lines (${lineCount} lines) - consider splitting`,
          file,
          severity: "warning",
          code: "FILE_LARGE",
        });
      } else if (lineCount > infoThreshold && !isHookFile && !isSDKFile && !isStyleFile && !isStoryFile) {
        // Only show info-level warnings for non-complex file types
        items.push({
          message: `File exceeds ${infoThreshold} lines (${lineCount} lines) - consider splitting`,
          file,
          severity: "info",
          code: "FILE_LARGE",
        });
      }
    }

    return {
      id: "structure",
      title: "Package Structure & Dependencies",
      ok: items.filter((i) => i.severity === "error").length === 0,
      items,
    };
  },
};

