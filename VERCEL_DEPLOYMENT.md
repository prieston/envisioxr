# Vercel Deployment Guide for Klorad Studio

## ✅ Pre-Deployment Checklist

Your build process is now optimized for Vercel production deployment!

### Build Process Overview

The production build follows this sequence:

1. **Install Dependencies**: `pnpm install --frozen-lockfile`
2. **Generate Prisma Client**: `pnpm prisma:generate`
3. **Build Packages** (in order):
   - `@envisio/core`
   - `@envisio/ui`
   - `@envisio/ion-sdk`
   - `@envisio/engine-cesium`
   - `@envisio/engine-three`
   - `@envisio/config`
4. **Build Editor**: `cd apps/editor && pnpm build`

### Required Environment Variables

Make sure to set these in your Vercel project settings:

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

**Authentication (NextAuth):**
- `NEXTAUTH_URL` - Your production URL (e.g., https://studio.klorad.com)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Cesium Ion:**
- `NEXT_PUBLIC_CESIUM_ION_ACCESS_TOKEN` - Your Cesium Ion access token
- `CESIUM_ION_ACCESS_TOKEN` - Server-side Cesium Ion token (optional)

**Optional:**
- `SKIP_ENV_VALIDATION=1` - Already set in vercel.json

### Vercel Project Settings

**Framework Preset:** Next.js

**Root Directory:** `apps/editor`

**Build Command:** Automatically uses `vercel.json` config
```
cd ../.. && pnpm vercel:build:editor
```

**Install Command:**
```
cd ../.. && pnpm install --frozen-lockfile
```

**Node Version:** 20.x (set in package.json engines)

**Region:** San Francisco (sfo1) - configured in vercel.json

### Function Configuration

- Max Duration: 60 seconds
- Memory: 1024 MB
- Configured for all API routes

### Output Configuration

- Output: `standalone` (optimized for Vercel)
- Output Directory: `.next`

## 🚀 Deployment Steps

### First Time Setup

1. **Connect Repository to Vercel**
   - Go to https://vercel.com
   - Import your Git repository
   - Select `apps/editor` as the root directory

2. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Settings → Environment Variables

3. **Adjust Build Settings** (if not auto-detected)
   - Framework Preset: Next.js
   - Root Directory: `apps/editor`
   - Build Command: `cd ../.. && pnpm vercel:build:editor`
   - Install Command: `cd ../.. && pnpm install --frozen-lockfile`
   - Output Directory: `.next`

4. **Deploy**
   - Click "Deploy"
   - First deployment will take 5-10 minutes

### Subsequent Deployments

Vercel will automatically deploy on:
- Push to `main` branch (production)
- Push to other branches (preview deployments)

## 🛠️ Local Testing of Production Build

Test the production build locally before deploying:

```bash
# From project root
pnpm vercel:build:editor

# Test the built app (requires Vercel CLI)
cd apps/editor
vercel dev --prod
```

## 📦 Build Optimizations

The following optimizations are configured:

1. **Monorepo Support**
   - All workspace packages are transpiled
   - Proper build order ensures dependencies are ready

2. **Bundle Size Optimization**
   - Heavy 3D libraries marked as external on server
   - Code splitting for Cesium and Three.js
   - Standalone output mode

3. **Performance**
   - PWA configured (disabled in development)
   - Bundle analyzer available with `ANALYZE=true`

4. **Caching**
   - Proper `.vercelignore` to exclude unnecessary files
   - TypeScript build info excluded

## 🐛 Troubleshooting

### Build Fails with "Cannot find module"

**Solution:** Ensure all packages are built in the correct order. The `build:packages` script handles this automatically.

### Prisma Client Not Found

**Solution:** The `postinstall` script automatically generates the Prisma client. If it fails, run manually:
```bash
pnpm prisma:generate
```

### Memory or Timeout Issues

**Solution:** Increase function memory/timeout in `vercel.json`:
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

### Module Resolution Errors

**Solution:** Check that `transpilePackages` in `next.config.mjs` includes all workspace packages.

## 📊 Monitoring

After deployment, monitor:
- Function execution time
- Memory usage
- Error rates
- Build times

Access these in Vercel Dashboard → Your Project → Analytics

## 🔄 Rollback

If a deployment fails:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

---

**Note:** This guide assumes you're deploying from a monorepo structure. All paths are relative to the repository root.

