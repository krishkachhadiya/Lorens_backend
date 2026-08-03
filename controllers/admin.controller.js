const Admin = require('../models/Admin.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
  return success(res, { admins }, 'Admins fetched');
});

const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('-password');
  if (!admin) throw new ApiError(404, 'User Not Found');
  return success(res, { admin }, 'Admin fetched');
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !role?.trim()) {
    throw new ApiError(400, 'All fields are required');
  }

  const emailExists = await Admin.findOne({ email: email.toLowerCase() });
  if (emailExists) throw new ApiError(400, 'Email already exists');

  const nameExists = await Admin.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
  if (nameExists) throw new ApiError(400, 'Username already exists');

  const admin = await Admin.create({ name: name.trim(), email, password, role });

  const adminObj = admin.toObject();
  delete adminObj.password;

  return success(res, { admin: adminObj }, 'User Added Successfully', 201);
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || !email?.trim() || !role?.trim()) {
    throw new ApiError(400, 'Name, email and role are required');
  }

  const emailExists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
  if (emailExists) throw new ApiError(400, 'Email already exists');

  const nameExists = await Admin.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    _id: { $ne: req.params.id }
  });
  if (nameExists) throw new ApiError(400, 'Username already exists');

  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'User Not Found');

  admin.name = name.trim();
  admin.email = email;
  admin.role = role;
  if (password) admin.password = password;

  await admin.save();

  const adminObj = admin.toObject();
  delete adminObj.password;

  return success(res, { admin: adminObj }, 'User Updated Successfully');
});

const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.admin._id.toString() === req.params.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) throw new ApiError(404, 'User Not Found');

  return success(res, {}, 'User Deleted');
});

module.exports = { getAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin };
