// packages/dev-audits/src/profiles/klorad/audits/api-org.audit.ts
/**
 * API Organization Scoping Audit
 * Based on: api-org-scoping.ts
 */

import path from "path";
import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";

const EXCLUDED_ENDPOINTS = [
  "auth/",
  "admin/",
  "user/route.ts",
  "user/pending-invites/route.ts", // User-scoped endpoint - returns invites for current user
  "organizations/list/route.ts",
  "support/route.ts", // Support email endpoint - doesn't need org scoping
  "plans/route.ts", // Public plans listing - doesn't need org scoping
  "webhooks/stripe/route.ts", // Stripe webhook - external, doesn't need org scoping
  "organizations/create-checkout/route.ts", // Creates new org - doesn't need orgId
  "organizations/invites/accept/route.ts", // Accepts invite - orgId in invite token
];

function isExcludedEndpoint(filePath: string, apiDir: string): boolean {
  const relativePath = path.relative(apiDir, filePath).replace(/\\/g, "/");
  return EXCLUDED_ENDPOINTS.some(
    (excluded) => relativePath === excluded || relativePath.includes(excluded)
  );
}

function isUtilityEndpoint(filePath: string, methodType: string): boolean {
  const relativePath = filePath.replace(/\\/g, "/");
  // PATCH on models/route.ts is utility (signed URL generation)
  if (relativePath.includes("models/route.ts") && methodType === "PATCH") {
    return true;
  }
  // POST on ion-upload/route.ts is utility (Cesium Ion API)
  if (relativePath.includes("ion-upload/route.ts") && methodType === "POST") {
    return true;
  }
  // PUT on ion-upload/route.ts is utility (completing upload)
  if (relativePath.includes("ion-upload/route.ts") && methodType === "PUT") {
    return true;
  }
  return false;
}

function findLineNumber(
  content: string,
  pattern: string,
  startIndex = 0
): number {
  const beforeMatch = content.slice(0, startIndex);
  return beforeMatch.split("\n").length;
}

