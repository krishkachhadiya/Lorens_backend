const Category = require('../models/Category.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');
const { buildTree } = require('../services/category.service');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: 1 });
  return res.json(categories);
});

const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await Category.find({ status: 'active' });
  const tree = buildTree(categories);
  return success(res, { tree }, 'Category tree fetched');
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate('parent');
  if (!category) throw new ApiError(404, 'Category not found');
  return success(res, { category }, 'Category fetched');
});

const createCategory = asyncHandler(async (req, res) => {
  let { title, slug, metaTitle, metaDescription, parent, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim())  throw new ApiError(400, 'Slug is required');

  const slugExists = await Category.findOne({ slug: slug.trim().toLowerCase() });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const titleExists = await Category.findOne({ title: { $regex: new RegExp(`^${title.trim()}$`, 'i') } });
  if (titleExists) throw new ApiError(400, 'Category already exists');

  const category = await Category.create({
    title: title.trim(),
    slug: slug.trim().toLowerCase(),
    metaTitle: metaTitle || '',
    metaDescription: metaDescription || '',
    parent: parent || null,
    status: status || 'active'
  });

  return success(res, { category }, 'Category Added Successfully', 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  let { title, slug, metaTitle, metaDescription, parent, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim())  throw new ApiError(400, 'Slug is required');

  const slugExists = await Category.findOne({ slug: slug.toLowerCase(), _id: { $ne: req.params.id } });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  if (parent && parent.toString() === req.params.id) {
    throw new ApiError(400, 'Category cannot be its own parent');
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { title: title.trim(), slug: slug.toLowerCase(), metaTitle, metaDescription, parent: parent || null, status },
    { new: true, runValidators: true }
  );

  if (!category) throw new ApiError(404, 'Category not found');

  return success(res, { category }, 'Category Updated Successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const hasChildren = await Category.findOne({ parent: req.params.id });
  if (hasChildren) throw new ApiError(400, 'Cannot delete category with subcategories');

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  return success(res, {}, 'Category Deleted Successfully');
});

module.exports = { getCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory };
