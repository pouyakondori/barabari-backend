# AGENT.md — Barabari Backend

## Project Description

Barabari Backend is a GraphQL API server for a constitutional analysis and comparison platform. It enables users to explore, compare, and discuss constitutions from around the world with a focus on the Iranian Constitution.

## Quick Start

```bash
npm install
cp .env.example .env    # Configure MongoDB URI, JWT secrets, etc.
npm run dev             # Start dev server at http://localhost:4000
```

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Redis (for caching features)

## Key Technologies

- Apollo Server 5 + TypeGraphQL 2 (code-first GraphQL)
- MongoDB + Mongoose 9
- TypeScript (CommonJS, decorators enabled)
- JWT authentication (access + refresh tokens)
- class-validator for input validation

## Project Structure

- `src/models/` — Mongoose models (schema definitions)
- `src/graphql/types/` — TypeGraphQL ObjectType classes
- `src/graphql/inputs/` — TypeGraphQL InputType classes
- `src/graphql/resolvers/` — GraphQL resolvers
- `src/graphql/middleware/` — Auth checker, middleware
- `src/services/` — Business logic layer
- `src/config/` — Environment, database, auth config
- `src/migrations/` — Database migrations (migrate-mongo)
- `src/seed/` — Database seeder scripts

## Important Rules

1. **Never push or commit code.** Agents must never run `git commit`, `git push`, or any command that creates commits or pushes to a remote. Leave all version control operations to the developer.
2. **Never make changes directly on the database.** Always use migrations (`npm run migrate:create`, `npm run migrate:up`).
3. Use `@/*` path aliases for all imports (maps to `src/*`).
4. Follow existing model pattern: `I<Name>` interface → `<Name>Schema` → `mongoose.model()` export.
5. Register new resolvers in `src/index.ts`.
6. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
7. All user-facing text uses bilingual `{ fa, en }` format.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run seed` | Seed database |
| `npm run migrate:up` | Run pending migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Check migration status |
| `npm run migrate:create <name>` | Create new migration |

## Testing

Run `npm run test` (Vitest). No test files exist yet — tests should be added alongside new features.

## Environment Variables

Key variables needed in `.env`:
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — JWT signing secrets
- `CORS_ORIGIN` — Allowed CORS origin (default: `http://localhost:3000`)
- `PORT` — Server port (default: `4000`)
