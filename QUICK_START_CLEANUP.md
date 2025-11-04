# 🚀 Quick Start: Immediate Cleanup Actions

## ⚡ Quick Wins (20 minutes)

These can be done immediately without breaking changes:

### 1. Fix Package Name (2 min)
```bash
# Fix editor package.json name
cd apps/editor
# Change "react-three-next" to "@envisioxr/editor"
```

### 2. Remove Build Artifacts (2 min)
```bash
# Remove dist_test folder
rm -rf packages/core/dist_test
```

### 3. Remove Unused File (1 min)
```bash
# Remove test file
rm test-ion-token.html
```

### 4. Standardize Node Version (5 min)
```bash
# Update apps/editor/package.json engines to match root
# Change: "node": ">=18.0.0"
# To: "node": ">=20 <23"
```

### 5. Update README (5 min)
```bash
# Update README.md to reflect Node >=20 requirement
```

### 6. Run Audit Script (5 min)
```bash
# Run the audit script to see current state
node scripts/audit-dependencies.mjs
```

---

## 📋 How to Use This Cleanup Plan

### Option 1: Incremental Approach (Recommended)
1. Start with **Quick Wins** above
2. Tackle one phase per week
3. Test thoroughly after each phase
4. Keep CI/CD green

### Option 2: Focused Sprint
1. Dedicate 1-2 weeks focused on cleanup
2. Follow phases sequentially
3. Get team review before major changes

### Option 3: As-You-Go
1. Address issues as you encounter them
2. Use audit script regularly
3. Track progress in CLEANUP_PLAN.md

---

## 🛠️ Useful Commands

```bash
# Run dependency audit
node scripts/audit-dependencies.mjs

# Check for unused dependencies (requires depcheck)
pnpm add -D -w depcheck
pnpm -r exec depcheck

# Check security vulnerabilities
pnpm audit

# Format all code
pnpm format

# Lint all code
pnpm lint

# Clean all build artifacts
pnpm -r clean

# Type check all packages
pnpm -r exec tsc --noEmit
```

---

## 📊 Progress Tracking

Update the status in `CLEANUP_PLAN.md` as you complete phases:

- ✅ Completed
- 🟡 In Progress
- ⏳ Pending
- ❌ Blocked

---

## 🎯 Priority Order

1. **Quick Wins** - Do immediately
2. **Phase 1** - Critical for stability
3. **Phase 2** - Improves build performance
4. **Phase 3** - Code quality improvements
5. **Phase 4** - Developer experience
6. **Phase 5** - Performance gains
7. **Phase 6** - Long-term maintainability

---

## ⚠️ Important Notes

- **Always test** after dependency changes
- **Keep CI/CD green** - don't merge broken builds
- **Document decisions** - update docs as you go
- **Get team buy-in** for major changes
- **One change at a time** - easier to debug

---

## 📞 Need Help?

- Review `CLEANUP_PLAN.md` for detailed phase breakdown
- Check `scripts/audit-dependencies.mjs` for automation
- Use `pnpm why <package>` to understand dependency trees

