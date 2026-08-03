const BASE_URL = 'http://localhost:5000/api'; 
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzEyOTljNGJiMDVlMTM2ZjAwMjc2MCIsImlhdCI6MTc4Mjk5NDY2NywiZXhwIjoxNzgzNTk5NDY3fQ.aV3TxSv1L4YNTteq54KJye9Lw6RED_SBVabm-WqUJdc';

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product.model");

async function deleteProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Paste Category ID here
    const categoryId = "6a45efec1ed9aa86030852d3";

    const result = await Product.deleteMany({
      $or: [
        { category: categoryId },
        { subcategory: categoryId },
      ],
    });

    console.log(`✅ Deleted ${result.deletedCount} products`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteProducts();