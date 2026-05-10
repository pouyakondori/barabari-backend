/**
 * Add enhanced geographic data fields: coordinates.zoom, totalArea,
 * landlocked, borders, naturalResources.
 *
 * Also seeds real geographic data for Portugal and Germany.
 */
module.exports = {
  async up(db) {
    // Set defaults for all existing countries
    await db.collection("countries").updateMany(
      { totalArea: { $exists: false } },
      {
        $set: {
          totalArea: null,
          landlocked: false,
          borders: [],
          naturalResources: [],
        },
      }
    );

    // Add zoom to coordinates for all countries that lack it
    await db.collection("countries").updateMany(
      { "coordinates.zoom": { $exists: false } },
      { $set: { "coordinates.zoom": 5 } }
    );

    // Seed Portugal geographic data
    await db.collection("countries").updateOne(
      { slug: "portugal" },
      {
        $set: {
          "coordinates.zoom": 6,
          totalArea: 92212,
          landlocked: false,
          borders: ["spain"],
          naturalResources: ["Cork", "Lithium", "Tungsten", "Tin", "Fish"],
        },
      }
    );

    // Seed Germany geographic data
    await db.collection("countries").updateOne(
      { slug: "germany" },
      {
        $set: {
          "coordinates.zoom": 5,
          totalArea: 357022,
          landlocked: false,
          borders: ["denmark", "poland", "czech-republic", "austria", "switzerland", "france", "luxembourg", "belgium", "netherlands"],
          naturalResources: ["Iron Ore", "Coal", "Potash", "Timber", "Natural Gas", "Lignite"],
        },
      }
    );
  },

  async down(db) {
    await db.collection("countries").updateMany(
      {},
      {
        $unset: {
          "coordinates.zoom": "",
          totalArea: "",
          landlocked: "",
          borders: "",
          naturalResources: "",
        },
      }
    );
  },
};
