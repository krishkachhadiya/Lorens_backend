/**
 * Migration Script: Product.category (single ObjectId) → Product.category (array of ObjectIds)
 * Run from /backend:  node scripts/migrate-category-to-array.js
 * ONE-TIME script only. Safe to re-run (already-migrated / empty docs are skipped).
 *
 * What it does:
 *   - Reads every product directly from the raw MongoDB collection (bypassing the
 *     Mongoose schema/cast layer) so old single-ObjectId values can be inspected
 *     safely before the new array schema is applied.
 *   - If `category` is a single ObjectId (or ObjectId-like string), it is wrapped
 *     into a single-item array: category = [oldCategory]
 *   - If `category` is null/undefined, it becomes an empty array: category = []
 *   - If `category` is already an array, the document is left untouched.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrateCategoryToArray() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MONGODB_URI =", process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Use the raw driver collection so we can read pre-migration shapes
  // (a single ObjectId) without Mongoose trying to cast them to the new
  // array schema before we've had a chance to inspect them.
  const collection = mongoose.connection.collection('products');

  const cursor = collection.find({});

  let scanned = 0;
  let migrated = 0;
  let skippedAlreadyArray = 0;
  let skippedEmpty = 0;

  console.log('📦 Migrating product.category → array...\n');

  for await (const doc of cursor) {
    scanned++;

    const current = doc.category;

    if (Array.isArray(current)) {
      skippedAlreadyArray++;
      continue;
    }

    let newCategory;
    if (current === null || current === undefined) {
      newCategory = [];
      skippedEmpty++;
    } else {
      // Single ObjectId (or ObjectId-like value) → single-item array
      newCategory = [current];
    }

    await collection.updateOne(
      { _id: doc._id },
      { $set: { category: newCategory } }
    );

    migrated++;
    console.log(`   ✔ Migrated product ${doc._id}: category → [${newCategory.join(', ')}]`);
  }

  console.log('\n🎉 Migration complete!');
  console.log(`   Scanned:               ${scanned}`);
  console.log(`   Migrated:              ${migrated}`);
  console.log(`   Already array (skip):  ${skippedAlreadyArray}`);
  console.log(`   Empty/null → []:       ${skippedEmpty}\n`);

  await mongoose.connection.close();
}

migrateCategoryToArray().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
