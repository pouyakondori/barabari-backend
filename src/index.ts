import "reflect-metadata";
import http from "http";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSchema } from "type-graphql";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { authChecker, extractUserFromToken, Context } from "./graphql/middleware/authChecker";
import { ensureBucket, uploadFile, getFileStream } from "./services/storage";

import { AuthResolver } from "./graphql/resolvers/AuthResolver";
import { CountryResolver } from "./graphql/resolvers/CountryResolver";
import { ConstitutionResolver } from "./graphql/resolvers/ConstitutionResolver";
import { VoteResolver } from "./graphql/resolvers/VoteResolver";
import { CommentResolver } from "./graphql/resolvers/CommentResolver";
import { TopicResolver } from "./graphql/resolvers/TopicResolver";
import { TimelineResolver } from "./graphql/resolvers/TimelineResolver";
import { StatsResolver } from "./graphql/resolvers/StatsResolver";
import { AdminUserResolver } from "./graphql/resolvers/AdminUserResolver";
import { AdminCountryResolver } from "./graphql/resolvers/AdminCountryResolver";
import { AdminPodcastResolver } from "./graphql/resolvers/AdminPodcastResolver";

const REST_PORT = env.REST_PORT; // 4001

const upload = multer({
  dest: env.UPLOADS_DIR,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

async function bootstrap() {
  await connectDatabase();

  // Ensure MinIO bucket exists
  try {
    await ensureBucket();
    console.log("✅ MinIO storage ready");
  } catch (err) {
    console.warn("⚠️  MinIO not available — file uploads will fail:", (err as Error).message);
  }

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
      AdminCountryResolver,
      AdminPodcastResolver,
    ],
    authChecker,
    validate: true,
  });

  // ── GraphQL server (Apollo standalone) ──
  const server = new ApolloServer<Context>({
    schema,
    introspection: true,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: env.PORT },
    context: async ({ req }: { req: http.IncomingMessage }): Promise<Context> => {
      const authHeader = req.headers.authorization;
      return extractUserFromToken(authHeader);
    },
  });

  // ── REST server (Express) for file upload/stream ──
  const app = express();

  app.use(cors({
    origin: [env.CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }));

  // File upload endpoint (admin only)
  app.post("/admin/podcasts/upload", (req, res, next) => {
    const ctx = extractUserFromToken(req.headers.authorization);
    if (!ctx.userId || ctx.userRole !== "admin") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  }, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }
      const ext = path.extname(req.file.originalname);
      const objectName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      await uploadFile(objectName, req.file.path, req.file.mimetype);

      // Clean up temp file
      const fs = await import("fs");
      fs.unlink(req.file.path, () => {});

      res.json({
        url: `/podcasts/stream/${objectName}`,
        objectName,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Audio stream endpoint (public)
  app.get("/podcasts/stream/:objectName", async (req, res) => {
    try {
      const { objectName } = req.params;
      const { stream, stat } = await getFileStream(objectName);

      const contentType = (stat.metaData?.["content-type"] as string) || "audio/mpeg";
      const fileSize = stat.size;

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const { getMinioClient } = await import("./services/storage");
        const client = getMinioClient();
        const rangeStream = await client.getPartialObject(
          env.MINIO_BUCKET, objectName, start, chunkSize
        );

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": contentType,
        });
        rangeStream.pipe(res);
        (stream as any).destroy?.();
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
        });
        (stream as NodeJS.ReadableStream).pipe(res);
      }
    } catch (err: any) {
      if (err.code === "NoSuchKey" || err.code === "NotFound") {
        res.status(404).json({ error: "File not found" });
      } else {
        console.error("Stream error:", err);
        res.status(500).json({ error: "Stream failed" });
      }
    }
  });

  app.listen(REST_PORT, () => {
    console.log(`\n🚀 Barabari Backend running!`);
    console.log(`   GraphQL:  ${url}`);
    console.log(`   Upload:   http://localhost:${REST_PORT}/admin/podcasts/upload`);
    console.log(`   Stream:   http://localhost:${REST_PORT}/podcasts/stream/:id\n`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
