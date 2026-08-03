// 🟢 Keep this at the absolute top so local Wi-Fi never blocks your Atlas connection
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

require('dotenv').config(); // Line 1: Variables load safely

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});