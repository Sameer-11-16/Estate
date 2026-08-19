const express = require('express');
const router = express.Router();
const {
  createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry, getEnquiryStats,
} = require('../controllers/enquiryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', createEnquiry);
router.get('/', protect, adminOnly, getEnquiries);
router.get('/stats', protect, adminOnly, getEnquiryStats);
router.patch('/:id/status', protect, adminOnly, updateEnquiryStatus);
router.delete('/:id', protect, adminOnly, deleteEnquiry);

module.exports = router;
