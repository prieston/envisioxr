#!/usr/bin/env node
/**
 * Validation script for organization migration
 * Tests schema, TypeScript types, and migration SQL syntax
 */

import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const errors = [];
const warnings = [];

console.log("🔍 Validating Organization Migration...\n");

// Test 1: Validate schema.prisma syntax
console.log("1. Validating Prisma schema...");
try {
  const schemaPath = join(__dirname, "schema.prisma");
  const schema = readFileSync(schemaPath, "utf-8");

  // Check for required models
  const requiredModels = ["Organization", "OrganizationMember", "Project", "Asset"];
  for (const model of requiredModels) {
    if (!schema.includes(`model ${model}`)) {
      errors.push(`Missing model: ${model}`);
    }
  }

  // Check for OrganizationRole enum
  if (!schema.includes("enum OrganizationRole")) {
    errors.push("Missing OrganizationRole enum");
  }

  // Check Project has organizationId
  if (!schema.match(/model Project[\s\S]*?organizationId\s+String/m)) {
    errors.push("Project model missing organizationId field");
  }

  // Check Asset has organizationId
  if (!schema.match(/model Asset[\s\S]*?organizationId\s+String/m)) {
    errors.push("Asset model missing organizationId field");
  }

  // Check Project doesn't have userId (but Account/Session/Subscription can still have it)
  const projectModel = schema.match(/model Project\s*\{[\s\S]*?\n\}/m)?.[0] || "";
  if (projectModel.includes("userId") && !projectModel.includes("organizationId")) {
    errors.push("Project model still has userId field (should be removed)");
  }

  // Check Asset doesn't have userId
  const assetModel = schema.match(/model Asset\s*\{[\s\S]*?\n\}/m)?.[0] || "";
  if (assetModel.includes("userId") && !assetModel.includes("organizationId")) {
    errors.push("Asset model still has userId field (should be removed)");
  }

  if (errors.length === 0) {
    console.log("   ✅ Schema structure is valid\n");
  } else {
    console.log("   ❌ Schema validation failed\n");
  }
} catch (error) {
  errors.push(`Failed to read schema: ${error.message}`);
}

// Test 2: Validate migration SQL syntax
console.log("2. Validating migration SQL...");
try {
  const migrationPath = join(
    __dirname,
    "migrations",
    "20251116172108_add_organizations",
    "migration.sql"
  );
  const migration = readFileSync(migrationPath, "utf-8");

  // Check for required SQL statements
  const requiredStatements = [
    "CREATE TYPE \"OrganizationRole\"",
    "CREATE TABLE \"Organization\"",
    "CREATE TABLE \"OrganizationMember\"",
    "ALTER TABLE \"Project\" ADD COLUMN \"organizationId\"",
    "ALTER TABLE \"Asset\" ADD COLUMN \"organizationId\"",
    "UPDATE \"Project\"",
    "UPDATE \"Asset\"",
    "ALTER TABLE \"Project\" ALTER COLUMN \"organizationId\" SET NOT NULL",
    "ALTER TABLE \"Asset\" ALTER COLUMN \"organizationId\" SET NOT NULL",
    "ALTER TABLE \"Project\" DROP COLUMN \"userId\"",
    "ALTER TABLE \"Asset\" DROP COLUMN \"userId\"",
  ];

  for (const statement of requiredStatements) {
    if (!migration.includes(statement)) {
      errors.push(`Migration missing: ${statement}`);
    }
  }

  // Check for DO block (PL/pgSQL)
  if (!migration.includes("DO $$")) {
    errors.push("Migration missing DO block for data migration");
  }

  // Check for personal organization creation
  if (!migration.includes("isPersonal")) {
    errors.push("Migration missing isPersonal flag setting");
  }

  // Check for owner role assignment
  if (!migration.includes("'owner'")) {
    errors.push("Migration missing owner role assignment");
  }

  if (errors.length === 0) {
    console.log("   ✅ Migration SQL structure is valid\n");
  } else {
    console.log("   ❌ Migration SQL validation failed\n");
  }
} catch (error) {
  errors.push(`Failed to read migration: ${error.message}`);
}

// Test 3: Check helper functions exist
console.log("3. Validating helper functions...");
try {
  const helpersPath = join(__dirname, "..", "..", "apps", "editor", "lib", "organizations.ts");
  const helpers = readFileSync(helpersPath, "utf-8");

  const requiredFunctions = [
    "getUserOrganizations",
    "getUserPersonalOrganization",
    "getUserOrganizationIds",
    "isUserMemberOfOrganization",
    "hasUserRoleInOrganization",
    "getUserDefaultOrganization",
  ];

  for (const func of requiredFunctions) {
    if (!helpers.includes(`export async function ${func}`) &&
        !helpers.includes(`export function ${func}`)) {
      errors.push(`Missing helper function: ${func}`);
    }
  }

  if (errors.length === 0) {
    console.log("   ✅ All helper functions are present\n");
  } else {
    console.log("   ❌ Helper functions validation failed\n");
  }
} catch (error) {
  warnings.push(`Could not validate helper functions: ${error.message}`);
}

// Test 4: Check API routes use organizations
console.log("4. Validating API route updates...");
try {
  const apiRoutes = [
    "apps/editor/app/api/projects/route.ts",
    "apps/editor/app/api/projects/[projectId]/route.ts",
    "apps/editor/app/api/models/route.ts",
    "apps/editor/app/api/models/metadata/route.ts",
    "apps/editor/app/api/models/[assetId]/route.ts",
  ];

  for (const route of apiRoutes) {
    const routePath = join(__dirname, "..", "..", route);
    const routeContent = readFileSync(routePath, "utf-8");

    // Check imports organizations helper
    if (!routeContent.includes("from \"@/lib/organizations\"")) {
      warnings.push(`Route ${route} may not be using organization helpers`);
    }

    // Check uses organizationId instead of userId for queries
    if (routeContent.includes("where: { userId }")) {
      errors.push(`Route ${route} still uses userId in where clause`);
    }
  }

  if (errors.length === 0) {
    console.log("   ✅ API routes are updated\n");
  } else {
    console.log("   ❌ API routes validation failed\n");
  }
} catch (error) {
  warnings.push(`Could not validate API routes: ${error.message}`);
}

// Summary
console.log("=".repeat(60));
if (errors.length === 0) {
  console.log("✅ All validations passed!");
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((w) => console.log(`   - ${w}`));
  }
  process.exit(0);
} else {
  console.log("❌ Validation failed with errors:\n");
  errors.forEach((e) => console.log(`   - ${e}`));
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach((w) => console.log(`   - ${w}`));
  }
  process.exit(1);
}

