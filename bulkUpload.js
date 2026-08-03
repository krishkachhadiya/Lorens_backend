// ========================================================
// 1. CONFIGURATION
// ========================================================
const BASE_URL = 'http://localhost:5000/api'; 
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzEyOTljNGJiMDVlMTM2ZjAwMjc2MCIsImlhdCI6MTc4NDYxMDM5MCwiZXhwIjoxNzg1MjE1MTkwfQ.P4NEYQ8-ba0BRSye5rOMTPxcU4Cc8Kzx9w-6j_hiUKc'; // Replace with your actual admin JWT token

// ========================================================
// 2. INPUT PARAMETERS (Matches your pre-uploaded files)
// ========================================================
const INPUT = {
  collectionName: "Shower Arm",           // Prefix for titles (e.g., "Falcon FC-401")
  prefixCode: "SAC",                  // The system product code prefix
  startNumber: 11006,                  // The first item sequence number
  totalCount: 8,                    // Number of items to generate entries for
  
  // Database Targets
  categoryId: "6a60913e90ddb4d01ccbd907",         // Replace with your MongoDB ObjectId for this Category
  subcategory: null,
  
  // Pre-existing Folder Subdirectory
  folderParam: "Shower-Arm",  // The subfolder where images exist
};

// ========================================================
// 3. GENERATE TARGET PRODUCT LIST
// ========================================================
function generateProductList(config) {
  const products = [];
  
  for (let i = 0; i < config.totalCount; i++) {
    const currentNumber = config.startNumber + i;
    const codeString = `${config.prefixCode}-${currentNumber}`; // e.g., "FC-401"
    const titleString = `${config.collectionName} ${codeString}`; // e.g., "Falcon FC-401"
    
    // Matches the exact schema path structure required by your backend
    const savedImagePath = `${config.folderParam}/${config.prefixCode.toLowerCase()}-${currentNumber}.jpg`; // e.g., "falcon-collection/fc-401.jpg"

    products.push({
      productCode: codeString,
      title: titleString,
      slug: titleString.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: `<p>High-quality entry from the ${config.collectionName} collection line.</p>`,
      category: config.categoryId,
      subcategory: config.subcategory,
      status: "active",
      images: [savedImagePath], // Injects your pre-existing asset paths directly
      specifications: []
    });
  }
  
  return products;
}

// ========================================================
// 4. DATABASE INGESTION LOGIC
// ========================================================
async function createProductProfile(payload) {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload) // Directly passes the payload array to product.controller.js
    });

    const data = await response.json();
    if (response.ok || data.success) {
      console.log(`🎉 Record registered: ${payload.title} ➔ Attached: ${payload.images[0]}`);
    } else {
      console.error(`❌ Controller rejected data payload:`, data.message);
    }
  } catch (error) {
    console.error(`❌ Network error saving document to DB:`, error.message);
  }
}

// Execution Loop Wrapper
async function runAutoDataEntry() {
  const productsToImport = generateProductList(INPUT);
  
  console.log(`🚀 Ingestion Engine initialized.`);
  console.log(`Mapping ${productsToImport.length} database profiles directly to 'uploads/${INPUT.folderParam}/'\n`);
  
  for (let i = 0; i < productsToImport.length; i++) {
    const product = productsToImport[i];
    console.log(`--------------------------------------------------`);
    console.log(`Processing [${i + 1}/${productsToImport.length}]: ${product.title}`);

    // Directly create the product using the constructed image path
    await createProductProfile(product);
  }

  console.log(`\n🏁 Data entries created and synchronized with pre-existing images.`);
}

runAutoDataEntry();