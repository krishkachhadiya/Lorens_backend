const router = require('express').Router();
const { getCmsPages, getCmsPage, getCmsPageBySlug, createCmsPage, updateCmsPage, deleteCmsPage } = require('../controllers/cms.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.get('/',           getCmsPages);
router.get('/slug/:slug', getCmsPageBySlug);
router.get('/:id',        verifyToken, getCmsPage);
router.post('/',          verifyToken, checkPermission('cms', 'create'), createCmsPage);
router.put('/:id',        verifyToken, checkPermission('cms', 'edit'), updateCmsPage);
router.delete('/:id',     verifyToken, checkPermission('cms', 'delete'), deleteCmsPage);

module.exports = router;
