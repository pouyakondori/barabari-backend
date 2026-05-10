/**
 * Ensure the email index exists on the users collection.
 * This is a sample migration demonstrating the migration pattern.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
module.exports = {
  async up(db, client) {
    // Check if index already exists before creating
    const indexes = await db.collection("users").indexes();
    const hasEmailIndex = indexes.some(
      (idx) => idx.key && idx.key.email === 1
    );
    if (!hasEmailIndex) {
      await db
        .collection("users")
        .createIndex({ email: 1 }, { unique: true, name: "email_unique" });
    }
  },

  async down(db, client) {
    const indexes = await db.collection("users").indexes();
    const hasIndex = indexes.some((idx) => idx.name === "email_unique");
    if (hasIndex) {
      await db.collection("users").dropIndex("email_unique");
    }
  },
};
