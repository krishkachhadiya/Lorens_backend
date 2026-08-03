// const router = require('express').Router();
// const { uploadImage } = require('../controllers/upload.controller');
// const { upload } = require('../middleware/upload.middleware');
// const { verifyToken } = require('../middleware/auth.middleware');

// router.post('/', verifyToken, upload.single('file'), uploadImage);

// module.exports = router;


// const router = require("express").Router();

// const { uploadImage } = require("../controllers/upload.controller");
// const { upload, saveImage } = require("../middleware/upload.middleware");
// const { verifyToken } = require("../middleware/auth.middleware");

// router.post(
//   "/",
//   verifyToken,
//   upload.single("file"),
//   saveImage,
//   uploadImage
// );

// module.exports = router;


const router = require("express").Router();

const { uploadImage } = require("../controllers/upload.controller");
const { upload, saveImage } = require("../middleware/upload.middleware");
const { verifyToken } = require("../middleware/auth.middleware");

// 1. Added dynamic context parameter here: "/upload/:category" or "/:category"
// 2. Switched from "file" to "image" to match standard multi-part forms
router.post(
  "/:category",
  verifyToken,
  upload.single("image"), 
  saveImage,
  uploadImage
);

module.exports = router;