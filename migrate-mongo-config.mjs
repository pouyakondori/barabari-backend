import dotenv from "dotenv";
dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27018/barabari",
  },

  // The migrations dir (relative to project root)
  migrationsDir: "src/migrations",

  // The mongodb collection where the applied changes are stored
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determine
  // if the file should be run
  useFileHash: false,

  // Don't change this, unless you know what you're doing
  moduleSystem: "commonjs",
};

export default config;
