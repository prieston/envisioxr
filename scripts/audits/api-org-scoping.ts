#!/usr/bin/env node
/**
 * API Organization Scoping Audit
 *
 * Goal: Ensure all API endpoints (except login, logout, and admin) are properly scoped under organizationId
 *
 * Checks:
 * - All API route handlers require organizationId (query param, route param, or request body)
 * - All endpoints verify user membership before returning data
 * - All endpoints filter results by organizationId
 * - Proper error handling (400/403) for missing/invalid org access
 * - No data leakage between organizations
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();
const API_DIR = path.join(WORKSPACE_ROOT, "apps/editor/app/api");

interface Issue {
  file: string;
  line: number;
  severity: "critical" | "high" | "medium" | "info";
  message: string;
  code?: string;
  fix?: string;
}

const issues: Issue[] = [];

// Endpoints that should be excluded from org scoping
const EXCLUDED_ENDPOINTS = [
  "auth/",
  "admin/",
  "user/route.ts", // User info endpoint - returns user's default org
  "organizations/list/route.ts", // Returns all user's orgs
];

// Endpoints that are utility endpoints (documented exceptions)
// Note: This is checked via isUtilityEndpoint function, not used directly

// Legacy endpoints (should be deprecated)
const LEGACY_ENDPOINTS = [
  "organizations/route.ts", // GET/PATCH - returns default org (not organizations/[orgId]/route.ts)
];

function findLineNumber(content: string, pattern: string, startIndex = 0): number {
  const beforeMatch = content.slice(0, startIndex);
  return beforeMatch.split("\n").length;
}

function isExcludedEndpoint(filePath: string): boolean {
  const relativePath = path.relative(API_DIR, filePath).replace(/\\/g, "/");
  return EXCLUDED_ENDPOINTS.some((excluded) => relativePath === excluded || relativePath.includes(excluded));
}

function isUtilityEndpoint(filePath: string, methodType: string): boolean {
  const relativePath = path.relative(API_DIR, filePath).replace(/\\/g, "/");
  // PATCH on models/route.ts is utility (signed URL generation)
  if (relativePath === "models/route.ts" && methodType === "PATCH") {
    return true;
  }
  // POST on ion-upload/route.ts is utility (Cesium Ion API)
  if (relativePath === "ion-upload/route.ts" && methodType === "POST") {
    return true;
  }
  return false;
}

function isLegacyEndpoint(filePath: string): boolean {
  const relativePath = path.relative(API_DIR, filePath).replace(/\\/g, "/");
  return LEGACY_ENDPOINTS.some((legacy) => relativePath === legacy || relativePath.includes(legacy));
}

function checkEndpoint(filePath: string, content: string) {
  const relativePath = path.relative(API_DIR, filePath).replace(/\\/g, "/");

  // Skip excluded endpoints
  if (isExcludedEndpoint(filePath)) {
    return;
  }

  // Check if it's a route.ts file
  if (!filePath.endsWith("route.ts")) {
    return;
  }

  let methodType: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | null = null;
  let methodStartLine = 0;

  // Find all HTTP method handlers
  const methodPatterns = [
    /export\s+async\s+function\s+(GET|POST|PATCH|PUT|DELETE)\s*\(/g,
  ];

  for (const pattern of methodPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      methodType = match[1] as "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      methodStartLine = findLineNumber(content, match[0], match.index);

      // Extract the function body - find the opening brace after the function signature
      const functionStart = match.index;
      
      // Extract a larger chunk for analysis (up to 2000 chars or end of file)
      const functionBody = content.slice(functionStart, Math.min(functionStart + 2000, content.length));
      const functionLines = functionBody.split("\n");

      // SECURITY: Legacy endpoints are NOT allowed - they must be migrated
      if (isLegacyEndpoint(filePath)) {
        issues.push({
          file: relativePath,
          line: methodStartLine,
          severity: "critical",
          message: `SECURITY: Legacy endpoint ${methodType} must be migrated to use organizationId. Legacy endpoints are not allowed for security reasons.`,
          code: functionLines[0]?.trim() || "",
          fix: `Migrate to /api/organizations/[orgId] pattern or add organizationId requirement. Remove this legacy endpoint.`,
        });
        // Continue checking - don't skip, we want to flag all issues
      }

      // Check for authentication - look for getServerSession and auth check
      const hasAuth = (
        /getServerSession/.test(functionBody) &&
        (
          /Unauthorized.*401/.test(functionBody) ||
          /401/.test(functionBody) ||
          /session\?\.user/.test(functionBody) ||
          /!session/.test(functionBody) ||
          /session.*user.*id/.test(functionBody)
        )
      );

      // Check for organizationId requirement (more comprehensive patterns)
      const hasOrgIdCheck = (
        /organizationId.*required/i.test(functionBody) ||
        /searchParams\.get\(["']organizationId["']\)/.test(functionBody) ||
        /params.*orgId/.test(functionBody) ||
        /params.*organizationId/.test(functionBody) ||
        /organizationId.*request\.json/.test(functionBody) ||
        /body.*organizationId/.test(functionBody)
      );

      // Check for membership verification (more comprehensive)
      const hasMembershipCheck = (
        /isUserMemberOfOrganization/.test(functionBody) ||
        /getUserOrganizationIds/.test(functionBody) ||
        /userOrgIds\.includes/.test(functionBody) ||
        /canUserViewPublishedProject/.test(functionBody) ||
        (/isMember/.test(functionBody) && /organizationId/.test(functionBody))
      );

      // Check for organization filtering (more comprehensive)
      const hasOrgFilter = (
        /where.*organizationId/.test(functionBody) ||
        /organizationId.*where/.test(functionBody) ||
        /organizationId:/.test(functionBody) ||
        /organizationId\s*,\s*/.test(functionBody) ||
        /organizationId\s*}/.test(functionBody) ||
        /organizationId\s*\)/.test(functionBody)
      );

      // Check for error handling
      const hasErrorHandling = (
        (/400|403/.test(functionBody) && /organizationId|not a member|Unauthorized/i.test(functionBody)) ||
        (/NextResponse\.json.*error.*organizationId/i.test(functionBody)) ||
        (/NextResponse\.json.*error.*member/i.test(functionBody))
      );

      // Special checks for utility endpoints
      if (isUtilityEndpoint(filePath, methodType)) {
        // Utility endpoints should have documentation explaining why they don't require orgId
        if (!/@deprecated|Note:|utility endpoint|This endpoint only/i.test(functionBody)) {
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "info",
            message: `Utility endpoint should have documentation explaining why it doesn't require organizationId`,
            code: functionLines[0]?.trim() || "",
            fix: "Add JSDoc comment explaining the endpoint is a utility endpoint",
          });
        }
        // Utility endpoints should still require authentication
        if (!hasAuth) {
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "high",
            message: `Utility endpoint ${methodType} should require authentication`,
            code: functionLines[0]?.trim() || "",
            fix: "Add authentication check with getServerSession",
          });
        }
        return; // Skip further checks for utility endpoints
      }


      // For endpoints that use resource IDs (like /api/projects/[projectId])
      // OR endpoints that take resource IDs in request body (like DELETE /api/models with assetId)
      // They should verify membership via the resource's organization
      const isResourceEndpoint = (
        /\[.*Id\]/.test(relativePath) ||
        (/assetId|projectId/.test(functionBody) && /findUnique.*where.*id/.test(functionBody))
      );

      // Special case: GET endpoints for published projects may allow public access
      const isPublicProjectGet = (
        isResourceEndpoint &&
        methodType === "GET" &&
        /canUserViewPublishedProject/.test(functionBody)
      );

      // Special case: GET endpoints that check project's organization membership
      const checksProjectOrg = (
        isResourceEndpoint &&
        methodType === "GET" &&
        (/project\.organizationId/.test(functionBody) || /project\?\.organizationId/.test(functionBody)) &&
        hasMembershipCheck
      );

      // Special case: Endpoints that verify via asset's organization (DELETE, PATCH on models)
      const checksAssetOrg = (
        (/asset\.organizationId|existingAsset\.organizationId/.test(functionBody) &&
        hasMembershipCheck) ||
        (/assetId/.test(functionBody) && /findUnique.*asset/.test(functionBody) && hasMembershipCheck)
      );

      // Check if endpoint actually has session handling (even if optional for public access)
      const hasSessionHandling = /getServerSession|session/.test(functionBody);

      if (isResourceEndpoint || checksAssetOrg) {
        // Resource endpoints should verify membership via the resource's org
        // But GET endpoints for published projects can use canUserViewPublishedProject
        // And endpoints that check asset's org are also valid
        if (!hasMembershipCheck && !isPublicProjectGet && !checksAssetOrg) {
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "critical",
            message: `Resource endpoint ${methodType} must verify user membership via resource's organization`,
            code: functionLines[0]?.trim() || "",
            fix: "Add membership check using resource's organizationId",
          });
        }
        // Resource endpoints should filter by the resource's organization
        // But GET endpoints that fetch the resource directly don't need explicit filtering
        if (!hasOrgFilter && methodType === "GET" && !checksProjectOrg && !isPublicProjectGet) {
          // Only flag if it's doing a findMany or similar query
          if (/findMany|findFirst/.test(functionBody)) {
            issues.push({
              file: relativePath,
              line: methodStartLine,
              severity: "critical",
              message: `Resource endpoint ${methodType} must filter by resource's organization`,
              code: functionLines[0]?.trim() || "",
              fix: "Ensure query filters by resource's organizationId",
            });
          }
        }
        // Resource endpoints should require auth (except public GET)
        // But if it has session handling, it's okay (may allow optional auth for public access)
        if (!hasAuth && !isPublicProjectGet && !hasSessionHandling) {
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "critical",
            message: `Resource endpoint ${methodType} must require authentication`,
            code: functionLines[0]?.trim() || "",
            fix: "Add getServerSession check and return 401 if not authenticated",
          });
        }
        // Skip further checks for resource endpoints (they verify via resource's org)
        continue;
      } else {
        // Non-resource endpoints must require organizationId explicitly
        // This includes legacy endpoints - they must be migrated
        if (!hasOrgIdCheck) {
          const isLegacy = isLegacyEndpoint(filePath);
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "critical",
            message: isLegacy
              ? `SECURITY: Legacy endpoint ${methodType} must require organizationId. Legacy endpoints using default org are not allowed.`
              : `SECURITY: Endpoint ${methodType} must require organizationId (query param, route param, or request body)`,
            code: functionLines[0]?.trim() || "",
            fix: isLegacy
              ? "Migrate to /api/organizations/[orgId] pattern or add organizationId requirement. Remove getUserDefaultOrganization usage."
              : "Add organizationId requirement check and return 400 if missing",
          });
        }

        // Must verify membership
        if (!hasMembershipCheck) {
          const isLegacy = isLegacyEndpoint(filePath);
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "critical",
            message: isLegacy
              ? `SECURITY: Legacy endpoint ${methodType} must verify user membership via organizationId. Using default org is not secure.`
              : `SECURITY: Endpoint ${methodType} must verify user is a member of the organization`,
            code: functionLines[0]?.trim() || "",
            fix: isLegacy
              ? "Migrate to verify membership via explicit organizationId, not default org"
              : "Add getUserOrganizationIds check and return 403 if not a member",
          });
        }

        // Must filter by organization
        if (!hasOrgFilter && (methodType === "GET" || methodType === "POST")) {
          issues.push({
            file: relativePath,
            line: methodStartLine,
            severity: "critical",
            message: `Endpoint ${methodType} must filter results by organizationId`,
            code: functionLines[0]?.trim() || "",
            fix: "Add organizationId filter to database query",
          });
        }
      }

      // All endpoints should have proper error handling
      if (!hasErrorHandling && (hasOrgIdCheck || hasMembershipCheck)) {
        issues.push({
          file: relativePath,
          line: methodStartLine,
          severity: "high",
          message: `Endpoint ${methodType} should return 400/403 for missing/invalid org access`,
          code: functionLines[0]?.trim() || "",
          fix: "Add error handling for missing organizationId or invalid membership",
        });
      }

      // All endpoints should require authentication
      if (!hasAuth) {
        issues.push({
          file: relativePath,
          line: methodStartLine,
          severity: "critical",
          message: `Endpoint ${methodType} must require authentication`,
          code: functionLines[0]?.trim() || "",
          fix: "Add getServerSession check and return 401 if not authenticated",
        });
      }
    }
  }
}

