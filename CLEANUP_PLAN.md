# Codebase Cleanup & Optimization Plan

## 📋 Overview

This document outlines a systematic approach to cleaning up and optimizing the EnvisioXR monorepo for better performance, maintainability, and structure.

## 🎯 Goals

1. **Performance**: Optimize build times, bundle sizes, and runtime performance
2. **Maintainability**: Standardize patterns, remove technical debt, improve code quality
3. **Structure**: Clean up artifacts, align dependencies, improve organization
4. **Best Practices**: Enforce consistent tooling, linting, and documentation

---

## 📊 Current Issues Identified

### 🔴 Critical Issues

1. **Version Mismatches**
   - Next.js: Root uses `^14.1.0`, website uses `15.0.3`
   - Cesium: Multiple versions (`cesium@1.131.0`, `@cesium/engine@20.0.1`, override to `^22.0.0`)
   - TypeScript: Different versions across packages
   - Node.js: Editor requires `>=18`, root requires `>=20`

2. **Build Artifacts**
   - `dist_test/` folder in `packages/core/` (should be removed)
   - Build artifacts may need cleanup

3. **Package Metadata**
   - Editor `package.json` has incorrect name: `"react-three-next"` should be `"@envisioxr/editor"`

### 🟡 Medium Priority

4. **Dependency Management**
   - Duplicate dependencies (eslint, prettier, typescript in multiple places)
   - Potential unused dependencies
   - Missing dependency standardization

5. **Code Quality**
   - Debug code scattered throughout (135+ instances)
   - TODO/FIXME comments need addressing
   - Inconsistent linting setup

6. **Configuration**
   - Missing ESLint configs in some packages
   - Inconsistent TypeScript configs
   - Missing Prettier config

### 🟢 Low Priority

7. **Documentation**
   - README.md outdated (mentions Node >=18, but requires >=20)
   - Missing package-level documentation
   - Incomplete API documentation

8. **Structure**
   - Unused files (`test-ion-token.html`)
   - Potential dead code

---

## 📅 Execution Plan

### Phase 1: Dependency & Version Alignment (Week 1)

**Goal**: Standardize all dependencies and versions across the monorepo

#### Tasks:

1. ✅ Audit all `package.json` files for version mismatches
2. ✅ Create dependency version matrix
3. ✅ Align Next.js versions (choose 14 or 15)
4. ✅ Standardize Cesium versions
5. ✅ Align TypeScript versions
6. ✅ Update Node.js engine requirements consistently
7. ✅ Move shared devDependencies to root
8. ✅ Fix package names and metadata

**Deliverables**:

- Updated `package.json` files
- Dependency audit report
- Version alignment document

---

### Phase 2: Build & Artifact Cleanup (Week 1-2)

**Goal**: Remove build artifacts and optimize build process

#### Tasks:

1. ✅ Remove `dist_test/` folder
2. ✅ Verify `.gitignore` covers all build artifacts
3. ✅ Add cleanup scripts to packages
4. ✅ Optimize build order and caching
5. ✅ Review and optimize `next.config.mjs` files

**Deliverables**:

- Clean repository
- Optimized build scripts
- Build performance improvements

---

### Phase 3: Code Quality & Debug Cleanup (Week 2)

**Goal**: Remove debug code, address TODOs, improve code quality

#### Tasks:

1. ✅ Remove or gate debug code properly
2. ✅ Address critical TODOs/FIXMEs
3. ✅ Document remaining TODOs
4. ✅ Remove unused console.logs
5. ✅ Standardize logging approach

**Deliverables**:

- Clean codebase
- Logging strategy document
- TODO tracking system

---

### Phase 4: Configuration Standardization (Week 2-3)

**Goal**: Standardize tooling and configuration files

#### Tasks:

1. ✅ Standardize ESLint configs across packages
2. ✅ Add Prettier config (if missing)
3. ✅ Standardize TypeScript configs
4. ✅ Add consistent `.gitignore` patterns
5. ✅ Standardize build scripts

**Deliverables**:

- Consistent config files
- Configuration guide
- Linting improvements

---

### Phase 5: Performance Optimization (Week 3)

**Goal**: Optimize bundle sizes, build times, and runtime performance

#### Tasks:

1. ✅ Analyze bundle sizes
2. ✅ Remove unused dependencies
3. ✅ Optimize imports (tree-shaking)
4. ✅ Review and optimize webpack/Next.js configs
5. ✅ Add bundle analyzer to CI
6. ✅ Optimize Cesium asset loading

**Deliverables**:

- Performance audit report
- Bundle size improvements
- Optimization guide

---

### Phase 6: Documentation & Structure (Week 3-4)

**Goal**: Improve documentation and code organization

#### Tasks:

1. ✅ Update root README
2. ✅ Add package-level READMEs
3. ✅ Document architecture decisions
4. ✅ Create contributor guide
5. ✅ Remove unused files
6. ✅ Organize documentation structure

**Deliverables**:

- Updated documentation
- Architecture documentation
- Contributor guide

---

## 🛠️ Tools & Scripts Needed

### Audit Scripts

- Dependency audit: `pnpm audit`
- Bundle analysis: `@next/bundle-analyzer` (already present)
- Unused dependencies: `depcheck` or `pnpm why`
- Type checking: `tsc --noEmit`

### Maintenance Scripts

- Clean all builds: `pnpm -r clean`
- Format all code: `pnpm format`
- Lint all code: `pnpm lint`
- Type check: `pnpm typecheck` (needs to be added)

---

## 📈 Success Metrics

### Before Cleanup

- Build time: [To be measured]
- Bundle size: [To be measured]
- Dependency count: [To be measured]
- Code quality score: [To be measured]

### After Cleanup Targets

- ✅ Build time: < 30% improvement
- ✅ Bundle size: < 20% reduction
- ✅ Zero critical dependency vulnerabilities
- ✅ Consistent versions across all packages
- ✅ Zero debug code in production
- ✅ 100% linting coverage

---

## 🔄 Ongoing Maintenance

### Weekly

- Review and update dependencies
- Check for security vulnerabilities
- Review build performance

### Monthly

- Audit bundle sizes
- Review and update documentation
- Performance profiling

### Quarterly

- Major dependency updates
- Architecture review
- Code quality audit

---

## 📝 Notes

- This plan should be executed incrementally
- Test thoroughly after each phase
- Keep CI/CD green throughout
- Document decisions and changes
- Get team buy-in before major changes

---

## 🚀 Quick Wins (Can Start Immediately)

1. **Fix package name** - 5 minutes
2. **Remove dist_test folder** - 2 minutes
3. **Standardize Node version** - 5 minutes
4. **Add missing .gitignore entries** - 5 minutes
5. **Remove unused test file** - 2 minutes

**Total: ~20 minutes for immediate improvements**

---

_Last Updated: [Current Date]_
_Status: Planning Phase_
