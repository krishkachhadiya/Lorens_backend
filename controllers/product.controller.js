// const Product = require('../models/Product.model');
// const asyncHandler = require('../utils/asyncHandler');
// const ApiError = require('../utils/ApiError');
// const { success } = require('../utils/ApiResponse');

// const cleanMeta = (str) => str?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';

// const getProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find()
//     .populate('category', 'title slug')
//     .populate('subcategory', 'title slug')
//     .sort({ createdAt: -1 });
//   return res.json(products);
// });

// const getProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id)
//     .populate('category')
//     .populate('subcategory');
//   if (!product) throw new ApiError(404, 'Product not found');
//   return success(res, { product }, 'Product fetched');
// });

// const getProductBySlug = asyncHandler(async (req, res) => {
//   const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
//     .populate('category')
//     .populate('subcategory');
//   if (!product) throw new ApiError(404, 'Product not found');
//   return success(res, { product }, 'Product fetched');
// });

// const createProduct = asyncHandler(async (req, res) => {
//   // Changed productId to productCode
//   let { productCode, title, slug, description, metaTitle, metaDescription, category, subcategory, status, images, specifications } = req.body;

//   // Validations updated for productCode
//   if (!productCode?.trim()) throw new ApiError(400, "Product Code is required");
//   if (!title?.trim()) throw new ApiError(400, 'Title is required');
//   if (!slug?.trim()) throw new ApiError(400, 'Slug is required');

//   // Check unique key rule against productCode
//   const productCodeExists = await Product.findOne({ productCode: productCode.trim() });
//   if (productCodeExists) { throw new ApiError(400, "Product Code already exists"); }

//   const titleExists = await Product.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
//   if (titleExists) throw new ApiError(400, 'Product already exists');

//   const slugExists = await Product.findOne({ slug: slug.trim().toLowerCase() });
//   if (slugExists) throw new ApiError(400, 'Slug already exists');

//   const product = await Product.create({
//     productCode: productCode.trim(), // Insert key changed
//     title: title.trim(),
//     slug: slug.trim().toLowerCase(),
//     description: description || '',
//     metaTitle: cleanMeta(metaTitle),
//     metaDescription: cleanMeta(metaDescription),
//     category: category || null,
//     subcategory: subcategory || null,
//     status: status || 'active',
//     images: images || [],
//     specifications: specifications || []
//   });

//   return success(res, { product }, 'Product Added Successfully', 201);
// });

// const updateProduct = asyncHandler(async (req, res) => {
//   // Changed productId to productCode
//   const { productCode, title, slug, description, metaTitle, metaDescription, category, subcategory, status, images, specifications } = req.body;

//   // Validation updated for productCode
//   if (!productCode?.trim()) throw new ApiError(400, "Product Code is required");

//   // Check uniqueness exclusion for productCode during updates
//   const productCodeExists = await Product.findOne({
//     productCode: productCode.trim(),
//     _id: { $ne: req.params.id },
//   });

//   if (productCodeExists) {
//     throw new ApiError(400, "Product Code already exists");
//   }

//   if (!title?.trim()) throw new ApiError(400, 'Title is required');

//   const titleExists = await Product.findOne({
//     title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
//     _id: { $ne: req.params.id }
//   });
//   if (titleExists) throw new ApiError(400, 'Product title already taken');

//   if (slug) {
//     const slugExists = await Product.findOne({ slug: slug.toLowerCase(), _id: { $ne: req.params.id } });
//     if (slugExists) throw new ApiError(400, 'Slug already exists');
//   }

//   const product = await Product.findByIdAndUpdate(
//     req.params.id,
//     {
//       productCode: productCode.trim(), // Update tracking changed
//       title: title.trim(), 
//       slug: slug?.toLowerCase(),
//       description, 
//       metaTitle: cleanMeta(metaTitle),
//       metaDescription: cleanMeta(metaDescription),
//       category: category || null, 
//       subcategory: subcategory || null,
//       status, 
//       images, 
//       specifications
//     },
//     { new: true, runValidators: true }
//   );

//   if (!product) throw new ApiError(404, 'Product not found');

//   return success(res, { product }, 'Product Updated Successfully');
// });

// const deleteProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (!product) throw new ApiError(404, 'Product not found');
//   return success(res, {}, 'Product Deleted Successfully');
// });

