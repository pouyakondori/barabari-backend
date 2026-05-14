/**
 * Migration: Add all topic categories from TODO.md and re-tag constitution clauses.
 *
 * Upserts 19 topics across 6 categories, then re-runs keyword-based auto-tagging
 * on all existing clauses (Portugal & Germany constitutions).
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */

const ALL_TOPICS = [
  // fundamental-rights
  {
    slug: "freedom-of-speech",
    name: { fa: "آزادی بیان", en: "Freedom of Speech" },
    category: "fundamental-rights",
    description: {
      fa: "حق آزادی بیان و مطبوعات",
      en: "The right to freedom of expression and press",
    },
    order: 1,
  },
  {
    slug: "freedom-of-religion",
    name: { fa: "ادیان", en: "Religions" },
    category: "fundamental-rights",
    description: {
      fa: "حق آزادی عقیده و مذهب",
      en: "The right to freedom of belief and religion",
    },
    order: 2,
  },
  {
    slug: "freedom-of-association",
    name: { fa: "انجمنی (احزاب، اصناف، سندیکا)", en: "Freedom of Association (Parties, Guilds, Unions)" },
    category: "fundamental-rights",
    description: {
      fa: "حق تشکیل و عضویت در احزاب، اصناف و سندیکاها",
      en: "The right to form and join parties, guilds, and unions",
    },
    order: 3,
  },
  {
    slug: "right-to-life",
    name: { fa: "حق حیات", en: "Right to Life" },
    category: "fundamental-rights",
    description: {
      fa: "حق حیات و امنیت شخصی",
      en: "The right to life and personal security",
    },
    order: 4,
  },
  {
    slug: "citizenship-rights",
    name: { fa: "حقوق شهروندی", en: "Citizenship Rights" },
    category: "fundamental-rights",
    description: {
      fa: "حقوق مرتبط با تابعیت و شهروندی",
      en: "Rights related to nationality and citizenship",
    },
    order: 5,
  },

  // power-distribution
  {
    slug: "presidential-election-procedure",
    name: { fa: "چگونگی انتخاب رئیس جمهور", en: "Presidential Election Procedure" },
    category: "power-distribution",
    description: {
      fa: "فرآیند و نحوه انتخاب رئیس جمهور",
      en: "The process and procedure of presidential elections",
    },
    order: 1,
  },
  {
    slug: "formation-of-parliament",
    name: { fa: "چگونگی تشکیل پارلمان", en: "Formation of Parliament" },
    category: "power-distribution",
    description: {
      fa: "ساختار و نحوه تشکیل پارلمان",
      en: "The structure and formation of parliament",
    },
    order: 2,
  },
  {
    slug: "formation-of-government",
    name: { fa: "چگونگی تشکیل دولت", en: "Formation of Government" },
    category: "power-distribution",
    description: {
      fa: "ساختار و نحوه تشکیل دولت",
      en: "The structure and formation of government",
    },
    order: 3,
  },

  // rights-justice
  {
    slug: "fair-trial",
    name: { fa: "حق برخورداری از محاکمه عادلانه", en: "Right to a Fair Trial" },
    category: "rights-justice",
    description: {
      fa: "حق برخورداری از دادرسی عادلانه و منصفانه",
      en: "The right to a fair and impartial trial",
    },
    order: 1,
  },
  {
    slug: "operation-of-judiciary",
    name: { fa: "نحوه فعالیت قوه قضائیه", en: "Operation of the Judiciary" },
    category: "rights-justice",
    description: {
      fa: "ساختار و عملکرد دستگاه قضایی",
      en: "The structure and operation of the judicial system",
    },
    order: 2,
  },
  {
    slug: "operation-of-military-police",
    name: { fa: "نحوه فعالیت نیروهای نظامی و پلیس", en: "Operation of Military and Police Forces" },
    category: "rights-justice",
    description: {
      fa: "نحوه فعالیت و نظارت بر نیروهای نظامی و انتظامی",
      en: "The operation and oversight of military and law enforcement forces",
    },
    order: 3,
  },

  // social-economic
  {
    slug: "right-to-education",
    name: { fa: "حق آموزش", en: "Right to Education" },
    category: "social-economic",
    description: {
      fa: "حق دسترسی به آموزش رایگان و با کیفیت",
      en: "The right to access free and quality education",
    },
    order: 1,
  },
  {
    slug: "right-to-healthcare",
    name: { fa: "حق دسترسی به بهداشت", en: "Right to Healthcare" },
    category: "social-economic",
    description: {
      fa: "حق دسترسی به خدمات بهداشتی و درمانی",
      en: "The right to access health and medical services",
    },
    order: 2,
  },
  {
    slug: "right-to-housing",
    name: { fa: "حق مسکن", en: "Right to Housing" },
    category: "social-economic",
    description: {
      fa: "حق برخورداری از مسکن مناسب",
      en: "The right to adequate housing",
    },
    order: 3,
  },
  {
    slug: "labor-rights",
    name: { fa: "حقوق کارگر", en: "Labor Rights" },
    category: "social-economic",
    description: {
      fa: "حقوق مرتبط با کار، دستمزد و شرایط کاری",
      en: "Rights related to work, wages, and working conditions",
    },
    order: 4,
  },

  // civic-duties
  {
    slug: "voting-election-laws",
    name: { fa: "قوانین رای‌گیری و انتخابات", en: "Voting and Election Laws" },
    category: "civic-duties",
    description: {
      fa: "قوانین مرتبط با رای‌گیری و فرآیند انتخابات",
      en: "Laws related to voting and the electoral process",
    },
    order: 1,
  },
  {
    slug: "tax-laws",
    name: { fa: "قوانین مالیاتی", en: "Tax Laws" },
    category: "civic-duties",
    description: {
      fa: "قوانین مرتبط با مالیات و تعهدات مالی شهروندان",
      en: "Laws related to taxation and citizens' financial obligations",
    },
    order: 2,
  },
  {
    slug: "citizen-responsibilities",
    name: { fa: "مسئولیت‌های شهروند", en: "Citizen Responsibilities" },
    category: "civic-duties",
    description: {
      fa: "وظایف و مسئولیت‌های مدنی شهروندان",
      en: "Civic duties and responsibilities of citizens",
    },
    order: 3,
  },

  // constitutional-revision
  {
    slug: "constitutional-amendment-procedures",
    name: { fa: "چگونگی اصلاح یا بروزرسانی قانون اساسی", en: "Constitutional Amendment Procedures" },
    category: "constitutional-revision",
    description: {
      fa: "فرآیند اصلاح و بازنگری قانون اساسی",
      en: "The process of amending and revising the constitution",
    },
    order: 1,
  },
];

