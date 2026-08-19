const express = require('express');
const router = express.Router();
const {
  getListings, getListingById, createListing, updateListing,
  deleteListing, updateStatus, toggleFeatured, getDistrictCounts,
  getPublicStats, getFilters, getStats,
} = require('../controllers/listingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/districts', getDistrictCounts);
router.get('/public-stats', getPublicStats);
router.get('/filters', getFilters);
router.get('/stats', protect, adminOnly, getStats);
router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 10), createListing);
router.put('/:id', protect, upload.array('images', 10), updateListing);
router.delete('/:id', protect, adminOnly, deleteListing);
router.patch('/:id/status', protect, adminOnly, updateStatus);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);

module.exports = router;
