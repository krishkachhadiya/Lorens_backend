const router = require('express').Router();
const { 
  getEvents, 
  getEventById, 
  getEventBySlug, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/events.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.get('/',           getEvents);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id',        verifyToken, getEventById);
router.post('/',          verifyToken, checkPermission('events', 'create'), createEvent);
router.put('/:id',        verifyToken, checkPermission('events', 'edit'), updateEvent);
router.delete('/:id',     verifyToken, checkPermission('events', 'delete'), deleteEvent);

module.exports = router;