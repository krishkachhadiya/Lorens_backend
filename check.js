require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin.model');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admins = await Admin.find().select('name email role password');
  console.log(JSON.stringify(admins, null, 2));
  process.exit();
});