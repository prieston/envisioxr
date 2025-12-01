#!/bin/bash

# Prisma Migration Script
# Loads .env file and runs Prisma migrations
# Usage: ./scripts/migrate.sh [dev|deploy]

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if DATABASE_URL is already set as environment variable (e.g., in Vercel)
if [ -z "$DATABASE_URL" ]; then
  # If not set, try to load from .env file
  if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "Error: .env file not found in root directory and DATABASE_URL environment variable is not set"
    exit 1
  fi
  
  # Load DATABASE_URL from .env file
  export $(grep -v '^#' "$ROOT_DIR/.env" | grep DATABASE_URL | xargs)
  
  # Check if DATABASE_URL is set after loading from .env
  if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env file"
    exit 1
  fi
fi

# Get migration command (default to deploy)
MIGRATE_CMD="${1:-deploy}"

# Validate command
if [ "$MIGRATE_CMD" != "dev" ] && [ "$MIGRATE_CMD" != "deploy" ]; then
  echo "Error: Invalid migration command. Use 'dev' or 'deploy'"
  exit 1
fi

# Change to prisma package directory
cd "$ROOT_DIR/packages/prisma"

# Run the migration
echo "Running Prisma migration: $MIGRATE_CMD"
pnpm prisma migrate $MIGRATE_CMD

