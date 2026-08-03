// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");
// const ApiError = require("../utils/ApiError");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "products",
//     allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
//     public_id: (req, file) => {
//       return `${Date.now()}-${file.originalname
//         .split(".")[0]
//         .replace(/\s+/g, "-")}`;
//     },
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     "image/gif",
//     "image/svg+xml",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new ApiError(400, "Only image files are allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// module.exports = { upload };




// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const crypto = require("crypto");
// const ApiError = require("../utils/ApiError");

// const uploadDir = path.join(__dirname, "../uploads");

// // Create uploads folder if not exists
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Store file in memory first
// const storage = multer.memoryStorage();

// // Image validation
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/webp",
//     "image/gif",
//     "image/svg+xml",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new ApiError(400, "Only image files are allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// // Duplicate Image Checker
// const saveImage = (req, res, next) => {
//   try {
//     if (!req.file) return next();

//     const buffer = req.file.buffer;

//     // Current image hash
//     const currentHash = crypto
//       .createHash("md5")
//       .update(buffer)
//       .digest("hex");

//     const files = fs.readdirSync(uploadDir);

//     // Check duplicate image content
//     for (const file of files) {
//       const filePath = path.join(uploadDir, file);

//       if (!fs.statSync(filePath).isFile()) continue;

//       const existingBuffer = fs.readFileSync(filePath);

//       const existingHash = crypto
//         .createHash("md5")
//         .update(existingBuffer)
//         .digest("hex");

//       if (existingHash === currentHash) {
//         console.log("✅ Duplicate Found:", file);

//         req.file.filename = file;
//         return next();
//       }
//     }

//     // New Image

//     const extension = path.extname(req.file.originalname);
//     const baseName = path.basename(req.file.originalname, extension);

//     let fileName = req.file.originalname.replace(/\s+/g, "-");
//     let uploadPath = path.join(uploadDir, fileName);

//     let counter = 1;

//     while (fs.existsSync(uploadPath)) {
//       fileName = `${baseName}-${counter}${extension}`;
//       uploadPath = path.join(uploadDir, fileName);
//       counter++;
//     }
//     console.log("🆕 Saving New Image:", fileName);

//     fs.writeFileSync(uploadPath, buffer);

//     req.file.filename = fileName;

//     next();
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   upload,
//   saveImage,
// };


const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

const uploadDir = path.join(__dirname, "../uploads");

// Store file in memory first
const storage = multer.memoryStorage();

// Image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Dynamic Duplicate Image Checker & Custom Subfolder Saver
const saveImage = (req, res, next) => {
  try {
    if (!req.file) return next();

    // 1. Resolve dynamic category subfolder from route params (e.g., /api/products/upload/:category)
    const categoryFolder = req.params.category || "general";
    const cleanFolderName = categoryFolder.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const targetUploadDir = path.join(uploadDir, cleanFolderName);

    // 2. Ensure the specific category subfolder exists
    if (!fs.existsSync(targetUploadDir)) {
      fs.mkdirSync(targetUploadDir, { recursive: true });
    }

    const buffer = req.file.buffer;

    // Current image hash
    const currentHash = crypto
      .createHash("md5")
      .update(buffer)
      .digest("hex");

    // 3. Scan ONLY inside the specific category folder for duplicates
    const files = fs.existsSync(targetUploadDir) ? fs.readdirSync(targetUploadDir) : [];

    // Check duplicate image content
    for (const file of files) {
      const filePath = path.join(targetUploadDir, file);

      if (!fs.statSync(filePath).isFile()) continue;

      const existingBuffer = fs.readFileSync(filePath);

      const existingHash = crypto
        .createHash("md5")
        .update(existingBuffer)
        .digest("hex");

      if (existingHash === currentHash) {
        console.log("✅ Duplicate Found in subfolder:", file);
        // Save relative path with folder so controller handles DB entry properly
        req.file.filename = `${cleanFolderName}/${file}`;
        return next();
      }
    }

    // New Image Process (Maintains original filename structures)
    const extension = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, extension);

    let fileName = req.file.originalname.replace(/\s+/g, "-");
    let uploadPath = path.join(targetUploadDir, fileName);

    let counter = 1;

    // Increment duplicate filenames safely within this directory loop
    while (fs.existsSync(uploadPath)) {
      fileName = `${baseName}-${counter}${extension}`;
      uploadPath = path.join(targetUploadDir, fileName);
      counter++;
    }
    
    console.log(`🆕 Saving New Image inside [${cleanFolderName}]:`, fileName);

    // Write file directly to its category subfolder
    fs.writeFileSync(uploadPath, buffer);

    // Attach path value back to req.file context for the backend controller
    req.file.filename = `${cleanFolderName}/${fileName}`;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  saveImage,
};