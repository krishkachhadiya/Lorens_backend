const Role = require('../models/Role.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ createdAt: -1 });
  return success(res, { roles }, 'Roles fetched');
});

const getRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');
  return success(res, { role }, 'Role fetched');
});

const createRole = asyncHandler(async (req, res) => {
  let { name, permissions } = req.body;

  if (!name?.trim()) throw new ApiError(400, 'Role name is required');

  name = name.trim().toLowerCase();

  const exists = await Role.findOne({ name });
  if (exists) throw new ApiError(400, 'Role already exists');

  if (permissions?.categories) {
    permissions.subcategories = { ...permissions.categories };
  }

  const role = await Role.create({ name, permissions: permissions || {} });

  return success(res, { role }, 'Role Added Successfully', 201);
});

const updateRole = asyncHandler(async (req, res) => {
  let { name, permissions } = req.body;

  if (!name?.trim()) throw new ApiError(400, 'Role name is required');

  name = name.trim().toLowerCase();

  const exists = await Role.findOne({ name, _id: { $ne: req.params.id } });
  if (exists) throw new ApiError(400, 'Role name already taken');

  if (permissions?.categories) {
    permissions.subcategories = { ...permissions.categories };
  }

  const role = await Role.findByIdAndUpdate(
    req.params.id,
    { name, permissions },
    { new: true, runValidators: true }
  );

  if (!role) throw new ApiError(404, 'Role not found');

  return success(res, { role }, 'Role Updated Successfully');
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');
  return success(res, {}, 'Role Deleted Successfully');
});

module.exports = { getRoles, getRole, createRole, updateRole, deleteRole };
