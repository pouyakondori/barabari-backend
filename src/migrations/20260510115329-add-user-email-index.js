/**
 * Ensure the email index exists on the users collection.
 * This is a sample migration demonstrating the migration pattern.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
  await db
    .collection("users")
    .createIndex({ email: 1 }, { unique: true, name: "email_unique" });
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
  await db.collection("users").dropIndex("email_unique");
};
