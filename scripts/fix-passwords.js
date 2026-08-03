/**
 * Fix plaintext passwords already in MongoDB
 * Run once: node scripts/fix-passwords.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');

  const admins = await Admin.find();

  for (const admin of admins) {
    if (!admin.password.startsWith('$2')) {
      // plaintext — let pre-save hook hash it
      admin.password = admin.password;
      admin.markModified('password');
      await admin.save();
      console.log(`✔ Fixed: ${admin.email}`);
    } else {
      console.log(`⏭  Already hashed: ${admin.email}`);
    }
  }

  console.log('\n✅ Done! Login with admin@gmail.com / 123456');
  process.exit();
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
