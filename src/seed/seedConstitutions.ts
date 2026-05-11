import "reflect-metadata";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { Country } from "../models/Country";
import { Constitution } from "../models/Constitution";
import { Chapter } from "../models/Chapter";
import { Article } from "../models/Article";
import { Clause } from "../models/Clause";
import * as fs from "fs";
import * as path from "path";

interface LocalizedString {
  fa: string;
  en: string;
}

interface ClauseData {
  number: number;
  text: LocalizedString;
  order: number;
  topicSlugs?: string[];
}

interface ArticleData {
  number: number | string;
  title: LocalizedString;
  clauses: ClauseData[];
  order: number;
}

interface ChapterData {
  number: number;
  title: LocalizedString;
  articles: ArticleData[];
  order: number;
}

// Topic slug assignment based on article content keywords
function assignTopicSlugs(text: string): string[] {
  const lowerText = text.toLowerCase();
  const slugs: string[] = [];

  if (
    lowerText.includes("expression") ||
    lowerText.includes("speech") ||
    lowerText.includes("press") ||
    lowerText.includes("opinion") ||
    lowerText.includes("censorship") ||
    lowerText.includes("media") ||
    lowerText.includes("broadcast") ||
    lowerText.includes("information")
  ) {
    slugs.push("freedom-of-speech");
  }

  if (
    lowerText.includes("education") ||
    lowerText.includes("school") ||
    lowerText.includes("teaching") ||
    lowerText.includes("learning") ||
    lowerText.includes("university") ||
    lowerText.includes("instruction")
  ) {
    slugs.push("right-to-education");
  }

  if (
    lowerText.includes("life") ||
    lowerText.includes("dignity") ||
    lowerText.includes("integrity") ||
    lowerText.includes("death") ||
    lowerText.includes("torture") ||
    lowerText.includes("inviolable") ||
    lowerText.includes("human rights")
  ) {
    slugs.push("right-to-life");
  }

  if (
    lowerText.includes("trial") ||
    lowerText.includes("court") ||
    lowerText.includes("judicial") ||
    lowerText.includes("judge") ||
    lowerText.includes("justice") ||
    lowerText.includes("criminal") ||
    lowerText.includes("accused") ||
    lowerText.includes("defence") ||
    lowerText.includes("habeas corpus")
  ) {
    slugs.push("fair-trial");
  }

  if (
    lowerText.includes("religion") ||
    lowerText.includes("faith") ||
    lowerText.includes("conscience") ||
    lowerText.includes("worship") ||
    lowerText.includes("church") ||
    lowerText.includes("creed") ||
    lowerText.includes("belief")
  ) {
    slugs.push("freedom-of-religion");
  }

  return slugs;
}

async function seedConstitution(
  countrySlug: string,
  jsonFilePath: string
) {
  // Find the country
  const country = await Country.findOne({ slug: countrySlug });
  if (!country) {
    console.error(`❌ Country "${countrySlug}" not found in database`);
    return;
  }

  console.log(`\n📋 Processing ${country.name.en} (${countrySlug})...`);

  // Delete existing constitution data for this country
  const existingConstitution = await Constitution.findOne({
    countryId: country._id,
  });
  if (existingConstitution) {
    const chapters = await Chapter.find({
      constitutionId: existingConstitution._id,
    });
    const chapterIds = chapters.map((c) => c._id);
    const articles = await Article.find({
      chapterId: { $in: chapterIds },
    });
    const articleIds = articles.map((a) => a._id);

    const deletedClauses = await Clause.deleteMany({
      articleId: { $in: articleIds },
    });
    const deletedArticles = await Article.deleteMany({
      chapterId: { $in: chapterIds },
    });
    const deletedChapters = await Chapter.deleteMany({
      constitutionId: existingConstitution._id,
    });

    console.log(
      `  🗑️  Deleted: ${deletedChapters.deletedCount} chapters, ${deletedArticles.deletedCount} articles, ${deletedClauses.deletedCount} clauses`
    );
  }

  // Create or update constitution
  let constitution = existingConstitution;
  if (!constitution) {
    constitution = await Constitution.create({
      countryId: country._id,
      fullTextUrl: "",
    });
    console.log("  ✅ Created constitution record");
  }

  // Read JSON data
  const rawData = fs.readFileSync(jsonFilePath, "utf-8");
  const chaptersData: ChapterData[] = JSON.parse(rawData);

  let totalChapters = 0;
  let totalArticles = 0;
  let totalClauses = 0;

  for (const chData of chaptersData) {
    // Create chapter
    const chapter = await Chapter.create({
      constitutionId: constitution._id,
      number: chData.number,
      title: chData.title,
      order: chData.order,
    });
    totalChapters++;

    for (const artData of chData.articles) {
      // Create article
      const article = await Article.create({
        chapterId: chapter._id,
        number: typeof artData.number === "string"
          ? parseInt(artData.number.replace(/[a-z]/g, ""))
          : artData.number,
        title: artData.title,
        order: artData.order,
      });
      totalArticles++;

      // Batch create clauses for this article
      if (artData.clauses.length > 0) {
        const clauseDocs = artData.clauses.map((clData) => ({
          articleId: article._id,
          countryId: country._id,
          number: clData.number,
          text: {
            fa: clData.text.fa || clData.text.en,
            en: clData.text.en,
          },
          topicSlugs: assignTopicSlugs(clData.text.en),
          agreeCount: 0,
          disagreeCount: 0,
          order: clData.order,
        }));

        await Clause.insertMany(clauseDocs);
        totalClauses += clauseDocs.length;
      }
    }
  }

  console.log(
    `  ✅ Seeded: ${totalChapters} chapters, ${totalArticles} articles, ${totalClauses} clauses`
  );
}

async function main() {
  await connectDatabase();

  console.log("🌱 Seeding constitution data from parsed PDFs...\n");

  const pipelineDir = path.resolve(__dirname, "constitution-pipeline");

  // Seed Germany
  await seedConstitution(
    "germany",
    path.join(pipelineDir, "germany_constitution.json")
  );

  // Seed Portugal
  await seedConstitution(
    "portugal",
    path.join(pipelineDir, "portugal_constitution.json")
  );

  console.log("\n🎉 Constitution seeding complete!\n");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
