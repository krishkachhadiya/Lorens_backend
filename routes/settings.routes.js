const router = require('express').Router();
const { getSettings, updateSettings, deleteSettingKey } = require('../controllers/settings.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/permission.middleware');

router.get('/',        getSettings);
router.post('/',       verifyToken, requireAdmin, updateSettings);
router.post('/delete', verifyToken, requireAdmin, deleteSettingKey);

module.exports = router;
