const router = require('express').Router();
const rateLimit = require('express-rate-limit'); // 1. Import express-rate-limit
const { getInquiries, createInquiry, updateInquiryStatus, deleteInquiry } = require('../controllers/inquiry.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// 2. Define a strict rate limit ruleset for public form submissions
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes window
  max: 3, // Each unique IP address can only send 3 forms per window
  message: {
    success: false,
    message: "Too many requests from this device. Please try again after 15 minutes."
  },
  standardHeaders: true, // Sends RateLimit-Limit and RateLimit-Remaining headers
  legacyHeaders: false,  // Disables outdated X-RateLimit-* headers
});

// Admin routes (Protected by token)
router.get('/',       verifyToken, getInquiries);
router.put('/:id',    verifyToken, updateInquiryStatus);
router.delete('/:id', verifyToken, deleteInquiry);

// Public route (Protected by your new spam-boosting Rate Limiter)
router.post('/',      inquiryLimiter, createInquiry);

module.exports = router;