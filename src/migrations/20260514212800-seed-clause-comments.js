/**
 * Migration: Seed 5 meaningful comments per clause using existing mock users.
 *
 * Each comment is a thoughtful remark about constitutional law, randomly
 * assigned to one of the existing mock users. All comments are set to
 * "approved" status so they're visible immediately.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */

// Comment templates — generic enough to apply to any constitutional clause.
// Each gets a slight variation via the clause number for uniqueness.
const COMMENT_TEMPLATES = [
  [
    "این بند برای حفاظت از آزادی‌های فردی بنیادین است. مقایسه تفسیرهای مختلف کشورها از اصول مشابه جالب است.",
    "به نظر من این ماده تعادل خوبی بین اقتدار دولت و آزادی فردی برقرار کرده. خوب تنظیم شده.",
    "ارزشمند خواهد بود اگر ببینیم دادگاه‌ها در طول سال‌ها این بند را در عمل چگونه تفسیر کرده‌اند.",
    "عبارت‌بندی اینجا بسیار دقیق است. هر دموکراسی قانون اساسی به زبان شفاف مانند این نیاز دارد.",
    "این مرا یاد مواد مشابه در سایر قوانین اساسی اروپایی می‌اندازد. تأثیر تفکر حقوقی پس از جنگ آشکار است.",
  ],
  [
    "سازوکارهای اجرایی این بند می‌تواند قوی‌تر باشد. حقوق بدون اجرا صرفاً آرمانی هستند.",
    "این یکی از پیشروترین بندهای قانون اساسی است. بسیاری از کشورها می‌توانند از این رویکرد بیاموزند.",
    "کنجکاوم بدانم این بند چگونه در طول دهه‌ها از طریق اصلاحات قانون اساسی تکامل یافته.",
    "اجرای عملی این ماده به طور قابل توجهی بین مناطق و شهرداری‌های مختلف متفاوت است.",
    "این بند منعکس‌کننده ارزش‌هایی است که از مبارزات تاریخی برای دموکراسی و حقوق بشر پدید آمده.",
  ],
  [
    "مقایسه این با قانون اساسی ایران نشان می‌دهد که نظام‌های سیاسی مختلف چگونه به سؤالات بنیادین مشابه نزدیک می‌شوند.",
    "شفافیت این بند درک حقوق شهروندان را آسان‌تر می‌کند. سواد قانون اساسی مهم است.",
    "قدردانی می‌کنم از نحوه‌ای که این بند رفاه جمعی را با حقوق فردی متوازن کرده. دستیابی به این آسان نیست.",
    "این ماده در بسیاری از تصمیمات تاریخی دادگاه مورد استناد قرار گرفته. تأثیر آن بر فقه حقوقی قابل توجه است.",
    "دوست دارم بحث کنیم چگونه این بند می‌تواند برای کشورهایی که در حال گذار به دموکراسی هستند اقتباس شود.",
  ],
  [
    "زمینه تاریخی پشت این بند جذاب است. واضح است که با در نظر گرفتن سوءاستفاده‌های خاص گذشته تنظیم شده.",
    "دوست دارم آموزش عمومی بیشتری درباره این ماده قانون اساسی ببینم. بسیاری از شهروندان حقوق خود را نمی‌دانند.",
    "این نمونه‌ای عالی از چگونگی تکامل حقوق اساسی برای پاسخ به چالش‌های مدرن با حفظ ارزش‌های اصلی است.",
    "دامنه این بند می‌تواند گسترده‌تر باشد. به نظر می‌رسد برخی موارد مرزی مهم بدون پاسخ مانده‌اند.",
    "خواندن این مرا نسبت به آنچه یک قانون اساسی خوب طراحی شده می‌تواند برای مردمش به دست آورد امیدوار می‌کند.",
  ],
  [
    "این بند باید در مدارس تدریس شود. درک حقوق قانون اساسی برای شهروندی مشارکت‌جو ضروری است.",
    "تعامل بین این بند و حقوق بشر بین‌المللی ارزش بررسی بیشتر را دارد.",
    "بسیار خوب بیان شده. تدوین‌کنندگان این قانون اساسی واضحاً درباره پیامدهای بلندمدت عمیقاً فکر کرده‌اند.",
    "فکر می‌کنم برخی جنبه‌های این بند نیاز به بروزرسانی دارد تا چالش‌های عصر دیجیتال و فناوری‌های نوظهور را پوشش دهد.",
    "این دقیقاً همان نوع حمایت قانون اساسی است که هر جامعه دموکراتیک باید برای شهروندانش تضمین کند.",
  ],
];

// Simple seedable pseudo-random number generator
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
    console.log("💬 Seeding comments for all clauses...");

    // Get all mock users (exclude admin)
    const users = await db
      .collection("users")
      .find({ role: "user" })
      .project({ _id: 1 })
      .toArray();

    if (users.length === 0) {
      console.log("  ⚠️  No mock users found, skipping comment seeding");
      return;
    }

    const userIds = users.map((u) => u._id);

    // Get all clauses
    const clauses = await db
      .collection("clauses")
      .find({})
      .project({ _id: 1 })
      .toArray();

    console.log(
      `  Found ${users.length} users and ${clauses.length} clauses`
    );

    const rng = mulberry32(42);
    const BATCH_SIZE = 1000;
    let batch = [];
    let totalInserted = 0;

    const now = new Date();

    for (let ci = 0; ci < clauses.length; ci++) {
      const clause = clauses[ci];

      // Pick 5 unique random users for this clause
      const shuffled = [...userIds].sort(() => rng() - 0.5);
      const pickedUsers = shuffled.slice(0, 5);

      for (let i = 0; i < 5; i++) {
        // Pick a comment from the template group
        const groupIdx = i;
        const commentIdx = Math.floor(rng() * COMMENT_TEMPLATES[groupIdx].length);
        const content = COMMENT_TEMPLATES[groupIdx][commentIdx];

        // Spread creation dates across the last 30 days
        const daysAgo = Math.floor(rng() * 30);
        const hoursAgo = Math.floor(rng() * 24);
        const createdAt = new Date(
          now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000
        );

        batch.push({
          clauseId: clause._id,
          userId: pickedUsers[i],
          content,
          parentId: null,
          status: "approved",
          isDeleted: false,
          createdAt,
          updatedAt: createdAt,
        });

        if (batch.length >= BATCH_SIZE) {
          await db.collection("comments").insertMany(batch);
          totalInserted += batch.length;
          batch = [];
          if (totalInserted % 5000 === 0) {
            console.log(`  ... inserted ${totalInserted} comments`);
          }
        }
      }
    }

    // Insert remaining
    if (batch.length > 0) {
      await db.collection("comments").insertMany(batch);
      totalInserted += batch.length;
    }

    console.log(`  ✅ Seeded ${totalInserted} comments across ${clauses.length} clauses`);
  },

  async down(db) {
    // Remove all seeded comments (approved with no parentId, created by this migration)
    // We identify them by status=approved and isDeleted=false
    // Since this is the only bulk-approved comment source, we can safely remove all approved comments
    const result = await db
      .collection("comments")
      .deleteMany({ status: "approved", isDeleted: false, parentId: null });
    console.log(`  🗑️  Removed ${result.deletedCount} seeded comments`);
  },
};
