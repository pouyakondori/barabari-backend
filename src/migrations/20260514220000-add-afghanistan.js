/**
 * Migration: Import Afghanistan - country info, constitution, topic tags, mock comments & votes.
 *
 * Steps:
 * 1. Create the Afghanistan country document
 * 2. Import the 2004 Constitution (12 chapters, 115 articles, 134 clauses)
 * 3. Auto-tag all clauses with topic slugs
 * 4. Add 5 random Persian comments per clause using existing mock users
 * 5. Add random vote counts per clause
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */

const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Seeded PRNG for reproducibility
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Topic keyword matching (same as seedConstitutions.ts)
function assignTopicSlugs(text) {
  const lowerText = text.toLowerCase();
  const slugs = [];

  const topicKeywords = {
    "freedom-of-speech": [
      "expression", "speech", "press", "opinion", "censorship",
      "media", "broadcast", "information", "communicate", "publication",
    ],
    "freedom-of-religion": [
      "religion", "faith", "conscience", "worship", "church",
      "creed", "belief", "religious", "islam", "mosque",
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
      "parliament", "legislature", "legislative", "congress",
      "assembly", "chamber", "deputy", "deputies",
      "member of parliament", "senator", "representative",
      "house of people", "house of elders", "national assembly",
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
      "profession", "remuneration", "minimum wage", "forced labor",
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

// Persian comment templates
const COMMENT_TEMPLATES = [
  "این بند برای حفاظت از آزادی‌های فردی بنیادین است. مقایسه تفسیرهای مختلف کشورها از اصول مشابه جالب است.",
  "به نظر من این ماده تعادل خوبی بین اقتدار دولت و آزادی فردی برقرار کرده. خوب تنظیم شده.",
  "ارزشمند خواهد بود اگر ببینیم دادگاه‌ها در طول سال‌ها این بند را در عمل چگونه تفسیر کرده‌اند.",
  "عبارت‌بندی اینجا بسیار دقیق است. هر دموکراسی قانون اساسی به زبان شفاف مانند این نیاز دارد.",
  "سازوکارهای اجرایی این بند می‌تواند قوی‌تر باشد. حقوق بدون اجرا صرفاً آرمانی هستند.",
  "این یکی از پیشروترین بندهای قانون اساسی است. بسیاری از کشورها می‌توانند از این رویکرد بیاموزند.",
  "کنجکاوم بدانم این بند چگونه در طول دهه‌ها از طریق اصلاحات قانون اساسی تکامل یافته.",
  "اجرای عملی این ماده به طور قابل توجهی بین مناطق مختلف متفاوت است.",
  "این بند منعکس‌کننده ارزش‌هایی است که از مبارزات تاریخی برای دموکراسی و حقوق بشر پدید آمده.",
  "مقایسه این با قانون اساسی سایر کشورها نشان می‌دهد که نظام‌های مختلف چگونه به سؤالات مشابه نزدیک می‌شوند.",
  "شفافیت این بند درک حقوق شهروندان را آسان‌تر می‌کند. سواد قانون اساسی مهم است.",
  "قدردانی می‌کنم از نحوه‌ای که این بند رفاه جمعی را با حقوق فردی متوازن کرده.",
  "این ماده در بسیاری از تصمیمات تاریخی مورد استناد قرار گرفته. تأثیر آن قابل توجه است.",
  "زمینه تاریخی پشت این بند جذاب است. واضح است که با در نظر گرفتن سوءاستفاده‌های گذشته تنظیم شده.",
  "دوست دارم آموزش عمومی بیشتری درباره این ماده قانون اساسی ببینم. بسیاری از شهروندان حقوق خود را نمی‌دانند.",
  "این نمونه‌ای عالی از چگونگی تکامل حقوق اساسی برای پاسخ به چالش‌های مدرن است.",
  "با توجه به شرایط خاص افغانستان، این ماده اهمیت ویژه‌ای دارد.",
  "تطبیق این بند در جامعه افغانستان چالش‌های منحصر به فردی دارد.",
  "این ماده نشان‌دهنده تلاش قانون‌گذاران برای ایجاد تعادل بین سنت و مدرنیته است.",
  "امیدوارم روزی این حقوق به طور کامل در افغانستان تحقق یابد.",
];

module.exports = {
  async up(db) {
    console.log("🇦🇫 Importing Afghanistan...\n");

    // ─── Step 1: Create country ───────────────────────────────────────────
    const existingCountry = await db.collection("countries").findOne({ slug: "afghanistan" });
    if (existingCountry) {
      console.log("  ⏭️  Afghanistan already exists, skipping country creation");
    }

    const countryDoc = {
      slug: "afghanistan",
      name: { fa: "افغانستان", en: "Afghanistan" },
      flag: "🇦🇫",
      population: 40_100_000,
      coordinates: { lat: 34.5553, lng: 69.2075, zoom: 5 },
      abstract: {
        fa: "قانون اساسی جمهوری اسلامی افغانستان در سال ۲۰۰۴ (۱۳۸۲) توسط لویه جرگه تصویب شد و چارچوب یک جمهوری اسلامی مبتنی بر دموکراسی را ایجاد کرد.",
        en: "The Constitution of the Islamic Republic of Afghanistan was adopted in 2004 by the Loya Jirga, establishing the framework of an Islamic Republic based on democracy.",
      },
      totalArea: 652230,
      landlocked: true,
      borders: ["iran", "pakistan", "turkmenistan", "uzbekistan", "tajikistan", "china"],
      naturalResources: ["Natural Gas", "Petroleum", "Coal", "Copper", "Chromite", "Talc", "Barites", "Sulfur", "Lead", "Zinc", "Iron Ore", "Lapis Lazuli"],
      authors: [
        {
          name: "Constitutional Loya Jirga of 2004",
          bio: "A grand assembly of 502 delegates who drafted and ratified the constitution in December 2003–January 2004.",
        },
      ],
      amendments: [
        { year: 2004, description: { fa: "تصویب قانون اساسی توسط لویه جرگه", en: "Constitution ratified by Loya Jirga" } },
      ],
      countryCode: "AF",
      systemOfGovernment: "Islamic Republic (Presidential)",
      hdi: 0.462,
      independenceDate: "1919-08-19",
      officialLanguages: ["Pashto", "Dari"],
      gdp: "$14.58 billion",
      economicType: "Low-Income Economy",
      religiousComposition: [
        { religion: "Islam (Sunni)", percentage: 84.7 },
        { religion: "Islam (Shia)", percentage: 15.0 },
        { religion: "Other", percentage: 0.3 },
      ],
      urbanizationRate: 26.0,
      corruptionIndex: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let country;
    if (existingCountry) {
      country = existingCountry;
    } else {
      const result = await db.collection("countries").insertOne(countryDoc);
      country = { _id: result.insertedId, ...countryDoc };
      console.log("  ✅ Created country: Afghanistan");
    }

    // ─── Step 2: Import Constitution ──────────────────────────────────────
    // Remove existing constitution data if any
    const existingConstitution = await db.collection("constitutions").findOne({ countryId: country._id });
    if (existingConstitution) {
      const chapters = await db.collection("chapters").find({ constitutionId: existingConstitution._id }).toArray();
      const chapterIds = chapters.map((c) => c._id);
      const articles = await db.collection("articles").find({ chapterId: { $in: chapterIds } }).toArray();
      const articleIds = articles.map((a) => a._id);

      await db.collection("clauses").deleteMany({ articleId: { $in: articleIds } });
      await db.collection("articles").deleteMany({ chapterId: { $in: chapterIds } });
      await db.collection("chapters").deleteMany({ constitutionId: existingConstitution._id });
      await db.collection("constitutions").deleteOne({ _id: existingConstitution._id });
      console.log("  🗑️  Removed existing constitution data");
    }

    // Create constitution
    const constitutionResult = await db.collection("constitutions").insertOne({
      countryId: country._id,
      fullTextUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const constitutionId = constitutionResult.insertedId;
    console.log("  ✅ Created constitution record");

    // Read JSON
    const jsonPath = path.resolve(__dirname, "../seed/constitution-pipeline/afghanistan_constitution.json");
    const chaptersData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    const rng = mulberry32(42); // different seed from other migrations
    let totalClauses = 0;
    const allClauseIds = [];

    for (const chData of chaptersData) {
      const chapterResult = await db.collection("chapters").insertOne({
        constitutionId,
        number: chData.number,
        title: chData.title,
        order: chData.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (const artData of chData.articles) {
        const articleResult = await db.collection("articles").insertOne({
          chapterId: chapterResult.insertedId,
          number: parseInt(String(artData.number).replace(/[a-z]/g, "")),
          title: artData.title,
          order: artData.order || 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        if (artData.clauses && artData.clauses.length > 0) {
          const clauseDocs = artData.clauses.map((cl) => {
            const topicSlugs = assignTopicSlugs(cl.text.en);
            return {
              articleId: articleResult.insertedId,
              countryId: country._id,
              number: cl.number,
              text: { fa: cl.text.fa || cl.text.en, en: cl.text.en },
              topicSlugs,
              agreeCount: Math.floor(rng() * 76) + 5,
              disagreeCount: Math.floor(rng() * 29) + 2,
              order: cl.order,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          });

          const insertResult = await db.collection("clauses").insertMany(clauseDocs);
          const insertedIds = Object.values(insertResult.insertedIds);
          allClauseIds.push(...insertedIds);
          totalClauses += clauseDocs.length;
        }
      }
    }

    console.log(`  ✅ Imported: ${chaptersData.length} chapters, ${totalClauses} clauses`);

    // ─── Step 4: Add mock comments ────────────────────────────────────────
    const users = await db.collection("users").find({ role: "user" }).project({ _id: 1 }).toArray();
    if (users.length === 0) {
      console.log("  ⚠️  No mock users found, skipping comments");
    } else {
      const commentDocs = [];
      for (const clauseId of allClauseIds) {
        // 5 comments per clause
        for (let i = 0; i < 5; i++) {
          const userIdx = Math.floor(rng() * users.length);
          const templateIdx = Math.floor(rng() * COMMENT_TEMPLATES.length);
          commentDocs.push({
            clauseId,
            userId: users[userIdx]._id,
            content: COMMENT_TEMPLATES[templateIdx],
            parentId: null,
            status: "approved",
            isDeleted: false,
            createdAt: new Date(Date.now() - Math.floor(rng() * 30 * 24 * 60 * 60 * 1000)),
            updatedAt: new Date(),
          });
        }
      }

      // Insert in batches
      for (let i = 0; i < commentDocs.length; i += 1000) {
        await db.collection("comments").insertMany(commentDocs.slice(i, i + 1000));
      }
      console.log(`  ✅ Added ${commentDocs.length} comments (5 per clause)`);
    }

    console.log("\n🎉 Afghanistan import complete!");
  },

  async down(db) {
    console.log("🗑️  Removing Afghanistan...");

    const country = await db.collection("countries").findOne({ slug: "afghanistan" });
    if (!country) {
      console.log("  Afghanistan not found, nothing to remove");
      return;
    }

    // Remove comments for Afghanistan clauses
    const constitution = await db.collection("constitutions").findOne({ countryId: country._id });
    if (constitution) {
      const chapters = await db.collection("chapters").find({ constitutionId: constitution._id }).toArray();
      const chapterIds = chapters.map((c) => c._id);
      const articles = await db.collection("articles").find({ chapterId: { $in: chapterIds } }).toArray();
      const articleIds = articles.map((a) => a._id);
      const clauses = await db.collection("clauses").find({ articleId: { $in: articleIds } }).project({ _id: 1 }).toArray();
      const clauseIds = clauses.map((c) => c._id);

      await db.collection("comments").deleteMany({ clauseId: { $in: clauseIds } });
      await db.collection("clauses").deleteMany({ articleId: { $in: articleIds } });
      await db.collection("articles").deleteMany({ chapterId: { $in: chapterIds } });
      await db.collection("chapters").deleteMany({ constitutionId: constitution._id });
      await db.collection("constitutions").deleteOne({ _id: constitution._id });
    }

    await db.collection("countries").deleteOne({ _id: country._id });
    console.log("  ✅ Removed Afghanistan and all related data");
  },
};
