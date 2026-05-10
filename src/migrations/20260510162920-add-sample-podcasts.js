module.exports = {
  async up(db) {
    // Find countries
    const portugal = await db.collection("countries").findOne({ slug: "portugal" });
    const germany = await db.collection("countries").findOne({ slug: "germany" });

    const podcasts = [];

    if (portugal) {
      podcasts.push({
        title: {
          fa: "بررسی قانون اساسی پرتغال",
          en: "Portugal Constitution Analysis",
        },
        description: {
          fa: "در این قسمت از پادکست برابری، به بررسی قانون اساسی جمهوری پرتغال و ویژگی‌های منحصر به فرد آن می‌پردازیم.",
          en: "In this episode of Barabari podcast, we analyze the Constitution of the Portuguese Republic and its unique features.",
        },
        audioUrl: "/podcasts/stream/portugal-constitution.m4a",
        countryId: portugal._id,
        duration: 1670,
        publishedAt: new Date("2025-05-01"),
        createdAt: new Date(),
      });
    }

    if (germany) {
      podcasts.push({
        title: {
          fa: "بررسی قانون اساسی آلمان",
          en: "Germany Basic Law Analysis",
        },
        description: {
          fa: "در این قسمت به بررسی قانون اساسی جمهوری فدرال آلمان و اصول بنیادین آن می‌پردازیم.",
          en: "In this episode, we examine the Basic Law of the Federal Republic of Germany and its fundamental principles.",
        },
        audioUrl: "/podcasts/stream/germany-grundgesetz.m4a",
        countryId: germany._id,
        duration: 1440,
        publishedAt: new Date("2025-05-05"),
        createdAt: new Date(),
      });
    }

    if (podcasts.length > 0) {
      await db.collection("podcasts").insertMany(podcasts);
      console.log(`✅ Seeded ${podcasts.length} sample podcasts`);
    }
  },

  async down(db) {
    await db.collection("podcasts").deleteMany({
      audioUrl: {
        $in: [
          "/podcasts/stream/portugal-constitution.m4a",
          "/podcasts/stream/germany-grundgesetz.m4a",
        ],
      },
    });
    console.log("✅ Removed sample podcasts");
  },
};
