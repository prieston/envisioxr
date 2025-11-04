# Vercel Configuration Checklist

## 📋 Vercel Project Settings (Check These in Vercel Dashboard)

### For `apps/editor` Project:
- **Framework Preset**: Should be `Next.js`
- **Root Directory**: `apps/editor` (NOT repo root)
- **Install Command**: `pnpm install --frozen-lockfile` (or `pnpm install --frozen-lockfile --prod=false` to ensure devDeps like TypeScript are available)
- **Build Command**: `pnpm vercel:build:editor`
- **Output Directory**: `.next` (default for Next.js 14)
- **Node.js Version**: `20.x` (matches `engines.node: ">=20 <23"`)
- **Environment Variables**:
  - `CESIUM_BASE_URL` (if different from `/cesium`)
  - `NEXT_PUBLIC_CESIUM_ION_KEY` or `NEXT_PUBLIC_CESIUM_TOKEN`
  - `DATABASE_URL` (for Prisma)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - Any other app-specific env vars
- **Ignore Build Step**: Leave empty (unless you have a specific condition)

### For `apps/website` Project (if separate):
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/website`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Build Command**: `pnpm vercel:build:website`
- **Output Directory**: `.next`
- **Node.js Version**: `20.x`

---

## 📁 Repository Configuration Files

### Root `package.json`
```json
{
  "packageManager": "pnpm@9.12.3",
  "engines": {
    "node": ">=20 <23",
    "pnpm": ">=9"
  },
  "scripts": {
    "clean": "node scripts/clean.mjs",
    "build:packages": "pnpm clean && pnpm --filter @envisio/core build && pnpm --filter @envisio/config build && pnpm --filter @envisio/ui build && pnpm --filter @envisio/ion-sdk build && pnpm --filter @envisio/engine-cesium build && pnpm --filter @envisio/engine-three build",
    "build:editor": "pnpm build:packages && cd apps/editor && pnpm build",
    "build:website": "cd apps/website && pnpm build",
    "vercel:build:editor": "pnpm prisma:generate && pnpm clean && pnpm build:packages && cd apps/editor && pnpm build",
    "vercel:build:website": "pnpm build:website",
    "prisma:generate": "pnpm --filter @envisioxr/prisma generate",
    "postinstall": "pnpm prisma:generate"
  }
}
```

**Key Points:**
- ✅ `vercel:build:editor` runs: `prisma:generate` → `clean` → `build:packages` → `cd apps/editor && pnpm build`
- ✅ Per-package clean scripts are local-only (`rm -rf dist *.tsbuildinfo`)
- ✅ Root clean runs once before `build:packages`

---

### `apps/editor/next.config.mjs`

**Key Sections:**

1. **CESIUM_BASE_URL** (line 35-36):
```javascript
env: {
  CESIUM_BASE_URL: '/cesium',
}
```

2. **DefinePlugin** (lines 44-50):
```javascript
config.plugins.push(
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(isDev),
    __LOG_LEVEL__: JSON.stringify(isDev ? 'debug' : 'warn'),
    DEBUG_SENSORS: JSON.stringify(process.env.DEBUG_SENSORS === 'true'),
  })
);
```

3. **assetPrefix** (line 33):
```javascript
assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
```

4. **Output** (line 31):
```javascript
output: 'standalone',
```

**⚠️ Note**: No `CopyWebpackPlugin` visible - Cesium assets must be handled differently or copied during build.

---

### `apps/website/next.config.mjs`

**Key Sections:**

1. **DefinePlugin** (lines 18-24):
```javascript
config.plugins.push(
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(isDev),
    __LOG_LEVEL__: JSON.stringify(isDev ? 'debug' : 'warn'),
    DEBUG_SENSORS: JSON.stringify(false),
  })
);
```

2. **No CESIUM_BASE_URL** (website doesn't use Cesium)

---

### `packages/engine-cesium/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2020",
    "baseUrl": ".",
    "paths": {
      "@envisio/core": ["../core/dist/index"],
      "@envisio/core/*": ["../core/dist/*"],
      "@envisio/ion-sdk": ["../ion-sdk/dist/index"],
      "@envisio/ion-sdk/*": ["../ion-sdk/dist/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Key Points:**
- ✅ `rootDir: "./src"` keeps dist flat
- ✅ `paths` point to `dist/*` (built packages)
- ✅ `composite: true` NOT set (could add for project refs)

---

### `packages/ion-sdk/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.*", "dist", "node_modules"]
}
```

**Key Points:**
- ✅ `rootDir: "./src"` keeps dist flat
- ✅ `composite: true` set
- ✅ No `baseUrl` or `paths` (correct for library)
- ⚠️ `include: ["src/**/*"]` includes vendor files (may cause TS errors)

---

### `tsconfig.base.json` (Root)

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": false,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@envisio/core": ["packages/core/src/index.ts"],
      "@envisio/core/*": ["packages/core/src/*"],
      // ... other packages point to src/*
    }
  },
  "exclude": ["node_modules"]
}
```

**⚠️ Note**: Base config paths point to `src/*`, but individual package tsconfigs override with `dist/*` paths.

---

### `packages/engine-cesium/package.json`

```json
{
  "name": "@envisio/engine-cesium",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "@envisio/core": "workspace:*",
    "@envisio/ion-sdk": "workspace:*"
  }
}
```

**Key Points:**
- ✅ `types` points to `dist/index.d.ts` (not `src`)
- ✅ Internal packages use `workspace:*` in peerDependencies
- ✅ Exports map clean (no src leaks)

---

### `packages/ion-sdk/package.json`

```json
{
  "name": "@envisio/ion-sdk",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "@envisio/core": "workspace:*"
  }
}
```

**Key Points:**
- ✅ `types` points to `dist/index.d.ts`
- ✅ Uses `workspace:*` for internal deps

---

### `packages/prisma/package.json`

```json
{
  "name": "@envisioxr/prisma",
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0"
  }
}
```

**Key Points:**
- ✅ `prisma` and `@prisma/client` in `dependencies` (not devDependencies)
- ✅ Root `postinstall` runs `pnpm prisma:generate`

---

### `apps/editor/.vercelignore`

**Content:** (Check if file exists and what it contains)

---

### `scripts/clean.mjs`

**Key Function:**
- Cleans `**/dist`, `**/.next`, `**/.turbo`, `**/*.tsbuildinfo` across workspaces
- ✅ Does NOT run during package builds (packages use local clean)
- ✅ Only called from root `clean` script

---

## 🔍 Potential Issues to Check

1. **Root Directory**: If Vercel Root Directory is repo root instead of `apps/editor`, build will fail
2. **Install Command**: Must include `--prod=false` or devDeps won't be installed (TypeScript needed)
3. **Cesium Assets**: No CopyWebpackPlugin visible - verify Cesium assets are handled correctly
4. **TypeScript**: Must be available at build time (in devDependencies at root)
5. **Build Order**: `vercel:build:editor` correctly orders: prisma → clean → build packages → build editor
6. **Workspace Protocol**: Internal packages use `workspace:*` - ensure Vercel supports this (should work with pnpm)

---

## ✅ Quick Verification Commands

Run these locally to verify:
```bash
# Verify clean doesn't nuke deps mid-build
pnpm clean && pnpm build:packages

# Verify editor builds after packages
pnpm build:editor

# Verify types point to dist
grep -r '"types":' packages/*/package.json | grep -v dist

# Verify no src leaks in exports
grep -r "src" packages/*/package.json | grep -E "(main|module|types|exports)"
```


