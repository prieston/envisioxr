#!/usr/bin/env node
/**
 * SSR/Client Import Guards Audit
 *
 * Goal: Prevent server from pulling 3D/DOM-only libs
 *
 * Checks:
 * - In server/route/layout files (RSC, API, page.tsx without "use client"), ban imports of:
 *   three, @react-three/*, cesium, @cesium/*, 3d-tiles-renderer, mapbox-gl, react-dom, window/document usage
 * - Allow only dynamic imports with ssr:false from client components
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const WORKSPACE_ROOT = process.cwd();

interface Violation {
  file: string;
  line: number;
  message: string;
}

const violations: Violation[] = [];

// Banned imports for server files
const BANNED_IMPORTS = [
  /^three$/,
  /^@react-three\//,
  /^cesium$/,
  /^@cesium\//,
  /^3d-tiles-renderer$/,
  /^mapbox-gl$/,
  /^react-dom$/,
];

// Banned globals/APIs
const BANNED_GLOBALS = [
  /\bwindow\s*[.=]/,
  /\bdocument\s*[.=]/,
  /\bnavigator\s*[.=]/,
  /\blocalStorage\s*[.=]/,
  /\bsessionStorage\s*[.=]/,
];

function findLineNumber(content: string, pattern: string): number {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(pattern)) {
      return i + 1;
    }
  }
  return 0;
}

function isServerFile(filePath: string, content: string): boolean {
  // Check if file has "use client" directive
  const hasUseClient = content.includes('"use client"') || content.includes("'use client'");

  // Server files are:
  // - API routes (app/api/**/route.ts)
  // - Layout files (app/**/layout.tsx) without "use client"
  // - Page files (app/**/page.tsx) without "use client"
  // - Server components (any .tsx/.ts in app/ without "use client")

  const isApiRoute = filePath.includes("/api/") && filePath.endsWith("route.ts");
  const isLayout = filePath.endsWith("layout.tsx");
  const isPage = filePath.endsWith("page.tsx");
  const isServerComponent = filePath.includes("/app/") && (filePath.endsWith(".tsx") || filePath.endsWith(".ts"));

  if (hasUseClient) {
    return false; // Client component
  }

  return isApiRoute || isLayout || isPage || isServerComponent;
}

function checkServerFileImports() {
  console.log("🔍 Checking server file imports...");

  const sourceFiles = glob.sync("apps/**/*.{ts,tsx}", {
    cwd: WORKSPACE_ROOT,
    ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  });

  for (const file of sourceFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    const content = fs.readFileSync(fullPath, "utf8");

    if (!isServerFile(file, content)) {
      continue; // Skip client components
    }

    // Check for banned imports
    const importPattern = /from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      const importedModule = match[1];

      // Check if it matches any banned import pattern
      for (const bannedPattern of BANNED_IMPORTS) {
        if (bannedPattern.test(importedModule)) {
          violations.push({
            file,
            line: findLineNumber(content, match[0]),
            message: `❌ Server file imports banned module: "${importedModule}"`,
          });
        }
      }
    }

    // Check for banned globals (but allow in comments/strings)
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      // Skip comments and strings
      const codeOnly = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "").replace(/["'].*?["']/g, "");

      for (const bannedGlobal of BANNED_GLOBALS) {
        if (bannedGlobal.test(codeOnly)) {
          violations.push({
            file,
            line: index + 1,
            message: `❌ Server file uses banned global: "${line.trim()}"`,
          });
        }
      }
    });
  }
}

// Main execution
console.log("🛡️ SSR/Client Import Guards Audit\n");

checkServerFileImports();

// Report results
if (violations.length > 0) {
  console.log(`\n❌ Found ${violations.length} violation(s):\n`);
  violations.forEach((v) => {
    console.log(`  ${v.file}:${v.line} - ${v.message}`);
  });
  console.log("\n💡 How to fix:");
  console.log("   - Move client-only imports to components with 'use client' directive");
  console.log("   - Use dynamic imports: const Component = dynamic(() => import('./Component'), { ssr: false })");
  console.log("   - Wrap window/document usage in typeof window !== 'undefined' checks\n");
  process.exit(1);
} else {
  console.log("✅ All SSR guard checks passed!\n");
  process.exit(0);
}

