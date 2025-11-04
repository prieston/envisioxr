#!/usr/bin/env node
/**
 * Env & Secrets Schema Audit
 *
 * Goal: Prevent missing keys and region mismatches
 *
 * Checks:
 * - Validate .env.production (or process env in CI) against a zod schema:
 *   Required: NEXTAUTH_URL, DATABASE_URL, ION_ACCESS_TOKEN, ION_REGION in { 'us-east-1' | 'eu-central-1' }, etc.
 * - Fail if missing/invalid; print a masked diff
 */

import fs from "fs";
import path from "path";

const WORKSPACE_ROOT = process.cwd();

interface Violation {
  key: string;
  message: string;
}

const violations: Violation[] = [];

// Schema definition
const REQUIRED_ENV_VARS = {
  NEXTAUTH_URL: {
    required: true,
    pattern: /^https?:\/\//,
    description: "NextAuth base URL",
  },
  DATABASE_URL: {
    required: true,
    pattern: /^postgresql:\/\//,
    description: "PostgreSQL connection string",
  },
  ION_ACCESS_TOKEN: {
    required: true,
    pattern: /^.+$/,
    description: "Cesium Ion access token",
  },
  ION_REGION: {
    required: true,
    pattern: /^(us-east-1|eu-central-1)$/,
    description: "Cesium Ion region (us-east-1 or eu-central-1)",
  },
};

function maskSecret(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

function checkEnvVars() {
  console.log("🔍 Checking environment variables...");

  // In CI, use process.env; locally, check .env.production
  const envFile = path.join(WORKSPACE_ROOT, "apps/editor/.env.production");
  const env: Record<string, string> = {};

  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }

  // Merge with process.env (CI takes precedence)
  const finalEnv = { ...env, ...process.env };

  for (const [key, schema] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = finalEnv[key];

    if (schema.required && !value) {
      violations.push({
        key,
        message: `Missing required env var: ${key} (${schema.description})`,
      });
      continue;
    }

    if (value && schema.pattern && !schema.pattern.test(value)) {
      const masked = maskSecret(value);
      violations.push({
        key,
        message: `Invalid ${key}: ${masked} (${schema.description})`,
      });
    }
  }

  // Check for common mistakes
  if (finalEnv.ION_REGION && !finalEnv.ION_REGION.match(/^(us-east-1|eu-central-1)$/)) {
    violations.push({
      key: "ION_REGION",
      message: `ION_REGION must be 'us-east-1' or 'eu-central-1', got: ${finalEnv.ION_REGION}`,
    });
  }
}

// Main execution
console.log("🔐 Env & Secrets Schema Audit\n");

checkEnvVars();

if (violations.length > 0) {
  console.log(`\n❌ Found ${violations.length} violation(s):\n`);
  violations.forEach((v) => {
    console.log(`  ${v.key}: ${v.message}`);
  });
  console.log("\n");
  process.exit(1);
} else {
  console.log("✅ All environment variable checks passed!\n");
  process.exit(0);
}