/**
 * Keyword-based topic slug assignment for clause text.
 * Each topic has a set of English keywords; if any match, the slug is assigned.
 */
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

module.exports = {
  async up(db) {
    console.log("📝 Upserting all 19 topics...");

    // Upsert each topic
    for (const topic of ALL_TOPICS) {
      await db.collection("topics").updateOne(
        { slug: topic.slug },
        {
          $set: {
            name: topic.name,
            category: topic.category,
            description: topic.description,
            order: topic.order,
          },
          $setOnInsert: { slug: topic.slug },
        },
        { upsert: true }
      );
    }
    console.log(`  ✅ Upserted ${ALL_TOPICS.length} topics`);

    // Re-tag all clauses with the expanded keyword set
    console.log("🏷️  Re-tagging all constitution clauses...");
    const clauses = await db.collection("clauses").find({}).toArray();
    let updated = 0;

    for (const clause of clauses) {
      const enText = clause.text?.en || "";
      if (!enText) continue;

      const newSlugs = assignTopicSlugs(enText);
      // Only update if the slugs actually changed
      const currentSlugs = (clause.topicSlugs || []).sort().join(",");
      const newSlugsStr = newSlugs.sort().join(",");

      if (currentSlugs !== newSlugsStr) {
        await db.collection("clauses").updateOne(
          { _id: clause._id },
          { $set: { topicSlugs: newSlugs } }
        );
        updated++;
      }
    }

    console.log(`  ✅ Re-tagged ${updated} clauses (out of ${clauses.length} total)`);
  },

  async down(db) {
    // Remove the 14 newly added topics (keep original 5)
    const originalSlugs = [
      "freedom-of-speech",
      "right-to-education",
      "right-to-life",
      "fair-trial",
      "freedom-of-religion",
    ];

    const newSlugs = ALL_TOPICS
      .map((t) => t.slug)
      .filter((s) => !originalSlugs.includes(s));

    await db.collection("topics").deleteMany({ slug: { $in: newSlugs } });
    console.log(`  🗑️  Removed ${newSlugs.length} new topics`);

    // Revert topic names/descriptions for original topics to their previous values
    const originalTopics = [
      { slug: "freedom-of-religion", name: { fa: "آزادی مذهب", en: "Freedom of Religion" } },
      { slug: "fair-trial", name: { fa: "دادرسی عادلانه", en: "Right to a Fair Trial" } },
    ];
    for (const ot of originalTopics) {
      await db.collection("topics").updateOne(
        { slug: ot.slug },
        { $set: { name: ot.name } }
      );
    }

    // Re-tag clauses back to old 5-topic keyword set
    const oldAssign = (text) => {
      const lt = text.toLowerCase();
      const slugs = [];
      if (["expression","speech","press","opinion","censorship","media","broadcast","information"].some(k => lt.includes(k))) slugs.push("freedom-of-speech");
      if (["education","school","teaching","learning","university","instruction"].some(k => lt.includes(k))) slugs.push("right-to-education");
      if (["life","dignity","integrity","death","torture","inviolable","human rights"].some(k => lt.includes(k))) slugs.push("right-to-life");
      if (["trial","court","judicial","judge","justice","criminal","accused","defence","habeas corpus"].some(k => lt.includes(k))) slugs.push("fair-trial");
      if (["religion","faith","conscience","worship","church","creed","belief"].some(k => lt.includes(k))) slugs.push("freedom-of-religion");
      return slugs;
    };

    const clauses = await db.collection("clauses").find({}).toArray();
    for (const clause of clauses) {
      const enText = clause.text?.en || "";
      if (!enText) continue;
      await db.collection("clauses").updateOne(
        { _id: clause._id },
        { $set: { topicSlugs: oldAssign(enText) } }
      );
    }
    console.log("  ✅ Reverted clause tagging to original 5 topics");
  },
};
