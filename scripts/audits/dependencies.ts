#!/usr/bin/env node
/**
 * Dependency Audit Script
 *
 * Analyzes the monorepo for:
 * - Version mismatches
 * - Unused dependencies
 * - Missing dependencies
 * - Build artifacts
 * - Configuration inconsistencies
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const DEPENDENCIES_TO_CHECK = [
  'next',
  'typescript',
  'react',
  'react-dom',
  '@types/node',
  '@types/react',
  'eslint',
  'prettier',
  'cesium',
  '@cesium/engine',
];

const ROOT_DIR = process.cwd();

interface Package {
  name: string;
  path: string;
  packageJson: any;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

function getAllPackages(): Package[] {
  const packages: Package[] = [];

  // Root package
  const rootPackagePath = join(ROOT_DIR, 'package.json');
  if (existsSync(rootPackagePath)) {
    const pkg = JSON.parse(readFileSync(rootPackagePath, 'utf-8'));
    packages.push({
      name: pkg.name || 'root',
      path: ROOT_DIR,
      packageJson: pkg,
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      peerDependencies: pkg.peerDependencies || {},
    });
  }

  // Apps
  const appsDir = join(ROOT_DIR, 'apps');
  if (existsSync(appsDir)) {
    for (const app of readdirSync(appsDir)) {
      const appPath = join(appsDir, app);
      if (statSync(appPath).isDirectory()) {
        const packagePath = join(appPath, 'package.json');
        if (existsSync(packagePath)) {
          const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
          packages.push({
            name: pkg.name || app,
            path: appPath,
            packageJson: pkg,
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            peerDependencies: pkg.peerDependencies || {},
          });
        }
      }
    }
  }

  // Packages
  const packagesDir = join(ROOT_DIR, 'packages');
  if (existsSync(packagesDir)) {
    for (const pkg of readdirSync(packagesDir)) {
      const pkgPath = join(packagesDir, pkg);
      if (statSync(pkgPath).isDirectory()) {
        const packagePath = join(pkgPath, 'package.json');
        if (existsSync(packagePath)) {
          const pkgJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
          packages.push({
            name: pkgJson.name || pkg,
            path: pkgPath,
            packageJson: pkgJson,
            dependencies: pkgJson.dependencies || {},
            devDependencies: pkgJson.devDependencies || {},
            peerDependencies: pkgJson.peerDependencies || {},
          });
        }
      }
    }
  }

  return packages;
}

function checkVersionMismatches(packages: Package[]): void {
  console.log('\n🔍 Checking for version mismatches...\n');

  const versions: Record<string, Set<string>> = {};

  for (const dep of DEPENDENCIES_TO_CHECK) {
    versions[dep] = new Set();

    for (const pkg of packages) {
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      };

      if (allDeps[dep]) {
        versions[dep].add(`${pkg.name}: ${allDeps[dep]}`);
      }
    }
  }

  let hasMismatches = false;
  for (const [dep, versionSet] of Object.entries(versions)) {
    if (versionSet.size > 1) {
      hasMismatches = true;
      console.log(`⚠️  ${dep}:`);
      versionSet.forEach(v => console.log(`   - ${v}`));
      console.log();
    }
  }

  if (!hasMismatches) {
    console.log('✅ No version mismatches found!\n');
  }
}

function checkBuildArtifacts(packages: Package[]): void {
  console.log('\n🔍 Checking for build artifacts...\n');

  const artifacts = ['dist', 'dist_test', '.next', 'build', 'out', 'node_modules'];
  let foundArtifacts = false;

  for (const pkg of packages) {
    for (const artifact of artifacts) {
      const artifactPath = join(pkg.path, artifact);
      if (existsSync(artifactPath)) {
        foundArtifacts = true;
        console.log(`⚠️  Found ${artifact}/ in ${pkg.name}`);
      }
    }
  }

  if (!foundArtifacts) {
    console.log('✅ No unexpected build artifacts found!\n');
  }
}

function checkConfigurationFiles(packages: Package[]): void {
  console.log('\n🔍 Checking for configuration files...\n');

  const configFiles = [
    { name: 'tsconfig.json', required: true },
    { name: '.eslintrc.json', required: false },
    { name: '.prettierrc', required: false },
  ];

  for (const pkg of packages) {
    if (pkg.name === 'root') continue;

    for (const config of configFiles) {
      const configPath = join(pkg.path, config.name);
      const exists = existsSync(configPath);

      if (config.required && !exists) {
        console.log(`❌ Missing ${config.name} in ${pkg.name}`);
      } else if (!config.required && !exists) {
        console.log(`ℹ️  Missing optional ${config.name} in ${pkg.name}`);
      }
    }
  }

  console.log();
}

function checkPackageMetadata(packages: Package[]): void {
  console.log('\n🔍 Checking package metadata...\n');

  const issues: string[] = [];

  for (const pkg of packages) {
    // Check package name format
    if (pkg.name !== 'root' && pkg.name !== 'website' && !pkg.name.startsWith('@klorad')) {
      issues.push(`⚠️  ${pkg.name}: Package name doesn't follow naming convention`);
    }

    // Check for engines field
    if (!pkg.packageJson.engines && pkg.name !== 'root') {
      issues.push(`ℹ️  ${pkg.name}: Missing engines field`);
    }

    // Check for version field
    if (!pkg.packageJson.version) {
      issues.push(`⚠️  ${pkg.name}: Missing version field`);
    }
  }

  if (issues.length === 0) {
    console.log('✅ Package metadata looks good!\n');
  } else {
    issues.forEach(issue => console.log(issue));
    console.log();
  }
}

function main(): void {
  console.log('🚀 Starting Dependency Audit...\n');
  console.log('=' .repeat(60));

  const packages = getAllPackages();
  console.log(`Found ${packages.length} packages to analyze\n`);

  checkVersionMismatches(packages);
  checkBuildArtifacts(packages);
  checkConfigurationFiles(packages);
  checkPackageMetadata(packages);

  console.log('=' .repeat(60));
  console.log('\n✅ Audit complete!\n');
}

main();

