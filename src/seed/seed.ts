import "reflect-metadata";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database";
import { Country } from "../models/Country";
import { Constitution } from "../models/Constitution";
import { Chapter } from "../models/Chapter";
import { Article } from "../models/Article";
import { Clause } from "../models/Clause";
import { Topic } from "../models/Topic";
import { TimelineEvent } from "../models/TimelineEvent";

async function seed() {
  await connectDatabase();

  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await Promise.all([
    Country.deleteMany({}),
    Constitution.deleteMany({}),
    Chapter.deleteMany({}),
    Article.deleteMany({}),
    Clause.deleteMany({}),
    Topic.deleteMany({}),
    TimelineEvent.deleteMany({}),
  ]);

  // --- Topics ---
  const topics = await Topic.insertMany([
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
      slug: "right-to-education",
      name: { fa: "حق آموزش", en: "Right to Education" },
      category: "social-economic",
      description: {
        fa: "حق دسترسی به آموزش رایگان و با کیفیت",
        en: "The right to access free and quality education",
      },
      order: 2,
    },
    {
      slug: "right-to-life",
      name: { fa: "حق حیات", en: "Right to Life" },
      category: "fundamental-rights",
      description: {
        fa: "حق حیات و امنیت شخصی",
        en: "The right to life and personal security",
      },
      order: 3,
    },
    {
      slug: "fair-trial",
      name: { fa: "دادرسی عادلانه", en: "Right to a Fair Trial" },
      category: "rights-justice",
      description: {
        fa: "حق برخورداری از دادرسی عادلانه و منصفانه",
        en: "The right to a fair and impartial trial",
      },
      order: 4,
    },
    {
      slug: "freedom-of-religion",
      name: { fa: "آزادی مذهب", en: "Freedom of Religion" },
      category: "fundamental-rights",
      description: {
        fa: "حق آزادی عقیده و مذهب",
        en: "The right to freedom of belief and religion",
      },
      order: 5,
    },
  ]);
  console.log(`✅ Created ${topics.length} topics`);

  // --- Portugal ---
  const portugal = await Country.create({
    slug: "portugal",
    name: { fa: "پرتغال", en: "Portugal" },
    flag: "🇵🇹",
    population: 10_340_000,
    coordinates: { lat: 38.7223, lng: -9.1393, zoom: 6 },
    abstract: {
      fa: "قانون اساسی جمهوری پرتغال در سال ۱۹۷۶ پس از انقلاب گل میخک تصویب شد و چارچوب یک دموکراسی پارلمانی را ایجاد کرد.",
      en: "The Constitution of the Portuguese Republic was adopted in 1976 following the Carnation Revolution, establishing a parliamentary democracy framework.",
    },
    totalArea: 92212,
    landlocked: false,
    borders: ["spain"],
    naturalResources: ["Cork", "Lithium", "Tungsten", "Tin", "Fish"],
    authors: [
      {
        name: "Constituent Assembly of Portugal",
        bio: "The democratically elected assembly that drafted the 1976 Constitution after the fall of the Estado Novo regime.",
      },
    ],
    amendments: [
      { year: 1982, description: { fa: "حذف شورای انقلاب", en: "Removal of the Council of the Revolution" } },
      { year: 1989, description: { fa: "اصلاحات اقتصادی و خصوصی‌سازی", en: "Economic reforms and privatization provisions" } },
      { year: 2005, description: { fa: "اصلاحیه برای رفراندوم اروپایی", en: "Amendment for European referendum" } },
    ],
    countryCode: "PT",
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
  });
  console.log("✅ Created country: Portugal");

  // --- Germany ---
  const germany = await Country.create({
    slug: "germany",
    name: { fa: "آلمان", en: "Germany" },
    flag: "🇩🇪",
    population: 84_360_000,
    coordinates: { lat: 52.52, lng: 13.405, zoom: 5 },
    abstract: {
      fa: "قانون اساسی آلمان (گروندگزتز) در سال ۱۹۴۹ تصویب شد و پایه‌های یک دموکراسی فدرال پارلمانی را بنا نهاد.",
      en: "The German Basic Law (Grundgesetz) was adopted in 1949, establishing the foundations of a federal parliamentary democracy.",
    },
    totalArea: 357022,
    landlocked: false,
    borders: ["denmark", "poland", "czech-republic", "austria", "switzerland", "france", "luxembourg", "belgium", "netherlands"],
    naturalResources: ["Iron Ore", "Coal", "Potash", "Timber", "Natural Gas", "Lignite"],
    authors: [
      {
        name: "Parliamentary Council (Parlamentarischer Rat)",
        bio: "A body of 65 delegates from the West German state parliaments who drafted the Basic Law in 1948-1949.",
      },
    ],
    amendments: [
      { year: 1990, description: { fa: "اتحاد مجدد آلمان", en: "German Reunification amendment" } },
      { year: 2006, description: { fa: "اصلاحات فدرالیسم", en: "Federalism reform" } },
      { year: 2009, description: { fa: "ترمز بدهی", en: "Debt brake (Schuldenbremse) amendment" } },
    ],
    countryCode: "DE",
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
  });
  console.log("✅ Created country: Germany");

  // --- Portugal Constitution ---
  const ptConstitution = await Constitution.create({
    countryId: portugal._id,
    fullTextUrl: "",
  });

  const ptChapter1 = await Chapter.create({
    constitutionId: ptConstitution._id,
    number: 1,
    title: { fa: "اصول بنیادین", en: "Fundamental Principles" },
    order: 1,
  });

  const ptChapter2 = await Chapter.create({
    constitutionId: ptConstitution._id,
    number: 2,
    title: { fa: "حقوق و آزادی‌ها", en: "Rights and Freedoms" },
    order: 2,
  });

  const ptArt1 = await Article.create({
    chapterId: ptChapter1._id,
    number: 1,
    title: { fa: "جمهوری پرتغال", en: "The Portuguese Republic" },
    order: 1,
  });

  const ptArt2 = await Article.create({
    chapterId: ptChapter1._id,
    number: 2,
    title: { fa: "دولت دموکراتیک حقوقی", en: "Democratic State Based on the Rule of Law" },
    order: 2,
  });

  const ptArt37 = await Article.create({
    chapterId: ptChapter2._id,
    number: 37,
    title: { fa: "آزادی بیان و اطلاع‌رسانی", en: "Freedom of Expression and Information" },
    order: 1,
  });

  const ptArt43 = await Article.create({
    chapterId: ptChapter2._id,
    number: 43,
    title: { fa: "آزادی آموزش و تدریس", en: "Freedom of Learning and Teaching" },
    order: 2,
  });

  await Clause.insertMany([
    {
      articleId: ptArt1._id,
      countryId: portugal._id,
      number: 1,
      text: {
        fa: "پرتغال یک جمهوری مستقل است که بر پایه کرامت انسانی و اراده مردم استوار است و متعهد به ساختن جامعه‌ای آزاد، عادلانه و همبسته است.",
        en: "Portugal shall be a sovereign Republic, based on the dignity of the human person and the will of the people, and committed to building a free, just and solidary society.",
      },
      topicSlugs: ["right-to-life"],
      order: 1,
    },
    {
      articleId: ptArt2._id,
      countryId: portugal._id,
      number: 1,
      text: {
        fa: "جمهوری پرتغال یک دولت دموکراتیک حقوقی است که بر حاکمیت مردم، تکثرگرایی بیان و سازماندهی سیاسی دموکراتیک استوار است.",
        en: "The Portuguese Republic shall be a democratic state based on the rule of law, the sovereignty of the people, pluralism of democratic expression and democratic political organization.",
      },
      topicSlugs: ["freedom-of-speech"],
      order: 1,
    },
    {
      articleId: ptArt37._id,
      countryId: portugal._id,
      number: 1,
      text: {
        fa: "هر کس حق دارد آزادانه افکار خود را به صورت کلمات، تصاویر یا هر وسیله دیگری بیان و منتشر کند.",
        en: "Everyone shall have the right to freely express and publicise their thoughts in words, images or by any other means.",
      },
      topicSlugs: ["freedom-of-speech"],
      order: 1,
    },
    {
      articleId: ptArt37._id,
      countryId: portugal._id,
      number: 2,
      text: {
        fa: "اعمال این حقوق نمی‌تواند توسط هیچ نوع سانسور مانع شود.",
        en: "The exercise of these rights shall not be prevented or limited by any type of censorship.",
      },
      topicSlugs: ["freedom-of-speech"],
      order: 2,
    },
    {
      articleId: ptArt43._id,
      countryId: portugal._id,
      number: 1,
      text: {
        fa: "آزادی آموزش و تدریس تضمین شده است.",
        en: "Freedom of learning and teaching shall be guaranteed.",
      },
      topicSlugs: ["right-to-education"],
      order: 1,
    },
  ]);
  console.log("✅ Seeded Portugal constitution (2 chapters, 4 articles, 5 clauses)");

  // --- Germany Constitution (Basic Law / Grundgesetz) ---
  const deConstitution = await Constitution.create({
    countryId: germany._id,
    fullTextUrl: "",
  });

  const deChapter1 = await Chapter.create({
    constitutionId: deConstitution._id,
    number: 1,
    title: { fa: "حقوق اساسی", en: "Basic Rights" },
    order: 1,
  });

  const deChapter2 = await Chapter.create({
    constitutionId: deConstitution._id,
    number: 2,
    title: { fa: "فدراسیون و ایالات", en: "The Federation and the Länder" },
    order: 2,
  });

  const deArt1 = await Article.create({
    chapterId: deChapter1._id,
    number: 1,
    title: { fa: "کرامت انسانی", en: "Human Dignity" },
    order: 1,
  });

  const deArt2 = await Article.create({
    chapterId: deChapter1._id,
    number: 2,
    title: { fa: "آزادی‌های فردی", en: "Personal Freedoms" },
    order: 2,
  });

  const deArt5 = await Article.create({
    chapterId: deChapter1._id,
    number: 5,
    title: { fa: "آزادی بیان", en: "Freedom of Expression" },
    order: 3,
  });

  const deArt7 = await Article.create({
    chapterId: deChapter1._id,
    number: 7,
    title: { fa: "آموزش", en: "Education" },
    order: 4,
  });

  const deArt20 = await Article.create({
    chapterId: deChapter2._id,
    number: 20,
    title: { fa: "اصول قانون اساسی", en: "Constitutional Principles" },
    order: 1,
  });

  await Clause.insertMany([
    {
      articleId: deArt1._id,
      countryId: germany._id,
      number: 1,
      text: {
        fa: "کرامت انسان خدشه‌ناپذیر است. احترام و حمایت از آن وظیفه تمام مقامات دولتی است.",
        en: "Human dignity shall be inviolable. To respect and protect it shall be the duty of all state authority.",
      },
      topicSlugs: ["right-to-life"],
      order: 1,
    },
    {
      articleId: deArt1._id,
      countryId: germany._id,
      number: 2,
      text: {
        fa: "ملت آلمان بنابراین حقوق بشر غیرقابل نقض و غیرقابل انتقال را به عنوان اساس هر جامعه بشری، صلح و عدالت در جهان به رسمیت می‌شناسد.",
        en: "The German people therefore acknowledge inviolable and inalienable human rights as the basis of every community, of peace and of justice in the world.",
      },
      topicSlugs: ["right-to-life"],
      order: 2,
    },
    {
      articleId: deArt2._id,
      countryId: germany._id,
      number: 1,
      text: {
        fa: "هر کس حق رشد آزادانه شخصیت خود را دارد، تا جایی که حقوق دیگران را نقض نکند.",
        en: "Every person shall have the right to free development of his personality insofar as he does not violate the rights of others.",
      },
      topicSlugs: ["right-to-life"],
      order: 1,
    },
    {
      articleId: deArt2._id,
      countryId: germany._id,
      number: 2,
      text: {
        fa: "هر کس حق حیات و تمامیت جسمانی دارد. آزادی فرد خدشه‌ناپذیر است.",
        en: "Every person shall have the right to life and physical integrity. Freedom of the person shall be inviolable.",
      },
      topicSlugs: ["right-to-life"],
      order: 2,
    },
    {
      articleId: deArt5._id,
      countryId: germany._id,
      number: 1,
      text: {
        fa: "هر کس حق دارد نظرات خود را آزادانه در قالب گفتار، نوشتار و تصویر بیان و منتشر کند.",
        en: "Every person shall have the right freely to express and disseminate his opinions in speech, writing and pictures.",
      },
      topicSlugs: ["freedom-of-speech"],
      order: 1,
    },
    {
      articleId: deArt5._id,
      countryId: germany._id,
      number: 2,
      text: {
        fa: "سانسور وجود نخواهد داشت.",
        en: "There shall be no censorship.",
      },
      topicSlugs: ["freedom-of-speech"],
      order: 2,
    },
    {
      articleId: deArt7._id,
      countryId: germany._id,
      number: 1,
      text: {
        fa: "کل نظام آموزشی تحت نظارت دولت قرار دارد.",
        en: "The entire school system shall be under the supervision of the state.",
      },
      topicSlugs: ["right-to-education"],
      order: 1,
    },
    {
      articleId: deArt20._id,
      countryId: germany._id,
      number: 1,
      text: {
        fa: "جمهوری فدرال آلمان یک دولت فدرال دموکراتیک و اجتماعی است.",
        en: "The Federal Republic of Germany shall be a democratic and social federal state.",
      },
      topicSlugs: ["fair-trial"],
      order: 1,
    },
  ]);
  console.log("✅ Seeded Germany constitution (2 chapters, 5 articles, 8 clauses)");

  // --- Timeline Events ---
  await TimelineEvent.insertMany([
    {
      countryId: portugal._id,
      date: "1974-04-25",
      title: { fa: "انقلاب گل میخک", en: "Carnation Revolution" },
      description: {
        fa: "کودتای نظامی که به رژیم استادو نوو پایان داد و دموکراسی را آغاز کرد.",
        en: "Military coup that ended the Estado Novo regime and initiated democratization.",
      },
      order: 1,
    },
    {
      countryId: portugal._id,
      date: "1976-04-02",
      title: { fa: "تصویب قانون اساسی", en: "Constitution Adopted" },
      description: {
        fa: "قانون اساسی جمهوری پرتغال تصویب شد.",
        en: "The Constitution of the Portuguese Republic was adopted.",
      },
      order: 2,
    },
    {
      countryId: germany._id,
      date: "1949-05-23",
      title: { fa: "تصویب قانون اساسی", en: "Basic Law Adopted" },
      description: {
        fa: "گروندگزتز (قانون اساسی) جمهوری فدرال آلمان تصویب شد.",
        en: "The Basic Law (Grundgesetz) of the Federal Republic of Germany was adopted.",
      },
      order: 1,
    },
    {
      countryId: germany._id,
      date: "1990-10-03",
      title: { fa: "اتحاد مجدد آلمان", en: "German Reunification" },
      description: {
        fa: "آلمان شرقی و غربی مجدداً متحد شدند.",
        en: "East and West Germany were reunified.",
      },
      order: 2,
    },
  ]);
  console.log("✅ Seeded timeline events");

  console.log("\n🎉 Database seeded successfully!\n");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
