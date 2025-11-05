#!/usr/bin/env node

/**
 * Form Field Accessibility Audit
 *
 * Checks for:
 * - Form input elements without id or name attributes
 * - TextField, Select, Input components without id or name props
 * - Native input, textarea, select elements without id or name attributes
 *
 * This prevents browser autofill issues and improves form accessibility.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");

let issues = [];

function findReactFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (
        file !== "node_modules" &&
        file !== "dist" &&
        file !== ".next" &&
        file !== "build"
      ) {
        findReactFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx|ts)$/)) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function findLineNumber(content, index) {
  return content.substring(0, index).split("\n").length;
}

function extractElementContext(content, matchIndex, tagName) {
  // Find the opening tag and extract attributes
  let depth = 0;
  let start = matchIndex;
  let end = matchIndex;
  let inString = false;
  let stringChar = null;

  // Find the start of the opening tag
  while (start > 0 && content[start] !== "<") {
    start--;
  }

  // Find the end of the opening tag or self-closing tag
  for (let i = start; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (!inString) {
      if (char === '"' || char === "'" || char === "`") {
        inString = true;
        stringChar = char;
      } else if (char === ">" && nextChar !== "/") {
        end = i + 1;
        break;
      } else if (char === "/" && nextChar === ">") {
        end = i + 2;
        break;
      }
    } else {
      if (char === stringChar && content[i - 1] !== "\\") {
        inString = false;
        stringChar = null;
      }
    }
  }

  return content.substring(start, end);
}

function hasIdOrName(attributes) {
  // Check for id="..." or id={...} or name="..." or name={...}
  const idPattern = /\bid\s*=\s*["'`{]|["'`]id["'`]\s*:/;
  const namePattern = /\bname\s*=\s*["'`{]|["'`]name["'`]\s*:/;

  return idPattern.test(attributes) || namePattern.test(attributes);
}

function isInComment(content, index) {
  // Get the line containing the index
  const beforeContent = content.substring(0, index);
  const lines = beforeContent.split("\n");
  const currentLine = lines[lines.length - 1];
  const lineStartIndex = beforeContent.length - currentLine.length;

  // Check if line starts with * (JSDoc comment style)
  if (currentLine.trim().startsWith("*")) {
    return true;
  }

  // Check for single-line comments (//) on the same line
  const commentIndex = currentLine.indexOf("//");
  if (commentIndex !== -1 && commentIndex < (index - lineStartIndex)) {
    // Check if // is not inside a string
    const beforeComment = currentLine.substring(0, commentIndex);
    const openQuotes = (beforeComment.match(/"/g) || []).length - (beforeComment.match(/\\"/g) || []).length;
    const openSingleQuotes = (beforeComment.match(/'/g) || []).length - (beforeComment.match(/\\'/g) || []).length;
    // If quotes are balanced before //, it's a comment
    if (openQuotes % 2 === 0 && openSingleQuotes % 2 === 0) {
      return true;
    }
  }

  // Check for multi-line comments (/* ... */)
  // Find unclosed /* comments before the index
  const beforeMatch = content.substring(Math.max(0, index - 5000), index);
  const lastMultiLineStart = beforeMatch.lastIndexOf("/*");
  if (lastMultiLineStart !== -1) {
    const afterStart = beforeMatch.substring(lastMultiLineStart);
    const lastMultiLineEnd = afterStart.indexOf("*/");
    // If we found /* but no */ before the match, we're in a comment
    if (lastMultiLineEnd === -1) {
      return true;
    }
    // Check if we're between /* and */
    const commentEndIndex = lastMultiLineStart + lastMultiLineEnd + 2;
    if (commentEndIndex < beforeMatch.length) {
      // Comment closed, we're not in it
      return false;
    }
  }

  return false;
}

function hasSpreadProps(attributes) {
  // Check for spread props like {...getInputProps()} which likely include id/name
  return /\{\.\.\.[^}]*\}/.test(attributes);
}

function analyzeFile(filePath, content) {
  const relativePath = path.relative(workspaceRoot, filePath);
  const lines = content.split("\n");

  // Pattern 1: Native HTML input elements (only lowercase, not components)
  const nativeInputPattern = /<input\s+/g;
  let match;
  while ((match = nativeInputPattern.exec(content)) !== null) {
    // Skip if in a comment
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "input"
    );

    // Skip if has spread props (like {...getInputProps()})
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "input",
        issue: "Native <input> element missing id or name attribute",
        fix: "Add id or name attribute: <input id='field-name' ... /> or <input name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }

  // Pattern 2: Native HTML textarea elements
  const textareaPattern = /<textarea\s+/g;
  while ((match = textareaPattern.exec(content)) !== null) {
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "textarea"
    );
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "textarea",
        issue: "Native <textarea> element missing id or name attribute",
        fix: "Add id or name attribute: <textarea id='field-name' ... /> or <textarea name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }

  // Pattern 3: Native HTML select elements (only lowercase, not Material-UI Select)
  const selectPattern = /<select\s+/g;
  while ((match = selectPattern.exec(content)) !== null) {
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "select"
    );
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "select",
        issue: "Native <select> element missing id or name attribute",
        fix: "Add id or name attribute: <select id='field-name' ... /> or <select name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }

  // Pattern 4: Material-UI TextField components
  // Look for <TextField ... /> or <TextField ... ></TextField>
  const textFieldPattern = /<TextField\s+/gi;
  while ((match = textFieldPattern.exec(content)) !== null) {
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "TextField"
    );
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "TextField",
        issue: "Material-UI <TextField> component missing id or name prop",
        fix: "Add id or name prop: <TextField id='field-name' ... /> or <TextField name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }

  // Pattern 5: Material-UI Select components (capitalized)
  const muiSelectPattern = /<Select\s+/gi;
  while ((match = muiSelectPattern.exec(content)) !== null) {
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "Select"
    );
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "Select",
        issue: "Material-UI <Select> component missing id or name prop",
        fix: "Add id or name prop: <Select id='field-name' ... /> or <Select name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }

  // Pattern 6: Material-UI Input components (capitalized, not native input)
  const muiInputPattern = /<Input\s+/gi;
  while ((match = muiInputPattern.exec(content)) !== null) {
    if (isInComment(content, match.index)) continue;

    const elementContext = extractElementContext(
      content,
      match.index,
      "Input"
    );
    if (hasSpreadProps(elementContext)) continue;

    if (!hasIdOrName(elementContext)) {
      const lineNum = findLineNumber(content, match.index);
      issues.push({
        file: relativePath,
        line: lineNum,
        severity: "high",
        element: "Input",
        issue: "Material-UI <Input> component missing id or name prop",
        fix: "Add id or name prop: <Input id='field-name' ... /> or <Input name='field-name' ... />",
        context: lines[lineNum - 1]?.trim() || "",
      });
    }
  }
}

console.log("🔍 Running Form Field Accessibility Audit...\n");

const sourceDirs = [
  path.join(workspaceRoot, "apps"),
  path.join(workspaceRoot, "packages"),
];

for (const dir of sourceDirs) {
  if (fs.existsSync(dir)) {
    const files = findReactFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      analyzeFile(file, content);
    }
  }
}

console.log("=".repeat(80));
console.log("FORM FIELD ACCESSIBILITY AUDIT REPORT");
console.log("=".repeat(80));
console.log();

if (issues.length === 0) {
  console.log("✅ No issues found! All form fields have id or name attributes.");
  process.exit(0);
}

// Group issues by severity
const highIssues = issues.filter((i) => i.severity === "high");

console.log(`🟡 HIGH PRIORITY ISSUES: ${highIssues.length}`);
console.log("-".repeat(80));

highIssues.forEach((issue, i) => {
  console.log(`\n${i + 1}. ${issue.issue}`);
  console.log(`   File: ${issue.file}:${issue.line}`);
  console.log(`   Element: <${issue.element}>`);
  if (issue.context) {
    console.log(`   Code: ${issue.context}`);
  }
  console.log(`   Fix: ${issue.fix}`);
});

console.log();
console.log("=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`Total issues: ${issues.length}`);
console.log(`High priority: ${highIssues.length}`);
console.log();

console.log("💡 Why this matters:");
console.log("   - Browser autofill requires id or name attributes");
console.log("   - Form accessibility improves with proper labeling");
console.log("   - Screen readers rely on id/name for form navigation");
console.log();

if (highIssues.length > 0) {
  console.log("❌ Audit failed - Form fields missing id or name attributes");
  process.exit(1);
}

console.log("✅ Audit passed");
process.exit(0);

