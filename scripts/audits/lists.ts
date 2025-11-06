#!/usr/bin/env node

/**
 * Virtualization & List Rendering Audit (AST-based)
 *
 * Checks for:
 * - Large arrays mapped directly into JSX without virtualization
 * - Inline objects/arrays/functions in props breaking React.memo
 * - Array chains computed during render without useMemo
 * - Data fetches without pagination parameters
 */

import fs from "fs/promises";
import path from "path";
import { glob } from "glob";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

interface Issue {
  severity: "critical" | "high" | "medium";
  file: string;
  line: number;
  column: number;
  message: string;
  fix?: string;
}

const LARGE = Number(process.env.AUDIT_LARGE ?? 50);
const CRIT = Number(process.env.AUDIT_CRIT ?? 100);

function parseFile(code: string, file: string) {
  try {
    return parse(code, {
      sourceType: "module",
      sourceFilename: file,
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "objectRestSpread",
        "asyncGenerators",
        "functionBind",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "dynamicImport",
        "nullishCoalescingOperator",
        "optionalChaining",
      ],
      errorRecovery: true,
    });
  } catch (error) {
    console.warn(`⚠️  Failed to parse ${file}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function isMemoizedComponent(ast: t.File, name: string): boolean {
  let memo = false;
  traverse(ast, {
    VariableDeclarator(p) {
      if (t.isIdentifier(p.node.id, { name }) && p.node.init) {
        if (t.isCallExpression(p.node.init)) {
          const callee = p.node.init.callee;
          if (t.isMemberExpression(callee)) {
            if (
              t.isIdentifier(callee.object, { name: "React" }) &&
              t.isIdentifier(callee.property, { name: "memo" })
            ) {
              memo = true;
            }
          }
          if (t.isIdentifier(callee, { name: "memo" })) {
            memo = true;
          }
        }
      }
    },
    ExportDefaultDeclaration(p) {
      if (t.isCallExpression(p.node.declaration)) {
        const callee = p.node.declaration.callee;
        if (t.isMemberExpression(callee)) {
          if (
            t.isIdentifier(callee.object, { name: "React" }) &&
            t.isIdentifier(callee.property, { name: "memo" })
          ) {
            // Check if wrapped component matches name
            const args = p.node.declaration.arguments;
            if (args.length > 0 && t.isIdentifier(args[0], { name })) {
              memo = true;
            }
          }
        }
      }
    },
  });
  return memo;
}

function record(
  issues: Issue[],
  severity: Issue["severity"],
  file: string,
  node: t.Node,
  message: string,
  fix?: string
) {
  const loc = node.loc?.start ?? { line: 1, column: 0 };
  issues.push({
    severity,
    file,
    line: loc.line,
    column: loc.column + 1, // Babel uses 0-indexed, we want 1-indexed
    message,
    fix,
  });
}

function getArraySizeHint(ast: t.File, arrayId: string): number | null {
  let size: number | null = null;
  traverse(ast, {
    BinaryExpression(p) {
      if (
        t.isMemberExpression(p.node.left) &&
        t.isIdentifier(p.node.left.object, { name: arrayId }) &&
        t.isIdentifier(p.node.left.property, { name: "length" })
      ) {
        if (t.isNumericLiteral(p.node.right)) {
          size = p.node.right.value;
        }
      }
    },
    VariableDeclarator(p) {
      if (
        t.isIdentifier(p.node.id, { name: arrayId }) &&
        t.isArrayExpression(p.node.init)
      ) {
        size = p.node.init.elements.length;
      }
    },
  });
  return size;
}

async function analyze(file: string, code: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const ast = parseFile(code, file);
  if (!ast) return issues;

  const memoCache = new Map<string, boolean>();
  const relativePath = path.relative(workspaceRoot, file);

  traverse(ast, {
    JSXElement(p) {
      const opening = p.node.openingElement;
      const name = t.isJSXIdentifier(opening.name) ? opening.name.name : null;

      for (const attr of opening.attributes) {
        if (!t.isJSXAttribute(attr) || !attr.value) continue;

        const v = t.isJSXExpressionContainer(attr.value)
          ? attr.value.expression
          : attr.value;

        if (
          t.isObjectExpression(v) ||
          t.isArrayExpression(v) ||
          t.isArrowFunctionExpression(v)
        ) {
          if (name) {
            if (!memoCache.has(name)) {
              memoCache.set(name, isMemoizedComponent(ast, name));
            }
            if (memoCache.get(name)) {
              const type = t.isArrowFunctionExpression(v)
                ? "function"
                : t.isArrayExpression(v)
                  ? "array"
                  : "object";
              record(
                issues,
                "high",
                relativePath,
                v,
                `Inline ${type} in props breaks React.memo for <${name}>.`,
                "Hoist via useMemo/useCallback."
              );
            }
          }
        }
      }
    },

    CallExpression(p) {
      // list?.map(...) or list.map(...)
      const callee = p.node.callee;
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property, { name: "map" })
      ) {
        // Check if inside JSX
        const inJSX = p.findParent((q) => q.isJSXElement());
        if (inJSX) {
          // Heuristic severity by identifier name
          let severity: Issue["severity"] = "medium";
          if (t.isIdentifier(callee.object)) {
            const id = callee.object.name.toLowerCase();
            if (/(entities|features|observations|items|points|rows|nodes)/.test(id)) {
              severity = "high";
            }

            // Check array size hint
            const sizeHint = getArraySizeHint(ast, callee.object.name);
            if (sizeHint !== null) {
              if (sizeHint >= CRIT) {
                severity = "critical";
              } else if (sizeHint >= LARGE) {
                severity = "high";
              }
            }
          }

          record(
            issues,
            severity,
            relativePath,
            p.node,
            "Array mapped directly inside JSX; consider virtualization (react-window/react-virtualized) for large lists.",
            "Use react-window or react-virtualized for lists > 50 items."
          );
        }
      }

      // Detect chained array ops in render without memo
      const methods = new Set(["map", "filter", "reduce", "sort"]);
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        methods.has(callee.property.name)
      ) {
        const chainEnd = p.findParent(
          (q) => q.isJSXElement() || q.isReturnStatement()
        );
        if (chainEnd) {
          const inMemo = !!p.findParent(
            (q) =>
              q.isCallExpression() &&
              t.isIdentifier(q.node.callee, { name: "useMemo" })
          );
          if (!inMemo) {
            record(
              issues,
              "medium",
              relativePath,
              p.node,
              "Array chain computed during render; wrap in useMemo with deps.",
              "Wrap chain in useMemo: const result = useMemo(() => array.filter(...).map(...), [deps])"
            );
          }
        }
      }
    },

    // Pagination hint for data fetches
    CallExpression(p) {
      const id = t.isIdentifier(p.node.callee)
        ? p.node.callee.name
        : t.isMemberExpression(p.node.callee) &&
            t.isIdentifier(p.node.callee.property)
          ? p.node.callee.property.name
          : null;

      if (id && /(useQuery|useSWR|useInfiniteQuery|fetch|axios)/.test(id)) {
        const args = p.node.arguments;
        let hasPagingParam = false;

        // Check arguments for pagination indicators
        for (const arg of args) {
          const argStr = JSON.stringify(arg);
          if (/page|limit|cursor|offset|take|skip/i.test(argStr)) {
            hasPagingParam = true;
            break;
          }
        }

        // Check if it's useInfiniteQuery (good)
        if (id === "useInfiniteQuery") {
          hasPagingParam = true;
        }

        // Check context for list-like identifiers
        const parent = p.findParent((q) => q.isVariableDeclarator() || q.isCallExpression());
        const contextStr = parent ? JSON.stringify(parent.node) : "";
        const isListContext = /entities|features|observations|points|items|list|data/.test(contextStr);

        if (!hasPagingParam && isListContext) {
          record(
            issues,
            "medium",
            relativePath,
            p.node,
            "Data fetch without visible pagination parameters; verify this endpoint is paginated or switch to infinite queries.",
            "Add pagination (page/limit or cursor-based) or use useInfiniteQuery for large datasets."
          );
        }
      }
    },
  });

  return issues;
}

async function main() {
  console.log("🔍 Running Virtualization & List Rendering Audit (AST-based)...\n");

  const files = await glob(
    [
      "apps/**/*.{ts,tsx,js,jsx}",
      "packages/**/*.{ts,tsx,js,jsx}",
    ],
    {
      cwd: workspaceRoot,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/*.d.ts",
        "**/__tests__/**",
        "**/*.test.{ts,tsx,js,jsx}",
        "**/*.spec.{ts,tsx,js,jsx}",
        "**/*.stories.{ts,tsx,js,jsx}",
        "**/storybook-static/**",
        "**/coverage/**",
        "**/cypress/**",
        "**/e2e/**",
        "**/public/**",
        "**/vendor/**",
      ],
    }
  );

  const all: Issue[] = [];

  for (const f of files) {
    const fullPath = path.join(workspaceRoot, f);
    try {
      const code = await fs.readFile(fullPath, "utf8");
      const fileIssues = await analyze(f, code);
      all.push(...fileIssues);
    } catch (error) {
      console.warn(`⚠️  Failed to read ${f}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const critical = all.filter((i) => i.severity === "critical");
  const high = all.filter((i) => i.severity === "high");
  const medium = all.filter((i) => i.severity === "medium");

  // Generate report
  console.log("=".repeat(80));
  console.log("VIRTUALIZATION & LIST RENDERING AUDIT REPORT");
  console.log("=".repeat(80));
  console.log();

  if (all.length === 0) {
    console.log("✅ No issues found! Lists look optimized.");
    process.exit(0);
  }

  if (critical.length > 0) {
    console.log("🔴 CRITICAL ISSUES:", critical.length);
    console.log("-".repeat(80));
    critical.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}:${issue.column}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  if (high.length > 0) {
    console.log("🟡 HIGH PRIORITY ISSUES:", high.length);
    console.log("-".repeat(80));
    high.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}:${issue.column}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });
    console.log();
  }

  if (medium.length > 0) {
    console.log("🟢 MEDIUM PRIORITY ISSUES:", medium.length);
    console.log("-".repeat(80));
    medium.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.message}`);
      console.log(`   File: ${issue.file}:${issue.line}:${issue.column}`);
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
  console.log();

  // Deterministic exit codes: 2 for critical, 1 for high, 0 clean
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

main().catch((error) => {
  console.error("❌ Audit failed with error:", error);
  process.exit(1);
});
