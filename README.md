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

2. Generate Prisma client:
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