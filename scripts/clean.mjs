#!/usr/bin/env node
/**
 * Centralized clean script
 * Removes all build artifacts across the monorepo
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { readdirSync, statSync, rmSync } from 'fs';

const ROOT_DIR = process.cwd();

const ARTIFACTS = [
  '.turbo',
  'dist',
  '.next',
  'build',
  'tsconfig.tsbuildinfo',
  'coverage',
  'playwright-report',
  'test-results',
];

console.log('🧹 Cleaning build artifacts...\n');

function cleanDirectory(dir) {
  const patterns = [
    `${dir}/**/dist`,
    `${dir}/**/.next`,
    `${dir}/**/.turbo`,
    `${dir}/**/build`,
    `${dir}/**/*.tsbuildinfo`,
    `${dir}/**/coverage`,
    `${dir}/**/playwright-report`,
    `${dir}/**/test-results`,
  ];

  try {
    const rimrafPath = join(ROOT_DIR, 'node_modules/.bin/rimraf');
    if (existsSync(rimrafPath)) {
      for (const pattern of patterns) {
        try {
          execSync(`node "${rimrafPath}" "${pattern}"`, {
            cwd: ROOT_DIR,
            stdio: 'ignore',
          });
        } catch (err) {
          // Ignore errors for patterns that don't exist
        }
      }
    } else {
      // Fallback: clean common locations
      const dirsToClean = ['packages', 'apps'];
      for (const baseDir of dirsToClean) {
        const fullPath = join(ROOT_DIR, baseDir);
        if (existsSync(fullPath)) {
          for (const item of readdirSync(fullPath)) {
            const itemPath = join(fullPath, item);
            if (statSync(itemPath).isDirectory()) {
              for (const artifact of ARTIFACTS) {
                const artifactPath = join(itemPath, artifact);
                if (existsSync(artifactPath)) {
                  rmSync(artifactPath, { recursive: true, force: true });
                }
              }
              // Clean tsbuildinfo files
              const tsbuildinfo = join(itemPath, 'tsconfig.tsbuildinfo');
              if (existsSync(tsbuildinfo)) {
                rmSync(tsbuildinfo, { force: true });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during cleanup:', err.message);
    process.exit(1);
  }
}

// Clean root level artifacts
for (const artifact of ARTIFACTS) {
  const artifactPath = join(ROOT_DIR, artifact);
  if (existsSync(artifactPath)) {
    try {
      rmSync(artifactPath, { recursive: true, force: true });
      console.log(`  ✓ Cleaned ${artifact}`);
    } catch (err) {
      // Ignore errors
    }
  }
}

// Clean workspace artifacts
cleanDirectory(ROOT_DIR);

console.log('\n✅ Cleanup complete');

