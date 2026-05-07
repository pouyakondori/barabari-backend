import "reflect-metadata";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { authChecker, extractUserFromToken, Context } from "./graphql/middleware/authChecker";

import { AuthResolver } from "./graphql/resolvers/AuthResolver";
import { CountryResolver } from "./graphql/resolvers/CountryResolver";
import { ConstitutionResolver } from "./graphql/resolvers/ConstitutionResolver";
import { VoteResolver } from "./graphql/resolvers/VoteResolver";
import { CommentResolver } from "./graphql/resolvers/CommentResolver";
import { TopicResolver } from "./graphql/resolvers/TopicResolver";
import { TimelineResolver } from "./graphql/resolvers/TimelineResolver";
import { StatsResolver } from "./graphql/resolvers/StatsResolver";
import { AdminUserResolver } from "./graphql/resolvers/AdminUserResolver";

async function bootstrap() {
  // Connect to MongoDB
  await connectDatabase();

  // Build TypeGraphQL schema
  const schema = await buildSchema({
    resolvers: [
      AuthResolver,
      CountryResolver,
      ConstitutionResolver,
      VoteResolver,
      CommentResolver,
      TopicResolver,
      TimelineResolver,
      StatsResolver,
      AdminUserResolver,
    ],
    authChecker,
    validate: true,
  });

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    schema,
    introspection: true,
  });

  // Start standalone server with auth context
  const { url } = await startStandaloneServer(server, {
    listen: { port: env.PORT },
    context: async ({ req }: { req: http.IncomingMessage }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      return extractUserFromToken(authHeader);
    },
  });

  console.log(`\n🚀 Barabari Backend running!`);
  console.log(`   GraphQL Playground: ${url}`);
  console.log(`   Open the URL above in your browser to access Apollo Sandbox\n`);
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
