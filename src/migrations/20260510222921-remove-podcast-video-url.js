/**
 * Migration: Remove podcastUrl and videoUrl fields from countries
 * These fields are no longer needed since podcasts are managed via the /podcasts page.
 */

module.exports = {
  async up(db) {
    await db.collection('countries').updateMany(
      {},
      { $unset: { podcastUrl: "", videoUrl: "" } }
    );
    console.log('Removed podcastUrl and videoUrl from all countries');
  },

  async down(db) {
    // No-op: cannot restore removed data
    console.log('No-op: podcastUrl and videoUrl fields cannot be restored');
  }
};
