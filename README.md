# Barabari Backend

> GraphQL API server powering the Barabari constitutional analysis and comparison platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## About

Barabari is a platform dedicated to empowering citizens through constitutional literacy. It provides deep-dive analysis of the Iranian Constitution, interactive comparisons with constitutions from around the world, and collaborative tools for civic engagement.

This repository contains the **backend API** — a GraphQL server that handles:

- User authentication (JWT with access/refresh tokens)
- Country and constitution data (chapters, articles, clauses)
- Voting system (Agree/Disagree on clauses with denormalized counts)
- Comment system with admin approval workflow (pending → approved → published)
- Topic-based constitutional comparisons and rankings
- Global heatmap data aggregation
- Podcast management
- Constitution sandbox/remix persistence
- AI-powered chat (streaming via SSE)
- Platform statistics (cached in Redis)
- File uploads (images, PDFs, audio stored locally)

## Tech Stack

| Technology | Purpose |
|---|---|
| [Node.js 20](https://nodejs.org/) | Runtime |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Apollo Server 4](https://www.apollographql.com/docs/apollo-server/) | GraphQL server |
| [TypeGraphQL](https://typegraphql.com/) | Code-first GraphQL schema (decorators) |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Database + ODM |
| [Redis](https://redis.io/) + [ioredis](https://github.com/redis/ioredis) | Caching (stats, rankings, heatmaps) |
| [JSON Web Tokens](https://jwt.io/) | Authentication |
| [multer](https://github.com/expressjs/multer) | File upload handling |
| [class-validator](https://github.com/typestack/class-validator) | Input validation |
| [dataloader](https://github.com/graphql/dataloader) | N+1 query prevention |
| [Pino](https://getpino.io/) | Structured logging |

## Related Repositories

| Repository | Description |
|---|---|
| [barabari-frontend](https://github.com/pouyakondori/barabari-frontend) | Public website (Next.js, React, Tailwind) |
| [barabari-backoffice](https://github.com/pouyakondori/barabari-backoffice) | Admin panel (Vite, React, Ant Design) |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/pouyakondori/barabari-backend.git
cd barabari-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Create upload directories
mkdir -p uploads/images uploads/pdfs uploads/audio

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=4000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/barabari
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

OPENAI_API_KEY=your-openai-key

EMAIL_FROM=noreply@barabari.org
RESEND_API_KEY=your-resend-key

CORS_ORIGIN=http://localhost:3000

UPLOADS_DIR=./uploads
MAX_FILE_SIZE_MB=50
```

### Docker

```bash
# Build and run with Docker Compose (app + Redis)
docker compose up -d
```

## Project Structure

```
src/
├── index.ts              # Entry point (Apollo Server bootstrap)
├── config/               # Environment, database, auth config
├── models/               # Mongoose schemas & models
├── graphql/
│   ├── types/            # TypeGraphQL ObjectTypes
│   ├── inputs/           # TypeGraphQL InputTypes
│   ├── resolvers/        # GraphQL resolvers
│   └── middleware/       # Auth checker, rate limiter
├── services/             # Business logic layer
├── routes/               # REST routes (file upload, SSE chat)
├── utils/                # Errors, pagination, file helpers
├── migrations/           # Database migration scripts (migrate-mongo)
└── seed/                 # Database seed scripts & data
uploads/                  # Local file storage (images, PDFs, audio)
```

## GraphQL API

The server exposes a GraphQL endpoint at `/graphql`. Key domains:

| Domain | Queries | Mutations |
|---|---|---|
| Auth | `me` | `register`, `login`, `refreshToken`, `forgotPassword`, `resetPassword` |
| Countries | `countries`, `country`, `searchCountries`, `countryTimeline` | — |
| Constitutions | `constitution`, `clause`, `clausesByTopic`, `relatedClauses` | — |
| Votes | `myVotes` | `castVote`, `removeVote` |
| Comments | `comments` | `createComment`, `updateComment`, `deleteComment` |
| Topics | `topics`, `topic`, `comparisonTable`, `heatmapData`, `topicFacts` | — |
| Podcasts | `podcasts`, `podcast` | — |
| Sandbox | `mySandboxes`, `sandbox` | `createSandbox`, `updateSandbox`, `deleteSandbox` |
| Stats | `platformStats`, `featuredCountries` | — |
| Chat | — | `chat` (+ REST `POST /api/chat` for streaming) |
| Admin | `adminStats`, `adminUsers`, `adminComments`, ... | `adminApproveComment`, `adminCreateCountry`, ... |

## Database Migrations

This project uses [migrate-mongo](https://github.com/seppevs/migrate-mongo) to manage all database schema changes, index modifications, and data transformations.

> **⚠️ Important:** Never make changes directly on the database. Always use migrations.

### Why Migrations?

- **Reproducibility** — Every database change is version-controlled and can be replayed on any environment.
- **Rollback safety** — Each migration includes a `down()` function to undo changes if needed.
- **Team coordination** — Migrations prevent conflicts when multiple developers modify the database.
- **Audit trail** — The `changelog` collection in MongoDB tracks which migrations have been applied and when.

### Migration Commands

| Command | Description |
|---|---|
| `npm run migrate:create <name>` | Create a new migration file in `src/migrations/` |
| `npm run migrate:up` | Run all pending migrations |
| `npm run migrate:down` | Rollback the last applied migration |
| `npm run migrate:status` | Show which migrations have been applied |

### Creating a Migration

```bash
# Create a new migration
npm run migrate:create add-user-avatar-field
```

This generates a timestamped file in `src/migrations/` (e.g., `20260510120000-add-user-avatar-field.js`):

```javascript
export const up = async (db, client) => {
  // Forward migration: apply the change
  await db.collection("users").updateMany(
    { avatar: { $exists: false } },
    { $set: { avatar: null } }
  );
};

export const down = async (db, client) => {
  // Rollback: undo the change
  await db.collection("users").updateMany(
    {},
    { $unset: { avatar: "" } }
  );
};
```

### Migration Best Practices

1. **Always implement both `up()` and `down()`** — rollbacks should fully reverse the `up()` change.
2. **Use descriptive names** — e.g., `add-user-avatar-field`, `create-topics-text-index`, `backfill-clause-vote-counts`.
3. **Keep migrations small and focused** — one logical change per migration.
4. **Use the native MongoDB driver** — migrations receive the raw `db` and `client` objects (not Mongoose). Use `db.collection()` for operations.
5. **Test locally** — run `npm run migrate:up` and `npm run migrate:down` to verify both directions work.
6. **Never edit applied migrations** — if a migration has been run in any environment, create a new migration to fix it.
7. **Run migrations before starting the server** in deployment pipelines.

### Configuration

Migration configuration is in `migrate-mongo-config.mjs`. It reads `MONGODB_URI` from the `.env` file automatically.

- **Migrations directory**: `src/migrations/`
- **Changelog collection**: `changelog` (in MongoDB — tracks applied migrations)
- **File extension**: `.js` (ES module format)

## Key Design Decisions

- **Denormalized vote counts** — `agreeCount`/`disagreeCount` on Clause documents, updated with atomic `$inc`. No aggregation on read.
- **Redis caching** — Platform stats (5-min TTL), comparison rankings (invalidated on vote, debounced 30s), heatmap data (15-min refresh).
- **Comment approval** — All comments start as `pending`. Only admin-approved comments are public. Edits reset to `pending`.
- **Local file storage** — All uploads in `uploads/` directory, served via Express static at `/files/`.
- **DataLoader** — Batches and deduplicates DB queries to prevent N+1 in nested resolvers.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run seed` | Seed database with initial data |
| `npm run migrate:up` | Run pending database migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Check migration status |
| `npm run migrate:create <name>` | Create a new migration file |

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push and open a Pull Request

This project uses **semantic-release** — version bumps and changelogs are automated based on commit messages.

## License

This project is licensed under the [MIT License](./LICENSE).
