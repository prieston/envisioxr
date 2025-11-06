#!/usr/bin/env tsx

/**
 * Image/Texture Pipeline Audit (strict)
 * - Accurate line/column reporting
 * - File-level and cross-file duplicate detection
 * - Proper Base64 size calculation
 * - Improved "recreated every render" detection
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

type Severity = "critical" | "high" | "medium";

interface Issue {
  file: string;
  line: number | null;
  col: number | null;
  issue: string;
  description: string;
  fix: string;
  extra?: Record<string, unknown>;
}

const issues: Record<Severity, Issue[]> = {
  critical: [],
  high: [],
  medium: [],
};

const MAX_TEXTURE_SIZE = 4096; // Reasonable max for WebGL
const BASE64_WARN_BYTES = 50 * 1024; // 50 KB warn
const BASE64_CRIT_BYTES = 256 * 1024; // 256 KB likely problematic

// Cross-file duplicate tracking
const seenTextureUrls = new Map<string, Array<{ file: string; line: number | null }>>();

// ------------ utils -------------
function listSourceFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    if (
      ["node_modules", "dist", ".next", ".turbo", "build", "coverage", "storybook-static", "cypress", "e2e", "public", "vendor"].includes(
        entry
      )
    )
      continue;
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      listSourceFiles(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec|stories)\.(t|j)sx?$|\.d\.ts$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

function lineColFromIndex(content: string, index: number | undefined | null): { line: number | null; col: number | null } {
  if (index == null || index < 0) return { line: null, col: null };
  let line = 1;
  let col = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

function pushIssue(
  sev: Severity,
  file: string,
  matchIdx: number | undefined | null,
  content: string,
  partial: Omit<Issue, "file" | "line" | "col">
) {
  const { line, col } = lineColFromIndex(content, matchIdx);
  issues[sev].push({
    file: path.relative(workspaceRoot, file),
    line,
    col,
    ...partial,
  });
}

function approxBase64Bytes(b64: string): number {
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return (b64.length / 4) * 3 - pad;
}

function stripComments(content: string): string {
  // Remove single-line comments
  let stripped = content.replace(/\/\/.*$/gm, "");
  // Remove multi-line comments
  stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, "");
  return stripped;
}

function addSeenUrl(url: string, file: string, line: number | null) {
  const list = seenTextureUrls.get(url) ?? [];
  if (!list.some((e) => e.file === file && e.line === line)) {
    list.push({ file, line });
    seenTextureUrls.set(url, list);
  }
}

// ------------ audit per-file -------------
function auditFile(file: string) {
  const code = fs.readFileSync(file, "utf8");
  const stripped = stripComments(code);

  // Check 1: Base64 images bound as textures
  const base64Pattern = /data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]{100,})/g;
  for (const m of code.matchAll(base64Pattern)) {
    const base64Data = m[2];
    const sizeBytes = approxBase64Bytes(base64Data);

    if (sizeBytes > BASE64_WARN_BYTES) {
      const near = code.slice(Math.max(0, (m.index ?? 0) - 300), Math.min(code.length, (m.index ?? 0) + 300));
      const inTextureContext = /Texture|ImageMaterialProperty|material|image/.test(near);
      const inHotPath = /pre(Update|Render)|post(Update|Render)|requestAnimationFrame/.test(near);

      if (sizeBytes > BASE64_CRIT_BYTES && inTextureContext && inHotPath) {
        pushIssue("critical", file, m.index, code, {
          issue: "CRITICAL: Large base64 image recreated in hot path",
          description: `Base64 image (~${Math.round(sizeBytes / 1024)}KB) embedded and recreated in render loop - causes decode overhead.`,
          fix: "Load image from URL and cache, or move creation outside hot path with useMemo/useRef.",
        });
      } else if (sizeBytes > BASE64_WARN_BYTES && inTextureContext) {
        pushIssue("high", file, m.index, code, {
          issue: "HIGH: Large base64 image used as texture",
          description: `Base64 image (~${Math.round(sizeBytes / 1024)}KB) embedded in code - increases bundle size and memory.`,
          fix: "Load image from URL or use proper texture loading pipeline with caching.",
        });
      } else if (sizeBytes > BASE64_WARN_BYTES) {
        pushIssue("medium", file, m.index, code, {
          issue: "MEDIUM: Large base64 image in code",
          description: `Base64 image (~${Math.round(sizeBytes / 1024)}KB) increases bundle size.`,
          fix: "Consider loading from URL if size is significant.",
        });
      }
    }
  }

  // Check 2: ImageMaterialProperty recreated every render
  const imageMaterialPattern = /new\s+Cesium\.ImageMaterialProperty\s*\(/g;
  for (const m of code.matchAll(imageMaterialPattern)) {
    const near = code.slice(Math.max(0, (m.index ?? 0) - 500), Math.min(code.length, (m.index ?? 0) + 500));
    const hotPath = /(pre(Update|Render)|post(Update|Render)|requestAnimationFrame)\s*\(/.test(near);
    const effectNoDeps = /useEffect\s*\(\s*\(\s*=>[\s\S]*?new\s+Cesium\.ImageMaterialProperty\([\s\S]*?\)\s*,\s*\[\s*\]\s*\)/m.test(near);
    const hasMemo = /useMemo|useRef/.test(near);

    if ((hotPath || effectNoDeps) && !hasMemo) {
      pushIssue("critical", file, m.index, code, {
        issue: "CRITICAL: ImageMaterialProperty recreated every render",
        description: "Creating ImageMaterialProperty in hot path or effect without deps leaks textures.",
        fix: "Create once and reuse with useMemo/useRef: const material = useMemo(() => new Cesium.ImageMaterialProperty(...), [deps]).",
      });
    }
  }

  // Check 3: TextureUniforms recreated every render
  const textureUniformPattern = /\bTextureUniform\b|\buniform\s+.*\btexture\b/gi;
  for (const m of stripped.matchAll(textureUniformPattern)) {
    const near = code.slice(Math.max(0, (m.index ?? 0) - 500), Math.min(code.length, (m.index ?? 0) + 500));
    if (/(pre(Update|Render)|post(Update|Render)|requestAnimationFrame)\s*\(/.test(near)) {
      pushIssue("high", file, m.index, code, {
        issue: "HIGH: TextureUniform recreated every render",
        description: "Recreating texture uniforms every frame is expensive.",
        fix: "Cache texture uniforms and only update when texture changes.",
      });
    }
  }

  // Check 4: Missing texture size validation (portability/perf risk)
  const textureLoadPattern = /(new\s+Cesium\.Texture|Texture\.fromImage|Texture\.fromUrl)/g;
  for (const m of code.matchAll(textureLoadPattern)) {
    const near = code.slice(Math.max(0, (m.index ?? 0) - 500), Math.min(code.length, (m.index ?? 0) + 500));
    if (!/width|height|size|max.*size|validate|check.*size/i.test(near)) {
      pushIssue("medium", file, m.index, code, {
        issue: "MEDIUM: Texture loaded without size validation",
        description: `Large textures (>${MAX_TEXTURE_SIZE}px) may cause memory pressure, upload delays, or driver caps on some devices.`,
        fix: `Check texture dimensions before loading: if (width > ${MAX_TEXTURE_SIZE} || height > ${MAX_TEXTURE_SIZE}) resize or warn.`,
      });
    }
  }

  // Check 5: Full-res UI images used as textures
  const imageUrlPattern = /(?:image|img|texture|src)\s*[:=]\s*["']([^"']+\.(jpg|jpeg|png|webp))["']/gi;
  for (const m of code.matchAll(imageUrlPattern)) {
    const url = m[1];
    if (/thumbnail|preview|icon|logo|ui|assets/.test(url)) {
      const near = code.slice(Math.max(0, (m.index ?? 0) - 300), Math.min(code.length, (m.index ?? 0) + 300));
      if (/\bTexture\b|\bImageMaterialProperty\b|\bmaterial\b/.test(near) && !/src\s*=\s*["']/.test(near)) {
        // Exclude JSX src="..." unless in Cesium context
        const { line } = lineColFromIndex(code, m.index);
        pushIssue("high", file, m.index, code, {
          issue: "HIGH: UI image used as texture",
          description: `UI image (${url}) used as texture - may be unnecessarily high resolution.`,
          fix: "Use appropriately sized texture version, not full-res UI asset.",
        });
        addSeenUrl(url, file, line);
      }
    }
  }

  // Check 6: Missing texture reuse/caching (file-level)
  const texturePattern = /(new\s+Cesium\.Texture|Texture\.fromImage|Texture\.fromUrl)\s*\([^)]*["']([^"']+\.(jpg|jpeg|png|webp))["']/g;
  const textureUrls = new Map<string, Array<{ idx: number; line: number | null }>>();

  for (const m of code.matchAll(texturePattern)) {
    const url = m[2];
    const { line } = lineColFromIndex(code, m.index);
    const list = textureUrls.get(url) ?? [];
    list.push({ idx: m.index ?? 0, line });
    textureUrls.set(url, list);
    addSeenUrl(url, file, line);
  }

  for (const [url, occurrences] of textureUrls.entries()) {
    if (occurrences.length > 1) {
      pushIssue("high", file, occurrences[0].idx, code, {
        issue: "HIGH: Same texture loaded multiple times in file",
        description: `Texture ${url} loaded ${occurrences.length} times - should reuse cached texture.`,
        fix: "Implement texture cache to reuse loaded textures.",
        extra: { url, count: occurrences.length },
      });
    }
  }

  // Check 7: Image loading without error handling
  const imageLoadPattern = /(new\s+Image\(|Image\.fromUrl|loadImage)/gi;
  for (const m of code.matchAll(imageLoadPattern)) {
    const near = code.slice(Math.max(0, (m.index ?? 0) - 300), Math.min(code.length, (m.index ?? 0) + 300));
    if (!/\.catch|\.onerror|\berror\b|\bcatch\b/.test(near)) {
      pushIssue("medium", file, m.index, code, {
        issue: "MEDIUM: Image loading without error handling",
        description: "Image loading should handle failures gracefully.",
        fix: "Add error handler: image.onerror = () => { /* handle */ }",
      });
    }
  }

  // Check 8: Texture created in useEffect without cleanup
  const useEffectPattern = /useEffect\s*\(\s*\(?\s*\)?\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
  for (const m of code.matchAll(useEffectPattern)) {
    const effectBody = m[1];
    if (/new\s+Cesium\.Texture|Texture\.from/.test(effectBody)) {
      // Check for cleanup: return () => { ... }, try/finally, or explicit destroy
      const hasCleanup =
        /return\s+\(?\s*\(?\s*\)?\s*=>\s*\{[\s\S]*?(?:\.destroy\s*\(|texture\?\.destroy|cleanup)/.test(effectBody) ||
        /try\s*\{[\s\S]*?finally\s*\{[\s\S]*?\.destroy\s*\(/.test(effectBody);
      if (!hasCleanup) {
        pushIssue("high", file, m.index, code, {
          issue: "HIGH: Texture created in useEffect without cleanup",
          description: "Textures created in useEffect must be destroyed to prevent leaks.",
          fix: "Add cleanup: return () => { texture?.destroy?.(); }",
        });
      }
    }
  }
}

// ------------ run -------------
console.log("🔍 Running Image/Texture Pipeline Audit (strict)…\n");

const roots = [
  path.join(workspaceRoot, "packages/engine-cesium/src"),
  path.join(workspaceRoot, "apps/editor/app"),
].filter(fs.existsSync);

const files = roots.flatMap((r) => listSourceFiles(r));
files.forEach(auditFile);

// Cross-file duplicate urls
for (const [url, occurrences] of seenTextureUrls.entries()) {
  if (occurrences.length > 1) {
    const uniqueFiles = Array.from(new Set(occurrences.map((o) => o.file)));
    if (uniqueFiles.length > 1) {
      uniqueFiles.forEach((f) => {
        const fileOccurrences = occurrences.filter((o) => o.file === f);
        const firstOcc = fileOccurrences[0];
        if (firstOcc) {
          // Read file to get content for line calculation
          try {
            const fileContent = fs.readFileSync(path.join(workspaceRoot, f), "utf8");
            // Find the URL in the file to get accurate index
            const urlMatch = fileContent.match(new RegExp(`["']${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
            pushIssue("medium", f, urlMatch?.index ?? null, fileContent, {
              issue: "Potential duplicate texture across files",
              description: `Same texture URL used in multiple files: ${url}`,
              fix: "Hoist into a shared texture cache/loader and reuse the instance.",
              extra: { url, files: uniqueFiles },
            });
          } catch {
            // If file can't be read, just add with line number
            issues.medium.push({
              file: path.relative(workspaceRoot, f),
              line: firstOcc.line,
              col: null,
              issue: "Potential duplicate texture across files",
              description: `Same texture URL used in multiple files: ${url}`,
              fix: "Hoist into a shared texture cache/loader and reuse the instance.",
              extra: { url, files: uniqueFiles },
            });
          }
        }
      });
    }
  }
}

// ------------ report -------------
const wantJson = process.argv.includes("--json");
const strict = process.argv.includes("--strict");
const hasCrit = issues.critical.length > 0;
const hasHigh = issues.high.length > 0;

if (wantJson) {
  console.log(JSON.stringify(issues, null, 2));
  process.exit(strict ? (hasCrit || hasHigh ? 2 : 0) : hasCrit ? 2 : hasHigh ? 1 : 0);
}

function dump(sev: Severity, title: string, icon: string) {
  const arr = issues[sev];
  if (arr.length === 0) return;
  console.log(`${icon} ${title}: ${arr.length}`);
  console.log("-".repeat(80));
  arr.forEach((it, i) => {
    console.log(`\n${i + 1}. ${it.issue}`);
    console.log(`   File: ${it.file}${it.line ? `:${it.line}${it.col ? `:${it.col}` : ""}` : ""}`);
    console.log(`   ${it.description}`);
    console.log(`   Fix: ${it.fix}`);
    if (it.extra) console.log(`   Info: ${JSON.stringify(it.extra)}`);
  });
  console.log();
}

console.log("=".repeat(80));
console.log("IMAGE/TEXTURE PIPELINE AUDIT REPORT");
console.log("=".repeat(80));
console.log();

dump("critical", "CRITICAL ISSUES", "🔴");
dump("high", "HIGH PRIORITY ISSUES", "🟡");
dump("medium", "MEDIUM PRIORITY ISSUES", "🟢");

console.log("=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`Critical: ${issues.critical.length}`);
console.log(`High: ${issues.high.length}`);
console.log(`Medium: ${issues.medium.length}`);
console.log();

// Exit codes: 2 for critical, 1 for high (if strict), 0 otherwise
if (hasCrit) {
  console.log("❌ Audit failed - Critical issues must be fixed");
  process.exit(2);
}
if (strict && hasHigh) {
  console.log("❌ Audit failed (--strict) - High priority issues must be fixed");
  process.exit(1);
}
if (hasHigh) {
  console.log("⚠️  Audit passed with warnings - High priority issues recommended");
  process.exit(0);
}
console.log("✅ Audit passed");
process.exit(0);
