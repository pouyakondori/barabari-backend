/**
 * Add enhanced country overview fields: systemOfGovernment, hdi,
 * independenceDate, officialLanguages, gdp, economicType,
 * religiousComposition, urbanizationRate, corruptionIndex.
 *
 * Also seeds real data for Portugal and Germany.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
module.exports = {
  async up(db, client) {
  // Set default values for all existing countries
  await db.collection("countries").updateMany(
    { systemOfGovernment: { $exists: false } },
    {
      $set: {
        systemOfGovernment: null,
        hdi: null,
        independenceDate: null,
        officialLanguages: [],
        gdp: null,
        economicType: null,
        religiousComposition: [],
        urbanizationRate: null,
        corruptionIndex: null,
      },
    }
  );

  // Seed Portugal data
  await db.collection("countries").updateOne(
    { slug: "portugal" },
    {
      $set: {
        systemOfGovernment: "Semi-Presidential Republic",
        hdi: 0.874,
        independenceDate: "1143-10-05",
        officialLanguages: ["Portuguese"],
        gdp: "$287.1 billion",
        economicType: "High-Income Economy",
        religiousComposition: [
          { religion: "Christianity", percentage: 80.2 },
          { religion: "No Religion", percentage: 16.7 },
          { religion: "Other", percentage: 3.1 },
        ],
        urbanizationRate: 67.4,
        corruptionIndex: 61,
      },
    }
  );

  // Seed Germany data
  await db.collection("countries").updateOne(
    { slug: "germany" },
    {
      $set: {
        systemOfGovernment: "Federal Parliamentary Republic",
        hdi: 0.95,
        independenceDate: "1871-01-18",
        officialLanguages: ["German"],
        gdp: "$4.46 trillion",
        economicType: "High-Income Economy",
        religiousComposition: [
          { religion: "Christianity", percentage: 52.7 },
          { religion: "No Religion", percentage: 42.0 },
          { religion: "Islam", percentage: 3.5 },
          { religion: "Other", percentage: 1.8 },
        ],
        urbanizationRate: 77.5,
        corruptionIndex: 78,
      },
    }
  );
  },

  async down(db, client) {
    await db.collection("countries").updateMany(
      {},
      {
        $unset: {
          systemOfGovernment: "",
          hdi: "",
          independenceDate: "",
          officialLanguages: "",
          gdp: "",
          economicType: "",
          religiousComposition: "",
          urbanizationRate: "",
          corruptionIndex: "",
        },
      }
    );
  },
};