// Special handling for excluded endpoints - verify they're correctly excluded
function verifyExcludedEndpoints() {
  const excludedFiles = glob.sync("**/route.ts", {
    cwd: API_DIR,
    absolute: true,
  }).filter((file) => {
    const relativePath = path.relative(API_DIR, file).replace(/\\/g, "/");
    return (
      relativePath.includes("/auth/") ||
      relativePath.includes("/admin/") ||
      relativePath === "user/route.ts" ||
      relativePath === "organizations/list/route.ts"
    );
  });

  for (const file of excludedFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(API_DIR, file).replace(/\\/g, "/");

    // These endpoints should still require authentication (except auth routes)
    if (!relativePath.includes("/auth/")) {
      if (!/getServerSession/.test(content)) {
        issues.push({
          file: relativePath,
          line: 1,
          severity: "high",
          message: `Excluded endpoint should still require authentication`,
          fix: "Add getServerSession check",
        });
      }
    }
  }
}

function checkPageRoutes() {
  console.log("🔍 Checking page routes that make API calls...\n");

  const APP_DIR = path.join(WORKSPACE_ROOT, "apps/editor/app");
  const pageFiles = glob.sync("**/page.tsx", {
    cwd: APP_DIR,
    absolute: true,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  });

  // Allowed routes that can access organization data without orgId in URL
  // These are public/shared routes that are intentionally accessible without orgId
  const ALLOWED_PUBLIC_ROUTES = [
    "(public)/publish/", // Public publish routes - intentionally shareable without orgId
    "(public)/auth/", // Auth pages
    "(public)/signin", // Sign in pages
    "(protected)/profile", // User profile page - user-specific, not organization-specific
  ];

  // Find page routes that use data fetching hooks but aren't under /org/[orgId]/
  for (const file of pageFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(APP_DIR, file).replace(/\\/g, "/");

    // Skip allowed public routes
    const isAllowedRoute = ALLOWED_PUBLIC_ROUTES.some((allowed) =>
      relativePath.includes(allowed)
    );
    if (isAllowedRoute) {
      continue;
    }

    // Check if it uses data fetching hooks that require orgId
    const usesDataHooks = (
      /useProject|useOrganization|useProjects|useModels|useActivity/.test(content)
    );

    if (!usesDataHooks) {
      continue; // Skip pages that don't fetch organization-scoped data
    }

    // SECURITY: All routes accessing organization data must require orgId in URL
    // Except for explicitly allowed public routes (like publish pages)
    if (!relativePath.includes("/org/[orgId]/")) {
      issues.push({
        file: relativePath,
        line: 1,
        severity: "critical",
        message: `SECURITY: Page route uses organization-scoped data hooks but doesn't require orgId in URL. All routes accessing organization data must include /org/[orgId]/ in the path.`,
        fix: "Move route to /org/[orgId]/ structure or add to ALLOWED_PUBLIC_ROUTES if it's intentionally public",
      });
    }
  }
}

