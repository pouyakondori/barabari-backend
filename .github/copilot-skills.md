# Copilot Skills — Barabari Backend

## Skill: Create Mongoose Model

When asked to create a new Mongoose model:

1. Create a new file in `src/models/` named `<ModelName>.ts`
2. Define an interface `I<ModelName>` extending `Document` with all fields
3. Create a `<ModelName>Schema` using `new Schema<I<ModelName>>()` with `{ timestamps: true }`
4. Add necessary indexes on the schema
5. Export the model: `export const <ModelName> = mongoose.model<I<ModelName>>("<ModelName>", <ModelName>Schema)`
6. For bilingual fields, use the `ILocalizedString { fa: string; en: string }` sub-document pattern

Example pattern:
```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IExample extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ExampleSchema.index({ name: 1 });

export const Example = mongoose.model<IExample>("Example", ExampleSchema);
```

## Skill: Create GraphQL Resolver

When asked to create a new GraphQL resolver:

1. Create an `@ObjectType()` class in `src/graphql/types/<Name>Type.ts`
2. Create `@InputType()` classes in `src/graphql/inputs/<Name>Input.ts` for mutations
3. Create an `@Resolver()` class in `src/graphql/resolvers/<Name>Resolver.ts`
4. Use `@Query()` for read operations and `@Mutation()` for write operations
5. Use `@Authorized()` decorator for protected operations, `@Authorized("admin")` for admin-only
6. Register the resolver in `src/index.ts` `buildSchema({ resolvers: [...] })`
7. Use `class-validator` decorators on input fields for validation

## Skill: Create Database Migration

When asked to make a database change (add field, add index, transform data, etc.):

1. Run `npm run migrate:create <descriptive-name>` to generate a migration file
2. Edit the generated file in `src/migrations/`
3. Implement `up(db, client)` with the forward migration logic using the native MongoDB driver
4. Implement `down(db, client)` with the rollback logic
5. Test locally with `npm run migrate:up`
6. Verify with `npm run migrate:status`

**Never** modify the database directly — always use a migration.

## Skill: Add REST Endpoint

When asked to add a REST endpoint (for file uploads, SSE, webhooks, etc.):

1. Create a route handler in `src/routes/`
2. Use Express Router pattern
3. Mount the route in the main Express app
4. Use `multer` for file uploads, respect `MAX_FILE_SIZE_MB` from env config

## Skill: Add Business Logic

When implementing complex business logic:

1. Create a service class in `src/services/` to encapsulate business rules
2. Keep resolvers thin — they should delegate to services
3. Use the service from the resolver via direct import (no DI container)
