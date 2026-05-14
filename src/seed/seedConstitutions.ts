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

  const topicKeywords: Record<string, string[]> = {
    "freedom-of-speech": [
      "expression", "speech", "press", "opinion", "censorship",
      "media", "broadcast", "information", "communicate", "publication",
    ],
    "freedom-of-religion": [
      "religion", "faith", "conscience", "worship", "church",
      "creed", "belief", "religious",
    ],
    "freedom-of-association": [
      "association", "party", "parties", "union", "unions", "guild",
      "assembly", "assemble", "organize", "collective bargaining",
      "trade union", "political party",
    ],
    "right-to-life": [
      "right to life", "dignity", "integrity", "death penalty",
      "torture", "inviolable", "human rights", "cruel", "degrading",
      "inhuman", "abolition of death",
    ],
    "citizenship-rights": [
      "citizen", "citizenship", "nationality", "naturaliz", "national",
      "expatriat", "stateless", "passport", "deportat",
    ],
    "presidential-election-procedure": [
      "president", "presidential", "head of state", "elect the president",
      "presidential election",
    ],
    "formation-of-parliament": [
      "parliament", "legislature", "legislative", "congress", "bundestag",
      "bundesrat", "assembly", "chamber", "deputy", "deputies",
      "member of parliament", "senator", "representative",
    ],
    "formation-of-government": [
      "government", "cabinet", "minister", "chancellor", "prime minister",
      "executive power", "council of ministers",
    ],
    "fair-trial": [
      "trial", "court", "judicial", "judge", "criminal",
      "accused", "defence", "defense", "habeas corpus", "due process",
      "presumption of innocence", "right to counsel",
    ],
    "operation-of-judiciary": [
      "judiciary", "supreme court", "constitutional court", "prosecutor",
      "magistrate", "tribunal", "judicial independence", "judicial review",
      "jurisdiction",
    ],
    "operation-of-military-police": [
      "military", "armed forces", "army", "navy", "air force",
      "police", "law enforcement", "defense force", "national guard",
      "martial law", "conscription", "military service",
    ],
    "right-to-education": [
      "education", "school", "teaching", "learning", "university",
      "instruction", "academic", "pupil", "student",
    ],
    "right-to-healthcare": [
      "health", "healthcare", "medical", "hospital", "sanitary",
      "disease", "public health", "social security",
    ],
    "right-to-housing": [
      "housing", "home", "dwelling", "residence", "shelter",
      "accommodation", "domicile", "habitation",
    ],
    "labor-rights": [
      "labor", "labour", "worker", "employment", "wage",
      "working condition", "strike", "trade union", "occupation",
      "profession", "remuneration", "minimum wage",
    ],
    "voting-election-laws": [
      "vote", "voting", "election", "ballot", "suffrage",
      "referendum", "plebiscite", "electoral",
    ],
    "tax-laws": [
      "tax", "taxation", "fiscal", "revenue", "levy",
      "duty", "customs", "budget",
    ],
    "citizen-responsibilities": [
      "duty", "obligation", "responsible", "responsibility",
      "compulsory", "mandatory", "civic duty",
    ],
    "constitutional-amendment-procedures": [
      "amendment", "amend", "revision", "revise", "constitutional reform",
      "constitutional review", "modify the constitution",
    ],
  };

  for (const [slug, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        slugs.push(slug);
        break;
      }
    }
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
