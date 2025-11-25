// packages/dev-audits/src/profiles/klorad/audits/env.audit.ts
/**
 * Environment Variables Audit
 * Based on: env.ts
 */

import path from "path";
import type { AuditDefinition, AuditContext, AuditResult } from "../../../core/types.js";

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

function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return env;
}

export const envAudit: AuditDefinition = {
  id: "env",
  title: "Environment Variables",
  async run(ctx: AuditContext): Promise<AuditResult> {
    const items: AuditResult["items"] = [];

    // Check .env.production or .env.local (for local dev)
    const envFile = path.join(ctx.rootDir, "apps/editor/.env.production");
    const envLocalFile = path.join(ctx.rootDir, "apps/editor/.env.local");
    let env: Record<string, string> = {};

    if (ctx.workspace.fileExists(envFile)) {
      const content = await ctx.workspace.readFile(envFile);
      env = parseEnvFile(content);
    } else if (ctx.workspace.fileExists(envLocalFile)) {
      // Fallback to .env.local for local development
      const content = await ctx.workspace.readFile(envLocalFile);
      env = parseEnvFile(content);
    }

    // Merge with process.env (CI takes precedence)
    const finalEnv = { ...env, ...process.env };

    // In CI, require env vars. In local dev, allow missing if .env.local doesn't exist
    const isCI = !!process.env.CI || !!process.env.VERCEL;
    const hasEnvFile = ctx.workspace.fileExists(envFile) || ctx.workspace.fileExists(envLocalFile);

    // Validate required vars
    for (const [key, schema] of Object.entries(REQUIRED_ENV_VARS)) {
      const value = finalEnv[key];

      // Only fail if in CI or if env file exists but var is missing
      if (schema.required && !value && (isCI || hasEnvFile)) {
        items.push({
          message: `Missing required env var: ${key} (${schema.description})`,
          file: ctx.workspace.fileExists(envFile) ? envFile : envLocalFile,
          severity: "error",
          code: "MISSING_ENV_VAR",
        });
        continue;
      }

      if (value && schema.pattern && !schema.pattern.test(value)) {
        const masked = maskSecret(value);
        items.push({
          message: `Invalid ${key}: ${masked} (${schema.description})`,
          file: envFile,
          severity: "error",
          code: "INVALID_ENV_VAR",
        });
      }
    }

    // Check for common mistakes
    if (
      finalEnv.ION_REGION &&
      !finalEnv.ION_REGION.match(/^(us-east-1|eu-central-1)$/)
    ) {
      items.push({
        message: `ION_REGION must be 'us-east-1' or 'eu-central-1', got: ${finalEnv.ION_REGION}`,
        file: envFile,
        severity: "error",
        code: "INVALID_ION_REGION",
      });
    }

    return {
      id: "env",
      title: "Environment Variables",
      ok: items.length === 0,
      items,
    };
  },
};

