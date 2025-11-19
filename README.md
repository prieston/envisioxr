# EnvisioXR Monorepo

This monorepo contains the following projects:

- `website/`: The main website
- `editor/`: The 3D editor application
- `packages/`: Shared packages
  - `prisma/`: Database schema and client

## Prerequisites

- Node.js >= 18
- pnpm >= 8

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file at the root of the monorepo with your environment variables:
   ```bash
   # Required environment variables (see apps/editor/lib/env/server.ts for full list)
   DATABASE_URL=postgresql://...
   SHADOW_DATABASE_URL=postgresql://...
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   # ... etc
   ```

   **Note:** The `.env` file should be at the **root** of the monorepo. Symlinks have been created in `apps/editor/.env` and `apps/website/.env` that point to the root `.env` file. This allows:
   - Prisma to find `DATABASE_URL` when running migrations from `packages/prisma/`
   - Next.js apps to access environment variables from their own directories
   - All packages to share the same environment configuration

   If you need to recreate the symlinks:
   ```bash
   ln -sf ../../.env apps/editor/.env
   ln -sf ../../.env apps/website/.env
   ```

3. Generate Prisma client:
   ```bash
   pnpm prisma:generate
   ```

## Development

- Start the website:
  ```bash
  pnpm dev:website
  ```

- Start the editor:
  ```bash
  pnpm dev:editor
  ```

## Building

- Build the website:
  ```bash
  pnpm build:website
  ```

- Build the editor:
  ```bash
  pnpm build:editor
  ```

## Deployment

Both the website and editor are deployed on Vercel. Each project has its own deployment configuration and environment variables.

## Project Structure

```
envisioxr/
├── website/          # Main website
├── editor/          # 3D editor application
├── packages/        # Shared packages
│   └── prisma/     # Database schema and client
├── package.json    # Root package.json with workspace config
└── pnpm-workspace.yaml  # Workspace configuration
```