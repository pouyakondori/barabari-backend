# Copilot Instructions — Barabari Backend

## Project Overview

Barabari Backend is a GraphQL API server powering a constitutional analysis and comparison platform. It uses Apollo Server 5 with TypeGraphQL (code-first, decorator-based) on top of MongoDB via Mongoose.

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript (CommonJS)
- **API**: GraphQL via Apollo Server 5 + TypeGraphQL 2 (decorators)
- **Database**: MongoDB with Mongoose 9 (ODM)
- **Auth**: JWT (access + refresh tokens), bcryptjs
- **Validation**: class-validator (decorators on InputTypes)
- **Build**: `tsc` → `dist/`, dev via `ts-node --swc`
- **Test**: Vitest

## Architecture

```
src/
├── index.ts              # Bootstrap (connectDB → buildSchema → startStandaloneServer)
├── config/               # Environment, database, auth configuration
├── models/               # Mongoose schemas & models
├── graphql/
│   ├── types/            # TypeGraphQL @ObjectType classes
│   ├── inputs/           # TypeGraphQL @InputType classes
│   ├── resolvers/        # GraphQL resolvers
│   └── middleware/       # Auth checker, rate limiter
├── services/             # Business logic layer
├── routes/               # REST routes (file upload, SSE)
├── utils/                # Errors, pagination, file helpers
├── migrations/           # Database migration scripts (migrate-mongo)
└── seed/                 # Database seed scripts & data
```

## Coding Conventions

### Naming
- **PascalCase** for classes, types, interfaces, resolvers (`AuthResolver`, `UserType`, `RegisterInput`)
- **camelCase** for functions, variables, and file names when not a class
- **PascalCase file names** for classes that match the class name (`User.ts`, `AuthResolver.ts`)

### Models
- Define an interface `I<Name>` extending `Document`
- Define a `<Name>Schema` using `new Schema<I<Name>>()`
- Export the model as `mongoose.model<I<Name>>("<Name>", <Name>Schema)`

### GraphQL
- Types go in `graphql/types/` as `@ObjectType()` classes
- Inputs go in `graphql/inputs/` as `@InputType()` classes
- Resolvers go in `graphql/resolvers/` as `@Resolver()` classes
- Use `class-validator` decorators on inputs for validation
- Register new resolvers in `src/index.ts` `buildSchema({ resolvers: [...] })`

### Path Aliases
- `@/*` maps to `src/*` — always use `@/` for imports

### Bilingual Data
- Use `ILocalizedString { fa: string; en: string }` pattern for all user-facing text fields

## Database Rules

> **⚠️ CRITICAL: Never make changes directly on the database and always use migrations for it.**

- All schema changes, index modifications, data transformations, and seed data updates **must** go through the migration system (`migrate-mongo`).
- Never modify the database schema or data by running ad-hoc scripts or manual commands.
- Create a new migration file with `npm run migrate:create <description>` before making any database change.
- Migrations must include both `up()` (apply) and `down()` (rollback) functions.
- Test migrations locally before committing.
- See the [Database Migrations](#) section in the README for detailed usage.

## Code Style

- **Never push or commit code.** Agents must never run `git commit`, `git push`, or any command that creates commits or pushes to a remote. Leave all version control operations to the developer.
- Use `strict: true` TypeScript settings
- `experimentalDecorators` and `emitDecoratorMetadata` are enabled for TypeGraphQL
- Prefer `async/await` over raw promises
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)

## Testing

- Use Vitest for all tests
- Run tests with `npm run test`

## Common Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (Vitest)
npm run seed         # Seed database with initial data
npm run migrate:up   # Run pending migrations
npm run migrate:down # Rollback last migration
npm run migrate:status  # Check migration status
npm run migrate:create <name>  # Create a new migration
```