// module.exports = { getProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct };



const Product = require('../models/Product.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const cleanMeta = (str) => str?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';

// Normalize an incoming `category` payload (which may arrive as a single id,
// an array of ids, null, or undefined) into a clean array of ids for storage
// against the Product.category array field.
const normalizeCategoryArray = (category) => {
  if (Array.isArray(category)) {
    return category.filter(Boolean);
  }
  if (category) {
    return [category];
  }
  return [];
};

const getProducts = asyncHandler(async (req, res) => {
  // Optional category filtering: /api/products?category=<id>
  // or /api/products?category=<id1>,<id2> for multiple category ids.
  // Because `category` is now an array field, matching against it uses
  // MongoDB's $in operator so a product matches if ANY of its assigned
  // categories is included in the requested set.
  const filter = {};
  if (req.query.category) {
    const categoryIds = String(req.query.category)
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (categoryIds.length) {
      filter.category = { $in: categoryIds };
    }
  }

  const products = await Product.find(filter)
    .populate('category', 'title slug')
    .populate('subcategory', 'title slug')
    .sort({ createdAt: -1 });
  return res.json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category')
    .populate('subcategory');
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, { product }, 'Product fetched');
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
    .populate('category')
    .populate('subcategory');
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, { product }, 'Product fetched');
});

const createProduct = asyncHandler(async (req, res) => {
  // 🌟 1. Capture 'images' directly from the frontend request body payload
  let { 
    productCode, 
    title, 
    slug, 
    description, 
    metaTitle, 
    metaDescription, 
    category, 
    subcategory, 
    status, 
    images, // 🌟 Added here
    specifications 
  } = req.body;

  // Validations updated for productCode
  if (!productCode?.trim()) throw new ApiError(400, "Product Code is required");
  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim()) throw new ApiError(400, 'Slug is required');

  // Check unique key rule against productCode
  const productCodeExists = await Product.findOne({ productCode: productCode.trim() });
  if (productCodeExists) { throw new ApiError(400, "Product Code already exists"); }

  const titleExists = await Product.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
  if (titleExists) throw new ApiError(400, 'Product already exists');

  const slugExists = await Product.findOne({ slug: slug.trim().toLowerCase() });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  // 🌟 2. Direct creation using the frontend image array array values
  const product = await Product.create({
    productCode: productCode.trim(), 
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    description: description || '',
    metaTitle: cleanMeta(metaTitle),
    metaDescription: cleanMeta(metaDescription),
    category: normalizeCategoryArray(category),
    subcategory: subcategory || null,
    status: status || 'active',
    images: images || [], // 🌟 Safely map the tracking string array here
    specifications: specifications || []
  });

  return success(res, { product }, 'Product Added Successfully', 201);
});
const updateProduct = asyncHandler(async (req, res) => {
  const { productCode, title, slug, description, metaTitle, metaDescription, category, subcategory, status, images, specifications } = req.body;

  if (!productCode?.trim()) throw new ApiError(400, "Product Code is required");

  const productCodeExists = await Product.findOne({
    productCode: productCode.trim(),
    _id: { $ne: req.params.id },
  });

  if (productCodeExists) {
    throw new ApiError(400, "Product Code already exists");
  }

  if (!title?.trim()) throw new ApiError(400, 'Title is required');

  const titleExists = await Product.findOne({
    title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
    _id: { $ne: req.params.id }
  });
  if (titleExists) throw new ApiError(400, 'Product title already taken');

  if (slug) {
    const slugExists = await Product.findOne({ slug: slug.toLowerCase(), _id: { $ne: req.params.id } });
    if (slugExists) throw new ApiError(400, 'Slug already exists');
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      productCode: productCode.trim(), 
      title: title.trim(), 
      slug: slug?.toLowerCase(),
      description, 
      metaTitle: cleanMeta(metaTitle),
      metaDescription: cleanMeta(metaDescription),
      category: normalizeCategoryArray(category), 
      subcategory: subcategory || null,
      status, 
      images, 
      specifications
    },
    { new: true, runValidators: true }
  );

  if (!product) throw new ApiError(404, 'Product not found');

  return success(res, { product }, 'Product Updated Successfully');
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  return success(res, {}, 'Product Deleted Successfully');
});

module.exports = { getProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct };