const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ========================
// MIDDLEWARE
// ======================== 
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://lorens-frontend.vercel.app",
      "https://lorens-frontend-gold.vercel.app",
    ],
    credentials: true,
  })
);app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// STATIC FILES (uploads)
// ========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// ROUTES
// ========================
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/admins',     require('./routes/admin.routes'));
app.use('/api/roles',      require('./routes/role.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products',   require('./routes/product.routes'));
app.use('/api/cms',        require('./routes/cms.routes'));
app.use('/api/settings',   require('./routes/settings.routes'));
app.use('/api/inquiries',  require('./routes/inquiry.routes'));
app.use('/api/products/upload',     require('./routes/upload.routes'));
app.use('/api/products',   require('./routes/product.routes'));
// ========================
// REACT BUILD
// ========================
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ========================
// GLOBAL ERROR HANDLER
// ========================
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Server Error' });
});

module.exports = app;
