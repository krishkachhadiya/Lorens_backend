const Settings = require('../models/Settings.model');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return res.json({ success: true, data: settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // Map legacy "OG Image" key to ogImage
  if (body['OG Image']) {
    body.ogImage = body['OG Image'];
    delete body['OG Image'];
  }

  const settings = await Settings.findOneAndUpdate(
    {},
    { $set: body },
    { new: true, upsert: true, runValidators: true }
  );

  return success(res, { settings }, 'Settings saved successfully');
});

const deleteSettingKey = asyncHandler(async (req, res) => {
  const { key } = req.body;
  const unsetObj = {};
  unsetObj[key] = '';
  await Settings.findOneAndUpdate({}, { $unset: unsetObj });
  return success(res, {}, 'Setting key removed');
});

module.exports = { getSettings, updateSettings, deleteSettingKey };
