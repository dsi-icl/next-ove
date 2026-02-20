# CLI Reference

### Table of Contents

1. [Overview](#overview)
2. [Analysis](#analyse)
3. [Database](#db)
4. [Development](#dev)
5. [Documentation](#docs)
6. [Files](#files)
7. [Lighthouse](#lighthouse)
8. [Security](#security)
9. [Testing](#testing)

<a id="overview"></a>
## CLI Architecture & Shared Utilities

All tools in the `next-ove` CLI follow a consistent architecture and share the same utilities. This ensures:

- Strong type safety
- Predictable command structure
- Safe process execution
- Consistent help output
- Easier extension and maintenance

This section describes the shared approach used across all CLI modules.

---

# Architectural Principles

Every CLI module:

1. Uses `commander` for command routing and help output
2. Uses `zod` for runtime validation and inferred TypeScript types
3. Uses a shared `run()` wrapper built on `execa`
4. Supports global options (e.g. `--dry-run`)
5. Separates:
  - CLI wiring
  - Schema validation
  - Command implementation logic
  - Shared filesystem/process utilities

This creates a scalable and predictable CLI system.

---

# Command Structure Pattern

Each CLI tool follows this structure:

```
cli/
  <tool>.ts
  utils/
    exec.ts
    paths.ts
    schema.ts
```

Within each tool:

1. Define a `Command` instance
2. Define Zod schemas for each subcommand
3. Infer TypeScript types from schemas
4. Parse and validate options inside `.action()`
5. Delegate to a typed implementation function
6. Execute commands using the shared `run()` utility

---

## Example Pattern

```ts
program
  .command("example")
  .description("Run example task")
  .option("--flag")
  .action(async (opts, cmd) => {
    const parsed = exampleSchema.parse({
      ...opts,
      dryRun: cmd.parent?.opts().dryRun,
    });

    await example(parsed);
  });
```

Implementation:

```ts
async function example(args: ExampleArgs): Promise<void> {
  await run("tool", ["--flag"], {
    dryRun: args.dryRun,
  });
}
```

This pattern is used consistently across all CLI tools.

---

# Shared Utilities

## 1. `run()` — Safe Process Execution

Location:
```
utils/exec.ts
```

Built on `execa`.

### Purpose

- Executes external processes safely
- Avoids shell string concatenation
- Prevents command injection
- Streams stdout/stderr
- Supports `--dry-run`

### Usage

```ts
await run("pnpx", ["jest", "--coverage"], {
  dryRun: args.dryRun,
});
```

### Why Not `execSync`?

`execa` provides:

- Better cross-platform behavior
- Structured argument passing
- Proper async handling
- Improved error reporting

---

## 2. `resolveOutputPath()` — Path Resolution

Location:
```
utils/paths.ts
```

### Purpose

Normalizes user-provided or default output paths.

Handles:

- Absolute paths
- Relative paths
- `~` home directory expansion
- Project-root-relative paths

### Usage

```ts
const outDir = resolveOutputPath(
  args.outDir,
  "out/analysis/bundle",
);
```

This guarantees consistent path resolution across all CLI tools.

---

## 3. Global Options Pattern

All commands support shared global options (e.g., `--dry-run`).

Defined at the program root:

```ts
program.option("--dry-run", "Print commands without executing");
```

Passed into subcommands via:

```ts
cmd.parent?.opts().dryRun
```

Validated with Zod:

```ts
const schema = z.object({
  dryRun: z.boolean().optional(),
});
```

This ensures:

- Global flags are consistent
- All commands behave predictably
- Type safety is preserved

---

# Validation Strategy (Zod)

Each command defines a Zod schema:

```ts
const exampleSchema = z.object({
  option: z.string().optional(),
  dryRun: z.boolean().optional(),
});
```

Then infers types:

```ts
type ExampleArgs = z.infer<typeof exampleSchema>;
```

Why validate after Commander?

- Commander parses shape
- Zod enforces types
- Zod allows coercion and refinement
- Errors are explicit and structured

This gives both good UX and strong runtime guarantees.

---

# Help & UX Consistency

Commander provides:

- Automatic `--help`
- Per-command help
- Validation errors with usage output
- Structured CLI documentation

All tools:

- Define `.description()`
- Use `.showHelpAfterError()`
- Keep command names explicit and scoped

This keeps the entire CLI predictable.

---

# Separation of Concerns

Each tool separates:

### CLI Wiring
Commander setup and option registration.

### Validation
Zod schemas define input contracts.

### Implementation
Pure async functions that:
- Accept typed arguments
- Call shared utilities
- Contain no CLI-specific logic

This makes commands:

- Easier to test
- Easier to refactor
- Easier to extend
- Safer to reuse

---

# Adding a New CLI Tool

To create a new CLI module:

1. Create `<tool>.ts`
2. Instantiate `Command`
3. Define subcommands
4. Create Zod schemas
5. Implement typed async functions
6. Use shared `run()` and path utilities

No custom argument parsing.
No shell string composition.
No manual help formatting.

---

# Design Goals

The shared CLI system is designed to be:

- Type-safe
- Composable
- Testable
- CI-friendly
- Cross-platform
- Secure
- Predictable

Every tool in the CLI follows the same conventions to ensure long-term maintainability as the system grows.

---

<a id="analyse"></a>
## `analyse`

Analyse provides insight into the health, size, compatibility, and type safety
of the next‑ove system. It includes tooling for bundle inspection, dependency
auditing, CSS compatibility checks, and TypeScript coverage reporting.

### Overview

This command group helps you:

- Inspect and visualise UI bundle size
- Audit dependencies for security and deprecations
- Analyse CSS browser compatibility
- Measure TypeScript type coverage

---

## Usage

```bash
npm run analyse -- <command> [options]
```

Or if exposed directly:

```bash
next-ove analyse <command> [options]
```

Global options:

```bash
--dry-run     Print commands without executing them
--help        Show help
```

---

# Commands

---

## `bundle`

Analyse the web bundle of UI components using a visualizer.

```bash
npm run analyse -- bundle [options]
```

### Options

```bash
--component <core|bridge|client>
--open
--out-dir <path>
```

### Behaviour

- Runs `vite-bundle-visualizer` for the selected component
- Generates an HTML report
- Optionally opens the report in your browser

### Defaults

- `component`: `core`
- `out-dir`: `out/analysis/bundle`
- Output file: `<component>.html`

### Examples

Generate a bundle report:

```bash
npm run analyse -- bundle
```

Analyse the client bundle and open the report:

```bash
npm run analyse -- bundle --component client --open
```

Specify a custom output directory:

```bash
npm run analyse -- bundle --out-dir ./reports/bundle
```

---

## `packages`

Audit and inspect project dependencies.

```bash
npm run analyse -- packages [options]
```

### Options

```bash
--out-dir <path>
```

### Behaviour

Runs:

- `npm audit`
- `sandworm-audit`
- Dependency tree inspection

Outputs reports for:

- Security vulnerabilities
- Dependency structure
- Potential risks

### Default output directory

```
out/analysis/packages
```

### Example

```bash
npm run analyse -- packages
```

---

## `css`

Analyse CSS browser compatibility.

```bash
npm run analyse -- css [options]
```

### Options

```bash
--out-dir <path>
```

### Behaviour

- Runs the internal `doiuse` compatibility analysis
- Produces browser usage / compatibility data

### Default output directory

```
out/analysis/css
```

### Example

```bash
npm run analyse -- css
```

---

## `coverage`

Measure TypeScript type coverage across the codebase.

```bash
npm run analyse -- coverage [options]
```

### Options

```bash
--out-dir <path>
```

### Behaviour

- Runs `typescript-coverage-report`
- Generates a coverage report for type safety

### Default output directory

```
out/coverage/types
```

### Example

```bash
npm run analyse -- coverage
```

---

## Dry Run Mode

All commands support:

```bash
--dry-run
```

This prints the underlying commands without executing them. Useful for:

- CI debugging
- Verifying command behaviour
- Understanding what will run before execution

Example:

```bash
npm run analyse -- bundle --dry-run
```

---

## Output Structure

Unless overridden with `--out-dir`, all reports are written under:

```
out/
  analysis/
    bundle/
    packages/
    css/
  coverage/
    types/
```

---

## When to Use Analyse

Use this tool when you want to:

- Investigate increasing bundle size
- Audit dependency risks before release
- Validate browser compatibility
- Track improvements in type coverage
- Run pre‑release system health checks

---

<a id="db"></a>
## `db` — Database Management

The `db` command provides a typed interface for managing the next-ove database
via Prisma. It wraps common schema and operational tasks in a consistent CLI
surface.

This tool is responsible for:

- Generating Prisma client types
- Synchronising schema changes
- Managing database users and services
- Opening Prisma Studio

All commands support the global flag:

```
--dry-run
```

When enabled, commands are printed but not executed.

---

## Usage

```
npm run db <command> [options]
```

For command-specific help:

```
npm run db <command> -- --help
```

---

## Commands

### `sync`

Generate type definitions from the Prisma schema.

```
npm run db sync
```

Equivalent to:

```
pnpm prisma generate --schema tools/db/schema.prisma
```

Use this after modifying the schema to regenerate the Prisma client.

---

### `push`

Push local schema changes to the database.

```
npm run db push
```

Equivalent to:

```
pnpm prisma db push --schema tools/db/schema.prisma
```

This updates the database structure to match the local schema.

---

### `pull`

Pull schema changes from the database into the local schema file.

```
npm run db pull
```

Equivalent to:

```
pnpm prisma db pull --schema tools/db/schema.prisma
```

Use this if the database schema was modified externally.

---

### `show`

Open Prisma Studio in the browser.

```
npm run db show
```

Equivalent to:

```
pnpm prisma studio --schema tools/db/schema.prisma
```

Provides a visual interface for exploring and editing data.

---

### `user add`

Add a database user.

```
npm run db user add
```

Runs:

```
tools/db/add-user.ts
```

The script handles user creation logic and any required prompts.

---

### `service add`

Add a database service account.

```
npm run db service add
```

Runs:

```
tools/db/add-service.ts
```

This is intended for provisioning internal service identities.

---

## Examples

Generate client after schema update:

```
npm run db sync
```

Push schema changes without executing (preview only):

```
npm run db push -- --dry-run
```

Open database viewer:

```
npm run db show
```

Add a new service account:

```
npm run db service add
```

---

## Notes

- All commands operate on:

  ```
  tools/db/schema.prisma
  ```

- This tool does not manage migrations. Schema changes are applied directly via
  `prisma db push`.
- Scripts under `tools/db/` encapsulate operational logic for users and
  services.
- Use `--dry-run` when running in CI or before executing destructive operations.

---

If database workflows expand (e.g. migrations, seeding, environment targeting),
this command should be extended rather than introducing ad-hoc scripts.

---

<a id="dev"></a>
## `dev` — Development Tools

The `dev` command provides development utilities for working on the **next-ove** system locally. It includes service orchestration, patch management, internal tooling, and component mocking.

This tool is intended for contributors and maintainers working on the platform.

---

## Usage

```bash
npm run dev -- <command> [options]
```

Or, if exposed directly:

```bash
next-ove dev <command>
```

Get help at any time:

```bash
npm run dev -- --help
npm run dev -- <command> --help
```

---

# Commands

---

## `services`

Manage local support services used during development.

```bash
npm run dev -- services <action>
```

### Actions

- `start` — Start services via Docker Compose
- `stop` — Stop and remove services
- `populate` — Populate services with initial data

### Examples

Start local services:

```bash
npm run dev -- services start
```

Stop services:

```bash
npm run dev -- services stop
```

Populate seeded data:

```bash
npm run dev -- services populate
```

---

## `patch`

Apply development patches to internal or third-party tooling.

```bash
npm run dev -- patch [name] [options]
```

If no patch name is provided, all patches are applied.

### Available Patches

- `sandworm-timeout`
- `nx-electron-commonjs`
- `dockerfile-package-versions`

### Options

- `--timeout <ms>` — Override timeout (used by `sandworm-timeout`)

### Examples

Apply all patches:

```bash
npm run dev -- patch
```

Apply a specific patch:

```bash
npm run dev -- patch sandworm-timeout
```

Override timeout:

```bash
npm run dev -- patch sandworm-timeout --timeout 60000
```

---

## `tools`

Run internal development utilities.

```bash
npm run dev -- tools <name>
```

### Available Tools

- `sign-in` — Generate an authentication token
- `screen-control` — Control MDC screen sessions
- `generate-geometry` — Generate geometry fixtures
- `generate-system-info` — Generate system info for testing

### Example

```bash
npm run dev -- tools sign-in
```

---

## `mock`

Run component mocks for integration and development testing.

```bash
npm run dev -- mock <component> [extraArguments]
```

### Available Components

- `bridge`
- `logging`

### Examples

Run bridge mock:

```bash
npm run dev -- mock bridge
```

Pass additional arguments:

```bash
npm run dev -- mock bridge --port 4001
```

---

# Global Options

### `--dry-run`

Print commands without executing them.

```bash
npm run dev -- services start --dry-run
```

Useful for debugging or CI validation.

---

# When to Use `dev`

Use this command when:

- Running the local development stack
- Applying required patches after dependency changes
- Generating internal development artifacts
- Mocking system components for integration testing

This tool is designed for development workflows only and should not be used in production environments.

---

<a id="docs"></a>
## `docs` — Documentation Generator

The `docs` tool generates and assembles documentation for the **next-ove system
**, including:

- API documentation (OpenAPI generation)
- Source code documentation (JSDoc)
- Type documentation (TypeDoc)
- Aggregated documentation builds for distribution

This command is responsible for producing documentation artifacts and compiling
them into the `docs/` directory for publishing or local inspection.

---

## Usage

```bash
pnpm run docs <command> [options]
```

---

# Commands

## `api`

Generate API documentation for the core and client applications.

```bash
pnpm run docs api [options]
```

### Options

| Option                   | Description                                         |
|--------------------------|-----------------------------------------------------|
| `--out-dir <path>`       | Output directory (default: `out/documentation/api`) |
| `--core-config <path>`   | Core API config file (default: `api-config.json`)   |
| `--client-config <path>` | Client API config file                              |

### What it does

- Runs the OpenAPI generation scripts for:
    - `apps/ove-core`
    - `apps/ove-client`
- Outputs generated API documentation into the configured directory.

---

## `code`

Generate documentation for the codebase using **JSDoc**.

```bash
pnpm run docs code [options]
```

### Options

| Option             | Description                                           |
|--------------------|-------------------------------------------------------|
| `--input <path>`   | Input directory (default: project root)               |
| `--config <path>`  | JSDoc config file (default: `tools/jsdoc/jsdoc.json`) |
| `--out-dir <path>` | Output directory (default: `out/documentation/code`)  |

### What it does

- Runs `jsdoc`
- Uses the configured JSDoc configuration
- Outputs HTML documentation

---

## `types`

Generate documentation for TypeScript types using **TypeDoc**.

```bash
pnpm run docs types [options]
```

### Options

| Option               | Description                                            |
|----------------------|--------------------------------------------------------|
| `--config <path>`    | TypeDoc config (default: `tools/typedoc/typedoc.json`) |
| `--ts-config <path>` | TypeScript config (default: `tsconfig.json`)           |
| `--out-dir <path>`   | Output directory (default: `out/documentation/types`)  |

### What it does

- Runs `typedoc`
- Uses the provided TypeDoc + TS config
- Outputs generated type documentation

---

## `build`

Compile generated documentation into the `docs/` directory.

```bash
pnpm run docs build [options]
```

This command gathers previously generated documentation and copies it into the
`docs/` directory for distribution.

### Options

| Option                  | Description                             |
|-------------------------|-----------------------------------------|
| `--component <name>`    | Build only a specific component         |
| `--base-path <path>`    | Base path used in feature documentation |
| `--code-dir <path>`     | Override code documentation location    |
| `--types-dir <path>`    | Override type documentation location    |
| `--api-dir <path>`      | Override API documentation location     |
| `--coverage-dir <path>` | Override coverage location              |
| `--css-dir <path>`      | Override CSS analysis location          |
| `--bundle-dir <path>`   | Override bundle analysis location       |
| `--package-dir <path>`  | Override package analysis location      |

### Supported Components

- `code`
- `types`
- `apis`
- `coverage`
- `css`
- `bundles`
- `packages`
- `features`
- `specs`

If no component is specified, all available documentation artifacts are
compiled.

---

# Feature Documentation

When building `features`, the tool:

- Converts Markdown files in `docs/features/*.md`
- Uses `pandoc` (if installed)
- Applies a shared HTML template
- Outputs formatted feature pages into `docs/features/public`

If `pandoc` is not installed, feature documentation will not be formatted.

---

# Output Structure

Generated artifacts are placed in:

```
out/
  documentation/
    api/
    code/
    types/
  coverage/
  analysis/
```

The `build` command copies relevant artifacts into:

```
docs/
```

This directory is intended for distribution, publishing, or static hosting.

---

# Dry Run

All commands support:

```bash
--dry-run
```

This prints the commands that would be executed without running them.

Example:

```bash
pnpm run docs api --dry-run
```

---

# Typical Workflow

Generate documentation:

```bash
pnpm run docs api
pnpm run docs code
pnpm run docs types
```

Build compiled documentation:

```bash
pnpm run docs build
```

---

# Requirements

Depending on the command used:

- `jsdoc`
- `typedoc`
- `pandoc` (for formatted feature documentation)
- `tsx`
- ```Node.js```

Ensure these are available in your environment (locally or via `pnpx`).

---

<a id="files"></a>
## `files` — Asset File Management

The `files` command group is responsible for managing asset files in the next-ove system.

It provides a simple interface for interacting with the asset store via internal tooling.

---

### Overview

This tool wraps internal file management scripts and exposes them through the CLI with:

- Strong argument validation
- Consistent help output
- Safe process execution
- Support for dry runs

It is intended for maintainers and CI workflows that need to upload or manage system assets.

---

## Commands

### `upload`

Upload a file to the asset store.

```bash
npm run files upload
```

#### What It Does

This command executes the internal upload script located at:

```
tools/files/upload.js
```

It handles:

- Authenticating with the asset store
- Uploading the file
- Reporting status/output

Any interactive prompts or additional logic are handled by the underlying script.

---

## Global Options

### `--dry-run`

Prints the command that would be executed without running it.

```bash
npm run files upload -- --dry-run
```

This is useful for:

- Debugging
- CI verification
- Understanding what the CLI will execute

---

## Help

Display help:

```bash
npm run files -- --help
```

Display help for a specific command:

```bash
npm run files upload -- --help
```

---

## Typical Usage

Upload a new asset:

```bash
npm run files upload
```

Verify what would run without executing:

```bash
npm run files upload -- --dry-run
```

---

## Notes

- This command delegates execution to the internal upload script.
- Any configuration, credentials, or environment requirements are determined by that script.
- Errors from the upload process are surfaced directly in the terminal.

---

This command group is focused solely on asset file management within the next-ove system.

---

<a id="lighthouse"></a>
## `lighthouse`

Generate, inspect and manage Lighthouse CI reports for the **next-ove** UIs.

This command wraps `lhci` and project-specific configuration to provide a
consistent interface for auditing components locally and running a persistent
Lighthouse server.

---

### Overview

The `lighthouse` tool supports three workflows:

- **`audit`** – Generate Lighthouse reports for UI components
- **`wizard`** – Run the Lighthouse CI setup wizard
- **`server`** – Start a Lighthouse CI server with configurable storage

All commands support a global:

- `--dry-run` – Print the commands that would be executed without running them

---

## Usage

```bash
npm run lighthouse -- <command> [options]
```

Or, if exposed directly:

```bash
next-ove lighthouse <command> [options]
```

---

# Commands

---

## `audit`

Generate Lighthouse scores using the project’s Lighthouse CI configuration.

```bash
npm run lighthouse -- audit [options]
```

### Options

| Option | Description | Default |
|--------|-------------|----------|
| `--config <path>` | Path to Lighthouse config file | `tools/lighthouseci/config.json` |
| `--out-dir <path>` | Output directory for reports | `out/lighthouse` |
| `--dry-run` | Print commands without executing | `false` |

### Example

```bash
npm run lighthouse -- audit
```

Custom config:

```bash
npm run lighthouse -- audit --config ./custom-config.json
```

Dry run:

```bash
npm run lighthouse -- audit --dry-run
```

---

## `wizard`

Run the Lighthouse CI setup wizard.

Useful when initially configuring Lighthouse CI for a project.

```bash
npm run lighthouse -- wizard
```

### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Print command without executing |

### Example

```bash
npm run lighthouse -- wizard
```

---

## `server`

Start a Lighthouse CI server.

This allows storing, comparing, and reviewing Lighthouse results over time.

```bash
npm run lighthouse -- server [options]
```

### Options

| Option | Description | Default |
|--------|-------------|----------|
| `--config <path>` | Path to `lighthouserc.json` | `tools/lighthouseci/lighthouserc.json` |
| `--port <number>` | Server port | `9002` |
| `--storage-method <method>` | Storage backend | `sql` |
| `--sql-dialect <dialect>` | SQL dialect | `sqlite` |
| `--sql-database-path <path>` | Path to database file | `tools/lighthouseci/db.sql` |
| `--dry-run` | Print commands without executing | `false` |

### Example

Start with defaults:

```bash
npm run lighthouse -- server
```

Custom port and database:

```bash
npm run lighthouse -- server \
  --port 9100 \
  --sql-database-path ./lighthouse.db
```

---

# Output

By default:

- Reports are written to:  
  `out/lighthouse`
- The Lighthouse CI server runs on:  
  `http://localhost:9002`

---

# Notes

- The tool relies on `lhci` (Lighthouse CI).
- Paths may be absolute, relative, or use `~` for the home directory.
- `--dry-run` is useful for CI debugging and validating configuration.
- Configuration files live under `tools/lighthouseci/` unless overridden.

---

For help at any time:

```bash
npm run lighthouse -- --help
npm run lighthouse -- audit --help
```

---

<a id="security"></a>
## `security`

Security tooling for the **next-ove** system.

This module provides focused commands for dependency integrity and vulnerability detection. It wraps internal tooling in a consistent CLI interface and supports safe execution via `--dry-run`.

---

### Overview

The `security` command exposes the following subcommands:

| Command | Description |
|----------|-------------|
| `lock-versions` | Lock dependency versions to those currently installed |
| `check-compromised` | Check for known vulnerabilities in dependencies |

All commands support:

```
--dry-run
```

Prints the commands that would be executed without running them.

---

## Usage

If running via npm script:

```bash
npm run security -- <command> [options]
```

If invoked directly:

```bash
security <command> [options]
```

---

## Commands

### `lock-versions`

Locks dependency versions to the currently installed versions.

This ensures:
- Deterministic installs
- Reproducible CI builds
- Reduced risk of accidental minor/patch drift
- Safer dependency review processes

#### Usage

```bash
npm run security -- lock-versions
```

Dry run:

```bash
npm run security -- lock-versions --dry-run
```

---

### `check-compromised`

Runs security checks against project dependencies.

This command checks for:
- Known vulnerabilities
- Compromised packages
- Supply-chain risks (via internal tooling)

#### Usage

```bash
npm run security -- check-compromised
```

Dry run:

```bash
npm run security -- check-compromised --dry-run
```

---

## Help

Get help for the module:

```bash
npm run security -- --help
```

Get help for a specific command:

```bash
npm run security -- lock-versions --help
```

---

## Exit Codes

The CLI will exit with:

- `0` on success
- Non-zero if the underlying security tooling fails

This makes it suitable for CI pipelines.

---

## Intended Use

This tool is designed to:

- Be run locally before releases
- Be integrated into CI pipelines
- Enforce dependency hygiene across the next-ove system
- Provide a simple interface over internal security scripts

---

If you need details on shared CLI patterns, architecture, or extending the CLI with additional modules, see the main CLI documentation section.

---

<a id="testing"></a>
## `test` — Run Unit & Integration Tests

The `test` command runs unit and integration tests across the **next-ove system** using the project’s existing test infrastructure.

This tool provides a consistent CLI interface with optional dry-run support for CI debugging and local inspection.

---

### Overview

The `test` command exposes two subcommands:

- `unit` — Run unit tests across the workspace
- `integration` — Run integration tests using the dedicated Jest configuration

All commands support the global `--dry-run` flag.

---

## Usage

```bash
pnpm run test -- <command> [options]
```

Or, if exposed directly:

```bash
next-ove test <command> [options]
```

---

## Commands

### `unit`

Run all unit tests with coverage enabled.

```bash
pnpm run test -- unit
```

This executes:

```bash
pnx run-many --target=test -- --coverage
```

#### Options

| Option      | Description                              |
|-------------|------------------------------------------|
| `--dry-run` | Print the command without executing it   |

#### Example

```bash
pnpm run test -- unit --dry-run
```

Output:

```text
$ pnx run-many --target=test -- --coverage
```

---

### `integration`

Run integration tests using the dedicated Jest configuration.

```bash
pnpm run test -- integration
```

This executes:

```bash
pnpx jest --coverage --config jest.integration.config.ts
```

#### Options

| Option      | Description                              |
|-------------|------------------------------------------|
| `--dry-run` | Print the command without executing it   |

#### Example

```bash
pnpm run test -- integration --dry-run
```

Output:

```text
$ pnpx jest --coverage --config jest.integration.config.ts
```

---

## Coverage

Both `unit` and `integration` commands run with coverage enabled by default.

Coverage output is handled by:
- Nx configuration (for unit tests)
- `jest.integration.config.ts` (for integration tests)

Refer to those configurations for coverage directory details and thresholds.

---

## CI Usage

This tool is CI-safe and can be used directly in pipelines:

```bash
pnpm run test -- unit
pnpm run test -- integration
```

To validate commands without executing:

```bash
pnpm run test -- unit --dry-run
```

---

## Error Handling

- Command failures exit with a non-zero status code.
- Errors are streamed directly from the underlying test runner.
- Invalid commands automatically show help output.

---

## When to Use

Use:

- `unit` during feature development and pull requests
- `integration` for cross-boundary or system-level validation
- both in CI to ensure full system integrity

---

This command focuses solely on running tests.  
Other CLI tools (analysis, coverage inspection, etc.) are documented separately.

---