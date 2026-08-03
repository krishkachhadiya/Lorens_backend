/**
 * Reset Admin Password Script
 * Run: node scripts/reset-admin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.model');

async function resetAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Delete all existing admins and recreate cleanly
  await Admin.deleteMany({});
  console.log('Cleared existing admins');

  const admins = [
    { name: 'Super Admin', email: 'admin@gmail.com', password: '123456', role: 'admin' },
    { name: 'Staff User',  email: 'staff@gmail.com', password: '123',    role: 'staff' },
    { name: 'Manager User',email: 'manager@gmail.com',password: '123456',role: 'manager' },
  ];

  for (const a of admins) {
    const hashed = await bcrypt.hash(a.password, 12);
    await Admin.create({ ...a, password: hashed });
    console.log(`✔ Created: ${a.email} / ${a.password}`);
  }

  console.log('\n✅ Done! Login with admin@gmail.com / 123456');
  await mongoose.connection.close();
}

resetAdmin().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