function main() {
  console.log("🔍 Running API Organization Scoping Audit...\n");

  if (!fs.existsSync(API_DIR)) {
    console.error(`❌ API directory not found: ${API_DIR}`);
    process.exit(1);
  }

  // Find all route.ts files
  const routeFiles = glob.sync("**/route.ts", {
    cwd: API_DIR,
    absolute: true,
  });

  console.log(`Found ${routeFiles.length} API route files\n`);

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, "utf8");
    checkEndpoint(file, content);
  }

  // Verify excluded endpoints are correctly handled
  verifyExcludedEndpoints();

  // Check page routes that make API calls
  checkPageRoutes();

  // Generate report
  console.log("=".repeat(80));
  console.log("API ORGANIZATION SCOPING AUDIT REPORT");
  console.log("=".repeat(80));
  console.log();

  if (issues.length === 0) {
    console.log("✅ No issues found! All endpoints are properly scoped.");
    process.exit(0);
  }

  // Group issues by severity
  const critical = issues.filter((i) => i.severity === "critical");
  const high = issues.filter((i) => i.severity === "high");
  const medium = issues.filter((i) => i.severity === "medium");
  const info = issues.filter((i) => i.severity === "info");

  if (critical.length > 0) {
    console.log(`🔴 CRITICAL ISSUES: ${critical.length}`);
    console.log("-".repeat(80));
    critical.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      if (issue.code) {
        console.log(`   Code: ${issue.code}`);
      }
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  if (high.length > 0) {
    console.log(`🟡 HIGH PRIORITY ISSUES: ${high.length}`);
    console.log("-".repeat(80));
    high.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      if (issue.code) {
        console.log(`   Code: ${issue.code}`);
      }
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  if (medium.length > 0) {
    console.log(`🟠 MEDIUM PRIORITY ISSUES: ${medium.length}`);
    console.log("-".repeat(80));
    medium.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      if (issue.code) {
        console.log(`   Code: ${issue.code}`);
      }
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  if (info.length > 0) {
    console.log(`ℹ️  INFO ISSUES: ${info.length}`);
    console.log("-".repeat(80));
    info.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  console.log("=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Critical: ${critical.length}`);
  console.log(`High: ${high.length}`);
  console.log(`Medium: ${medium.length}`);
  console.log(`Info: ${info.length}`);
  console.log(`Total: ${issues.length}`);
  console.log();

  // Exit codes: 2 for critical, 1 for high, 0 clean
  if (critical.length > 0) {
    console.log("❌ Audit failed - Critical issues must be fixed");
    process.exit(2);
  }

  if (high.length > 0) {
    console.log("⚠️  Audit passed with warnings - High priority issues recommended");
    process.exit(1);
  }

  console.log("✅ Audit passed");
  process.exit(0);
}

main();

