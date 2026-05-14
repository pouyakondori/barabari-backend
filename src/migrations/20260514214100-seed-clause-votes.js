/**
 * Migration: Add random agree/disagree counts to all clauses.
 *
 * Sets agreeCount to 5–80 and disagreeCount to 2–30 for each clause,
 * using a seeded PRNG for reproducibility.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = {
  async up(db) {
    console.log("👍 Adding random vote counts to clauses...");

    const clauses = await db
      .collection("clauses")
      .find({})
      .project({ _id: 1 })
      .toArray();

    const rng = mulberry32(123);
    const bulk = clauses.map((clause) => ({
      updateOne: {
        filter: { _id: clause._id },
        update: {
          $set: {
            agreeCount: Math.floor(rng() * 76) + 5,    // 5–80
            disagreeCount: Math.floor(rng() * 29) + 2,  // 2–30
          },
        },
      },
    }));

    // Execute in batches of 1000
    for (let i = 0; i < bulk.length; i += 1000) {
      await db.collection("clauses").bulkWrite(bulk.slice(i, i + 1000));
    }

    console.log(`  ✅ Updated ${clauses.length} clauses with random vote counts`);
  },

  async down(db) {
    const result = await db.collection("clauses").updateMany(
      {},
      { $set: { agreeCount: 0, disagreeCount: 0 } }
    );
    console.log(`  🗑️  Reset vote counts on ${result.modifiedCount} clauses`);
  },
};
