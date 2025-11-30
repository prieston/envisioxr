// packages/dev-audits/src/core/reporter.ts
/**
 * Console reporter for audit results
 */
/* eslint-disable no-console */

import type { AuditResult, AuditSeverity, AuditResultItem } from "./types.js";

export interface ReporterResult {
  ok: boolean;
}

export function printReport(results: AuditResult[]): ReporterResult {
  let hasErrors = false;

  for (const result of results) {
    if (!result.ok) {
      hasErrors = true;
    }

    if (result.items.length === 0) {
      continue;
    }

    // Group items by severity
    const errors = result.items.filter(
      (item) => item.severity === "error" || !item.severity
    );
    const warnings = result.items.filter((item) => item.severity === "warning");
    const info = result.items.filter((item) => item.severity === "info");

    // Print errors
    for (const item of errors) {
      printItem(item, "error");
    }

    // Print warnings
    for (const item of warnings) {
      printItem(item, "warning");
    }

    // Print info
    for (const item of info) {
      printItem(item, "info");
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));

  const total = results.length;
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log(`Total audits: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
  if (totalItems > 0) {
    const errorCount = results.reduce(
      (sum, r) =>
        sum +
        r.items.filter((i) => i.severity === "error" || !i.severity).length,
      0
    );
    const warningCount = results.reduce(
      (sum, r) => sum + r.items.filter((i) => i.severity === "warning").length,
      0
    );
    const infoCount = results.reduce(
      (sum, r) => sum + r.items.filter((i) => i.severity === "info").length,
      0
    );

    console.log(`\nTotal issues: ${totalItems}`);
    if (errorCount > 0) console.log(`  Errors: ${errorCount}`);
    if (warningCount > 0) console.log(`  Warnings: ${warningCount}`);
    if (infoCount > 0) console.log(`  Info: ${infoCount}`);
  }

  console.log();

  return { ok: !hasErrors };
}

function printItem(
  item: AuditResultItem,
  defaultSeverity: AuditSeverity
): void {
  const severity = item.severity || defaultSeverity;
  const severityIcon =
    severity === "error" ? "🔴" : severity === "warning" ? "🟡" : "🔵";

  let filename = "";
  let fileLocation = "";

  if (item.file) {
    // Extract filename from path
    const pathParts = item.file.split("/");
    filename = pathParts[pathParts.length - 1] || item.file;

    // Build file location string with line/column
    fileLocation = filename;
    if (item.line !== undefined) {
      fileLocation += `:${item.line}`;
      if (item.column !== undefined) {
        fileLocation += `:${item.column}`;
      }
    }
  }

  const codePart = item.code ? ` [${item.code}]` : "";
  const locationPart = fileLocation ? ` ${fileLocation}` : "";

  console.log(`  ${severityIcon} ${item.message}${codePart}${locationPart}`);
}
