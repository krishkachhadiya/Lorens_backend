const CmsPage = require('../models/CmsPage.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const getCmsPages = asyncHandler(async (req, res) => {
  const pages = await CmsPage.find().sort({ createdAt: -1 });
  return res.json(pages);
});

const getCmsPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findById(req.params.id);
  if (!page) throw new ApiError(404, 'Page not found');
  return success(res, { page }, 'Page fetched');
});

const getCmsPageBySlug = asyncHandler(async (req, res) => {
  const page = await CmsPage.findOne({ slug: req.params.slug, status: 'active' });
  if (!page) throw new ApiError(404, 'Page not found');
  return success(res, { page }, 'Page fetched');
});

const createCmsPage = asyncHandler(async (req, res) => {
  let { title, slug, metaTitle, metaDescription, content, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');
  if (!slug?.trim())  throw new ApiError(400, 'Slug is required');

  const slugExists = await CmsPage.findOne({ slug: slug.toLowerCase() });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const page = await CmsPage.create({
    title: title.trim(),
    slug: slug.toLowerCase(),
    metaTitle: metaTitle || '',
    metaDescription: metaDescription || '',
    content: content || '',
    status: status || 'active'
  });

  return success(res, { page }, 'Page Added Successfully', 201);
});

const updateCmsPage = asyncHandler(async (req, res) => {
  const { title, slug, metaTitle, metaDescription, content, status } = req.body;

  if (!title?.trim()) throw new ApiError(400, 'Title is required');

  const slugExists = await CmsPage.findOne({ slug: slug?.toLowerCase(), _id: { $ne: req.params.id } });
  if (slugExists) throw new ApiError(400, 'Slug already exists');

  const page = await CmsPage.findByIdAndUpdate(
    req.params.id,
    { title: title.trim(), slug: slug?.toLowerCase(), metaTitle, metaDescription, content, status },
    { new: true, runValidators: true }
  );

  if (!page) throw new ApiError(404, 'Page not found');

  return success(res, { page }, 'Page Updated Successfully');
});

const deleteCmsPage = asyncHandler(async (req, res) => {
  const page = await CmsPage.findByIdAndDelete(req.params.id);
  if (!page) throw new ApiError(404, 'Page not found');
  return success(res, {}, 'Page Deleted Successfully');
});

module.exports = { getCmsPages, getCmsPage, getCmsPageBySlug, createCmsPage, updateCmsPage, deleteCmsPage };
