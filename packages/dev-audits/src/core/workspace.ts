/**
 * Workspace utilities for monorepo operations
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";
import type { Workspace, PackageInfo } from "./types.js";

export function createWorkspace(rootDir: string): Workspace {
  return {
    rootDir,
    async getPackages(): Promise<PackageInfo[]> {
      const packages: PackageInfo[] = [];
      const packagesDir = path.join(rootDir, "packages");
      const appsDir = path.join(rootDir, "apps");

      // Read packages
      if (fs.existsSync(packagesDir)) {
        const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgPath = path.join(packagesDir, entry.name);
            const pkgJsonPath = path.join(pkgPath, "package.json");
            if (fs.existsSync(pkgJsonPath)) {
              const pkgJson = JSON.parse(
                fs.readFileSync(pkgJsonPath, "utf8")
              ) as PackageInfo["packageJson"];
              packages.push({
                name: pkgJson.name || entry.name,
                path: pkgPath,
                packageJson: pkgJson,
              });
            }
          }
        }
      }

      // Read apps
      if (fs.existsSync(appsDir)) {
        const entries = fs.readdirSync(appsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const appPath = path.join(appsDir, entry.name);
            const pkgJsonPath = path.join(appPath, "package.json");
            if (fs.existsSync(pkgJsonPath)) {
              const pkgJson = JSON.parse(
                fs.readFileSync(pkgJsonPath, "utf8")
              ) as PackageInfo["packageJson"];
              packages.push({
                name: pkgJson.name || entry.name,
                path: appPath,
                packageJson: pkgJson,
              });
            }
          }
        }
      }

      return packages;
    },

    async findFiles(
      pattern: string,
      options?: { cwd?: string; ignore?: string[] }
    ): Promise<string[]> {
      const cwd = options?.cwd || rootDir;
      const ignore = [
        "**/node_modules/**",
        "**/dist/**",
        "**/.next/**",
        "**/build/**",
        ...(options?.ignore || []),
      ];

      return glob(pattern, { cwd, ignore });
    },

    async readFile(filePath: string): Promise<string> {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(rootDir, filePath);
      return fs.readFileSync(fullPath, "utf8");
    },

    fileExists(filePath: string): boolean {
      const fullPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(rootDir, filePath);
      return fs.existsSync(fullPath);
    },
  };
}

