# @klorad/dev-audits

A structured audit system for the Klorad monorepo.

## Architecture

The package follows a "profile + manifest + audit runner" architecture:

- **Core Types** (`src/core/types.ts`): Base types for audits, results, and profiles
- **Workspace** (`src/core/workspace.ts`): Monorepo utilities for finding packages and files
- **Audit Runner** (`src/core/audit-runner.ts`): Executes audits for a profile
- **Reporter** (`src/core/reporter.ts`): Console output formatting
- **Klorad Profile** (`src/profiles/klorad/`): Klorad-specific manifest and audits

## Core Audits (Blocking)

These audits run in CI and must pass:

1. **structure** - Package boundaries, dependency graph, module organization
2. **ssr-rsc** - SSR/RSC boundary correctness
3. **env** - Environment variable validation
4. **cesium** - Cesium lifecycle and memory management
5. **api-org** - API organization scoping (multi-tenant boundaries)

## Advisory Audits (Non-blocking)

These audits provide recommendations but don't block CI:

- (To be added: size-complexity, types, dead-exports, forms, bundle, rsc-boundaries)

## Usage

```bash
# Run core (blocking) audits
pnpm audits

# Run advisory (non-blocking) audits
pnpm audits:advisory

# Or directly via the package
pnpm --filter @klorad/dev-audits audits:core
pnpm --filter @klorad/dev-audits audits:advisory
```

## Development

```bash
# Build the package
cd packages/dev-audits
pnpm build

# Run audits locally
pnpm audits:core
```

## Adding New Audits

1. Create audit file in `src/profiles/klorad/audits/` (core) or `advisory/` (advisory)
2. Implement `AuditDefinition` interface
3. Wire it in `src/profiles/klorad/index.ts`

