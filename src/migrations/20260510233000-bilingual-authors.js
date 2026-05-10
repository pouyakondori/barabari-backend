/**
 * Migration: Convert author name/bio from plain strings to bilingual {fa, en} objects
 */

module.exports = {
  async up(db) {
    const countries = await db.collection('countries').find({ 'authors.0': { $exists: true } }).toArray();
    let updated = 0;

    for (const country of countries) {
      const needsUpdate = country.authors.some(a => typeof a.name === 'string');
      if (!needsUpdate) continue;

      const newAuthors = country.authors.map(a => ({
        name: typeof a.name === 'string' ? { fa: a.name, en: a.name } : a.name,
        bio: typeof a.bio === 'string' ? { fa: a.bio, en: a.bio } : a.bio,
        imageUrl: a.imageUrl,
      }));

      await db.collection('countries').updateOne(
        { _id: country._id },
        { $set: { authors: newAuthors } }
      );
      updated++;
    }

    console.log(`Converted authors to bilingual format in ${updated} countries`);
  },

  async down(db) {
    const countries = await db.collection('countries').find({ 'authors.0': { $exists: true } }).toArray();
    let updated = 0;

    for (const country of countries) {
      const needsUpdate = country.authors.some(a => typeof a.name === 'object');
      if (!needsUpdate) continue;

      const newAuthors = country.authors.map(a => ({
        name: typeof a.name === 'object' ? a.name.en : a.name,
        bio: typeof a.bio === 'object' ? a.bio.en : a.bio,
        imageUrl: a.imageUrl,
      }));

      await db.collection('countries').updateOne(
        { _id: country._id },
        { $set: { authors: newAuthors } }
      );
      updated++;
    }

    console.log(`Reverted authors to plain strings in ${updated} countries`);
  }
};
