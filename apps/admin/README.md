# Klorad Admin Dashboard

A dedicated Next.js application for managing the Klorad platform. This admin dashboard provides comprehensive tools for managing organizations, licenses, and viewing platform analytics.

## Setup

### Environment Variables

The admin app needs access to the same environment variables as the editor app. You have two options:

**Option 1: Create a symlink (recommended)**
```bash
cd apps/admin
ln -s ../editor/.env.local .env.local
```

**Option 2: Copy environment variables**
Create `apps/admin/.env.local` with at minimum:
```bash
# Required
DATABASE_URL=your_database_url
SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3002

# Optional (for OAuth - can use credentials provider if not set)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

The admin app will work with just `DATABASE_URL` and `SECRET` - OAuth providers are optional since you can use the credentials (email/password) provider.

## Features

- **Analytics Dashboard**: View platform-wide statistics including users, organizations, projects, and storage usage
- **Organization Management**: Create and delete organizations
- **License Management**: Grant or suspend licenses by updating organization plans and subscription statuses
- **User Management**: View all users and their activity

## Access Control

Only users listed in the `GOD_USERS` configuration (`lib/config/godusers.ts`) can access this dashboard. Currently, only `theofilos@prieston.gr` has access.

## Development

```bash
# Install dependencies (from root)
pnpm install

# Run admin dashboard
pnpm dev:admin

# Or run all apps together
pnpm dev
```

The admin dashboard runs on `http://localhost:3002` by default.

## API Routes

- `GET /api/stats` - Get platform statistics
- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create a new organization
- `DELETE /api/organizations/[orgId]` - Delete an organization
- `PATCH /api/organizations/[orgId]/license` - Update organization license (plan and subscription status)
- `GET /api/plans` - List all available plans

## Building

```bash
# Build admin app
pnpm build:admin

# Build for Vercel
pnpm vercel:build:admin
```

## Deployment

The admin dashboard can be deployed separately from the main editor app. Update the `NEXTAUTH_URL` environment variable to match your deployment URL.
