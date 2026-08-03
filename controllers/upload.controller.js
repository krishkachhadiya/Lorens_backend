// const asyncHandler = require("../utils/asyncHandler");
// const ApiError = require("../utils/ApiError");
// const { success } = require("../utils/ApiResponse");

// const uploadImage = asyncHandler(async (req, res) => {
//   if (!req.file) {
//     throw new ApiError(400, "No file uploaded");
//   }

//   return success(
//     res,
//     {
//       imageUrl: req.file.path,
//     },
//     "Image uploaded successfully"
//   );
// });

// module.exports = { uploadImage };


const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  // Forces leading slash consistency cleanly matching your app.js path maps
  const imageUrl = `/uploads/${req.file.filename}`;

  // Bypass the nested success wrapper logic layout 
  // explicitly return a flat response that matches frontend selectors
  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    imageUrl: imageUrl
  });
});

module.exports = {
  uploadImage,
};