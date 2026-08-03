/**
 * Migration Script: JSON files → MongoDB
 * Run from /backend:  node scripts/migrate.js
 * ONE-TIME script only.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Admin    = require('../models/Admin.model');
const Role     = require('../models/Role.model');
const Category = require('../models/Category.model');
const Product  = require('../models/Product.model');
const CmsPage  = require('../models/CmsPage.model');
const Settings = require('../models/Settings.model');
const Inquiry  = require('../models/Inquiry.model');

const DATA_DIR = path.join(__dirname, '../../src/data');

const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const categoryIdMap = new Map();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── 1. ROLES ──────────────────────────────────────────
  console.log('📦 Migrating roles...');
  const rolesJSON = readJSON('roles.json');
  for (const role of rolesJSON) {
    const name = role.name.toLowerCase();
    const exists = await Role.findOne({ name });
    if (!exists) {
      await Role.create({ name, permissions: role.permissions || {} });
      console.log(`   ✔ Role: ${name}`);
    } else {
      console.log(`   ⏭  Role exists: ${name}`);
    }
  }

  // ── 2. ADMINS ─────────────────────────────────────────
  console.log('\n📦 Migrating admins...');
  const adminsJSON = readJSON('admins.json');
  for (const admin of adminsJSON) {
    const exists = await Admin.findOne({ email: admin.email.toLowerCase() });
    if (!exists) {
      // Use new + save() so the pre-save bcrypt hook fires correctly
      const newAdmin = new Admin({
        name: admin.name,
        email: admin.email.toLowerCase(),
        password: admin.password,
        role: admin.role,
        permissions: admin.permissions || {},
        createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
        updatedAt: admin.updatedAt ? new Date(admin.updatedAt) : new Date()
      });
      await newAdmin.save();
      console.log(`   ✔ Admin: ${admin.email} (password hashed)`);
    } else {
      console.log(`   ⏭  Admin exists: ${admin.email}`);
    }
  }

  // ── 3. CATEGORIES — pass 1: create all ───────────────
  console.log('\n📦 Migrating categories (pass 1: create)...');
  const categoriesJSON = readJSON('categories.json');
  for (const cat of categoriesJSON) {
    let doc = await Category.findOne({ slug: cat.slug });
    if (!doc) {
      doc = await Category.create({
        title: cat.title,
        slug: cat.slug,
        metaTitle: cat.metaTitle || '',
        metaDescription: cat.metaDescription || '',
        parent: null,
        status: cat.status || 'active',
        createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date()
      });
      console.log(`   ✔ Category: ${cat.title}`);
    } else {
      console.log(`   ⏭  Category exists: ${cat.title}`);
    }
    categoryIdMap.set(String(cat.id), doc._id);
  }

  // ── 4. CATEGORIES — pass 2: link parents ─────────────
  console.log('\n📦 Migrating categories (pass 2: link parents)...');
  for (const cat of categoriesJSON) {
    if (cat.parent) {
      const newCatId    = categoryIdMap.get(String(cat.id));
      const newParentId = categoryIdMap.get(String(cat.parent));
      if (newCatId && newParentId) {
        await Category.findByIdAndUpdate(newCatId, { parent: newParentId });
        console.log(`   ✔ Linked: ${cat.title} → parent`);
      }
    }
  }

  // ── 5. PRODUCTS ───────────────────────────────────────
  console.log('\n📦 Migrating products...');
  const productsJSON = readJSON('products.json');
  for (const product of productsJSON) {
    const exists = await Product.findOne({ slug: product.slug });
    if (!exists) {
      const categoryId    = categoryIdMap.get(String(product.category)) || null;
      const subcategoryId = categoryIdMap.get(String(product.subcategory)) || null;
      await Product.create({
        title: product.title,
        slug: product.slug,
        description: product.description || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        category: categoryId,
        subcategory: subcategoryId,
        status: product.status || 'active',
        images: product.images || [],
        specifications: product.specifications || [],
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date()
      });
      console.log(`   ✔ Product: ${product.title}`);
    } else {
      console.log(`   ⏭  Product exists: ${product.title}`);
    }
  }

  // ── 6. CMS ────────────────────────────────────────────
  console.log('\n📦 Migrating CMS pages...');
  const cmsJSON = readJSON('cms.json');
  for (const page of cmsJSON) {
    const exists = await CmsPage.findOne({ slug: page.slug });
    if (!exists) {
      await CmsPage.create({
        title: page.title,
        slug: page.slug,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        content: page.content || '',
        status: page.status || 'active',
        createdAt: page.createdAt ? new Date(page.createdAt) : new Date()
      });
      console.log(`   ✔ CMS page: ${page.title}`);
    } else {
      console.log(`   ⏭  CMS page exists: ${page.title}`);
    }
  }

  // ── 7. SETTINGS ───────────────────────────────────────
  console.log('\n📦 Migrating settings...');
  const s = readJSON('settings.json');
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      companyName:     s.companyName || '',
      websiteTitle:    s.websiteTitle || '',
      phone:           s.phone || '',
      email:           s.email || '',
      address:         s.address || '',
      pagination:      s.pagination || '10',
      logo:            s.logo || '',
      favicon:         s.favicon || '',
      ogImage:         s['OG Image'] || '',
      facebook:        s.facebook || '',
      instagram:       s.instagram || '',
      linkedin:        s.linkedin || '',
      copyright:       s.copyright || '',
      metaTitle:       s.metaTitle || '',
      metaDescription: s.metaDescription || ''
    });
    console.log('   ✔ Settings migrated');
  } else {
    console.log('   ⏭  Settings already exist');
  }

  // ── 8. INQUIRIES ──────────────────────────────────────
  console.log('\n📦 Migrating inquiries...');
  const inquiriesJSON = readJSON('inquiries.json');
  for (const inquiry of inquiriesJSON) {
    await Inquiry.create({
      name:      inquiry.name,
      email:     inquiry.email,
      phone:     inquiry.phone || '',
      subject:   inquiry.subject || '',
      message:   inquiry.message,
      status:    inquiry.status || 'new',
      createdAt: inquiry.createdAt ? new Date(inquiry.createdAt) : new Date()
    });
    console.log(`   ✔ Inquiry from: ${inquiry.name}`);
  }

  console.log('\n🎉 Migration complete!\n');
  await mongoose.connection.close();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