export const apiOrgAudit: AuditDefinition = {
  id: "api-org",
  title: "API Organization Scoping",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];
    const apiDir = path.join(ctx.rootDir, "apps/editor/app/api");

    if (!ctx.workspace.fileExists(apiDir)) {
      return {
        id: "api-org",
        title: "API Organization Scoping",
        ok: true,
        items: [],
      };
    }

    const apiFiles = await ctx.workspace.findFiles("apps/editor/app/api/**/*.ts", {
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
    });

    for (const file of apiFiles) {
      const fullPath = path.isAbsolute(file)
        ? file
        : path.join(ctx.rootDir, file);
      const content = await ctx.workspace.readFile(file);

      // Skip excluded endpoints
      if (isExcludedEndpoint(fullPath, apiDir)) {
        continue;
      }

      // Special case: POST on organizations/route.ts creates a new organization
      const relativePath = path.relative(apiDir, fullPath).replace(/\\/g, "/");
      if (
        relativePath === "organizations/route.ts" &&
        /export\s+async\s+function\s+POST/.test(content)
      ) {
        continue;
      }

      // Check if it's a route.ts file
      if (!file.endsWith("route.ts")) {
        continue;
      }

      // Find HTTP method handlers
      const methodPatterns = [
        /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(/g,
      ];

      for (const pattern of methodPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const methodType = match[1] as string;
          const methodStartLine = findLineNumber(content, match[0], match.index);

          // Extract function body for analysis
          const functionStart = match.index;
          const functionBody = content.slice(
            functionStart,
            Math.min(functionStart + 2000, content.length)
          );

          // Skip utility endpoints
          if (isUtilityEndpoint(file, methodType)) {
            // Utility endpoints should still require authentication
            const hasAuth =
              /getServerSession/.test(functionBody) &&
              (/Unauthorized.*401/.test(functionBody) ||
                /401/.test(functionBody) ||
                /session\?\.user/.test(functionBody) ||
                /!session/.test(functionBody));

            if (!hasAuth) {
              items.push({
                message: `Utility endpoint ${methodType} should require authentication`,
                file,
                line: methodStartLine,
                severity: "error",
                code: "API_UTILITY_NO_AUTH",
              });
            }
            continue;
          }

          // Check for authentication
          const hasAuth =
            /getServerSession/.test(functionBody) &&
            (/Unauthorized.*401/.test(functionBody) ||
              /401/.test(functionBody) ||
              /session\?\.user/.test(functionBody) ||
              /!session/.test(functionBody) ||
              /session.*user.*id/.test(functionBody));

          if (!hasAuth) {
            items.push({
              message: `Endpoint ${methodType} missing authentication check`,
              file,
              line: methodStartLine,
              severity: "error",
              code: "API_NO_AUTH",
            });
          }

          // Check for organizationId requirement (direct param or via asset check)
          const hasOrgIdCheck =
            /organizationId.*required/i.test(functionBody) ||
            /searchParams\.get\(["']organizationId["']\)/.test(functionBody) ||
            /params.*orgId/.test(functionBody) ||
            /params.*organizationId/.test(functionBody) ||
            /organizationId.*request\.json/.test(functionBody) ||
            /body.*organizationId/.test(functionBody) ||
            // Check if org scoping is done via asset lookup + membership check
            (/existingAsset.*organizationId/.test(functionBody) && /isUserMemberOfOrganization/.test(functionBody)) ||
            (/asset.*organizationId/.test(functionBody) && /isUserMemberOfOrganization/.test(functionBody));

          // Check for membership verification
          const hasMembershipCheck =
            /isUserMemberOfOrganization/.test(functionBody) ||
            /getUserOrganizationIds/.test(functionBody) ||
            /userOrgIds\.includes/.test(functionBody) ||
            /canUserViewPublishedProject/.test(functionBody) ||
            (/isMember/.test(functionBody) &&
              /organizationId/.test(functionBody));

          // Check for organization filtering
          const hasOrgFilter =
            /where.*organizationId/.test(functionBody) ||
            /organizationId.*where/.test(functionBody) ||
            /organizationId:/.test(functionBody) ||
            /organizationId\s*,\s*/.test(functionBody) ||
            /organizationId\s*}/.test(functionBody);

          // For resource endpoints (with [id] params), check if they verify via resource
          const isResourceEndpoint =
            /\[.*Id\]/.test(relativePath) ||
            (/assetId|projectId/.test(functionBody) &&
              (/findUnique[\s\S]*?where[\s\S]*?id/.test(functionBody) ||
               /findUnique.*where.*\{[\s\S]*?id/.test(functionBody)));

          const checksResourceOrg =
            isResourceEndpoint &&
            (/asset\.organizationId|existingAsset\.organizationId/.test(
              functionBody
            ) ||
              /project\.organizationId/.test(functionBody)) &&
            hasMembershipCheck;

          // If it's a resource endpoint that checks via resource org, that's acceptable
          if (checksResourceOrg) {
            continue;
          }

          // Otherwise, require explicit orgId check and filtering
          if (!hasOrgIdCheck && !isResourceEndpoint) {
            items.push({
              message: `Endpoint ${methodType} missing organizationId requirement (${relativePath})`,
              file,
              line: methodStartLine,
              severity: "error",
              code: "API_NO_ORG_ID",
            });
          }

          if (!hasMembershipCheck && !isResourceEndpoint) {
            items.push({
              message: `Endpoint ${methodType} missing organization membership verification (${relativePath})`,
              file,
              line: methodStartLine,
              severity: "error",
              code: "API_NO_MEMBERSHIP_CHECK",
            });
          }

          if (!hasOrgFilter && !isResourceEndpoint && !checksResourceOrg) {
            items.push({
              message: `Endpoint ${methodType} missing organization filtering in query (${relativePath})`,
              file,
              line: methodStartLine,
              severity: "error",
              code: "API_NO_ORG_FILTER",
            });
          }
        }
      }
    }

    return {
      id: "api-org",
      title: "API Organization Scoping",
      ok: items.length === 0,
      items,
    };
  },
};

