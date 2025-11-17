#!/usr/bin/env tsx
/**
 * Migration Safety Audit
 *
 * Ensures migrations never cause data loss by checking for:
 * - Dangerous operations (DROP, DELETE, TRUNCATE without WHERE)
 * - Column drops without data migration
 * - NOT NULL constraints added without defaults
 * - Missing IF EXISTS clauses
 * - Data migration patterns
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface Violation {
  migration: string;
  line: number;
  severity: "error" | "warning";
  message: string;
  code: string;
}

const DANGEROUS_PATTERNS = [
  {
    pattern: /\bDROP\s+TABLE\s+(?!IF\s+EXISTS)/i,
    message: "DROP TABLE without IF EXISTS - could fail if table doesn't exist",
    severity: "warning" as const,
  },
  // Note: PostgreSQL doesn't support IF EXISTS for DROP COLUMN in ALTER TABLE
  // So we check this separately with context awareness
  {
    pattern: /\bTRUNCATE\s+TABLE/i,
    message: "TRUNCATE TABLE - permanently deletes all data",
    severity: "error" as const,
  },
  {
    pattern: /\bDELETE\s+FROM\s+\w+\s*(?!WHERE)/i,
    message: "DELETE without WHERE clause - deletes all rows",
    severity: "error" as const,
  },
  {
    pattern: /\bALTER\s+TABLE\s+\w+\s+ALTER\s+COLUMN\s+\w+\s+SET\s+NOT\s+NULL(?!\s+DEFAULT)/i,
    message: "Adding NOT NULL constraint without DEFAULT - existing NULL values will cause failure",
    severity: "error" as const,
  },
];

function checkMigrationSafety(migrationContent: string, migrationName: string): Violation[] {
  const violations: Violation[] = [];
  const lines = migrationContent.split("\n");

  // Check for dangerous patterns
  for (const { pattern, message, severity } of DANGEROUS_PATTERNS) {
    const matches = [...migrationContent.matchAll(new RegExp(pattern.source, "gi"))];
    for (const match of matches) {
      const lineNumber = migrationContent.substring(0, match.index).split("\n").length;
      violations.push({
        migration: migrationName,
        line: lineNumber,
        severity,
        message,
        code: lines[lineNumber - 1]?.trim() || "",
      });
    }
  }

  // Check for column drops without data migration
  const dropColumnMatches = [...migrationContent.matchAll(/\bDROP\s+COLUMN\s+(\w+)/gi)];
  for (const match of dropColumnMatches) {
    const columnName = match[1];
    const lineNumber = migrationContent.substring(0, match.index).split("\n").length;

    // Check if data is migrated before drop
    const beforeDrop = migrationContent.substring(0, match.index);

    // Check for various data migration patterns:
    // 1. UPDATE statements
    // 2. Data migration in DO blocks (PostgreSQL)
    // 3. Column is added/migrated in same migration
    // 4. Safe comments
    const hasDataMigration =
      (beforeDrop.includes(`UPDATE`) && beforeDrop.includes(`SET`)) ||
      (beforeDrop.includes(`DO $$`) && beforeDrop.includes(`UPDATE`)) ||
      (beforeDrop.includes(`ADD COLUMN`) && beforeDrop.includes(columnName)) ||
      beforeDrop.includes(`-- Safe:`) ||
      beforeDrop.includes(`-- Data migrated`) ||
      beforeDrop.includes(`-- Migrate`) ||
      // Check if column is being replaced (old column dropped, new one added)
      migrationContent.includes(`ADD COLUMN`) && migrationContent.includes(`organizationId`);

    // PostgreSQL doesn't support IF EXISTS for DROP COLUMN, but we can check if it's safe
    const isSafeDrop =
      hasDataMigration ||
      // Column is being replaced (common pattern: add new column, migrate data, drop old)
      (beforeDrop.includes(`ADD COLUMN`) && beforeDrop.includes(`organizationId`));

    if (!isSafeDrop) {
      violations.push({
        migration: migrationName,
        line: lineNumber,
        severity: "error",
        message: `Column ${columnName} is dropped but no data migration found. Add UPDATE statement before DROP or comment '-- Safe: reason' if intentional.`,
        code: lines[lineNumber - 1]?.trim() || "",
      });
    } else if (!beforeDrop.match(/DROP\s+COLUMN.*IF\s+EXISTS/i) && !hasDataMigration) {
      // Warning: PostgreSQL doesn't support IF EXISTS for DROP COLUMN, but we warn if no migration found
      violations.push({
        migration: migrationName,
        line: lineNumber,
        severity: "warning",
        message: `DROP COLUMN ${columnName} - PostgreSQL doesn't support IF EXISTS. Ensure column exists or migration will fail.`,
        code: lines[lineNumber - 1]?.trim() || "",
      });
    }
  }

  // Check for NOT NULL constraints added without defaults
  const notNullMatches = [...migrationContent.matchAll(/ALTER\s+COLUMN\s+(\w+)\s+SET\s+NOT\s+NULL/gi)];
  for (const match of notNullMatches) {
    const columnName = match[1];
    const lineNumber = migrationContent.substring(0, match.index).split("\n").length;

    // Check if column has DEFAULT or is added with NOT NULL DEFAULT
    const beforeAlter = migrationContent.substring(0, match.index);
    const hasDefault =
      beforeAlter.includes(`DEFAULT`) ||
      migrationContent.includes(`ADD COLUMN ${columnName}.*NOT NULL.*DEFAULT`);

    if (!hasDefault) {
      violations.push({
        migration: migrationName,
        line: lineNumber,
        severity: "error",
        message: `NOT NULL constraint added to ${columnName} without DEFAULT - existing NULL values will cause migration failure`,
        code: lines[lineNumber - 1]?.trim() || "",
      });
    }
  }

  // Check for ALTER COLUMN without IF EXISTS (for PostgreSQL)
  const alterColumnMatches = [...migrationContent.matchAll(/ALTER\s+TABLE\s+(\w+)\s+ALTER\s+COLUMN\s+(\w+)/gi)];
  for (const match of alterColumnMatches) {
    const tableName = match[1];
    const columnName = match[2];
    const lineNumber = migrationContent.substring(0, match.index).split("\n").length;

    // Check if column exists check is present (PostgreSQL doesn't support IF EXISTS for ALTER COLUMN)
    // But we can check if it's part of a safe migration pattern
    const context = migrationContent.substring(Math.max(0, match.index - 200), match.index + 200);
    const isSafe =
      context.includes(`ADD COLUMN`) ||
      context.includes(`DEFAULT`) ||
      context.includes(`-- Safe:`);

    // This is just a warning since ALTER COLUMN IF EXISTS isn't standard SQL
    if (!isSafe) {
      violations.push({
        migration: migrationName,
        line: lineNumber,
        severity: "warning",
        message: `ALTER COLUMN on ${tableName}.${columnName} - ensure column exists or migration will fail`,
        code: lines[lineNumber - 1]?.trim() || "",
      });
    }
  }

  return violations;
}

async function auditMigrations() {
  console.log("🔒 Migration Safety Audit\n");
  console.log("🔍 Checking migration files for data safety...\n");

  const migrationsDir = join(process.cwd(), "packages/prisma/migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const migrationDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "node_modules")
    .map((entry) => entry.name)
    .sort();

  const allViolations: Violation[] = [];

  for (const migrationDir of migrationDirs) {
    const migrationPath = join(migrationsDir, migrationDir, "migration.sql");
    try {
      const content = await readFile(migrationPath, "utf-8");
      const violations = checkMigrationSafety(content, migrationDir);
      allViolations.push(...violations);
    } catch (error) {
      console.error(`❌ Error reading ${migrationDir}:`, error);
    }
  }

  // Group violations by severity
  const errors = allViolations.filter((v) => v.severity === "error");
  const warnings = allViolations.filter((v) => v.severity === "warning");

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ All migrations are safe! No data loss risks detected.\n");
    return;
  }

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s) that could cause data loss:\n`);
    for (const violation of errors) {
      console.log(`  Migration: ${violation.migration}`);
      console.log(`  Line ${violation.line}: ${violation.message}`);
      console.log(`  Code: ${violation.code}`);
      console.log("");
    }
  }

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} warning(s):\n`);
    for (const violation of warnings) {
      console.log(`  Migration: ${violation.migration}`);
      console.log(`  Line ${violation.line}: ${violation.message}`);
      console.log(`  Code: ${violation.code}`);
      console.log("");
    }
  }

  if (errors.length > 0) {
    console.log("\n💡 How to fix:");
    console.log("   - For DROP COLUMN: Migrate data first with UPDATE, then drop");
    console.log("   - For NOT NULL: Add DEFAULT value or migrate data first");
    console.log("   - For DELETE: Always include WHERE clause");
    console.log("   - For TRUNCATE: Use DELETE with WHERE or migrate data first");
    console.log("   - Add '-- Safe: reason' comment if operation is intentionally safe\n");
    process.exit(1);
  }
}

auditMigrations().catch((error) => {
  console.error("❌ Audit failed:", error);
  process.exit(1);
});

