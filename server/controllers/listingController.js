const Listing = require('../models/Listing');

// @desc    Get all listings (with filters + pagination)
// @route   GET /api/listings
const getListings = async (req, res) => {
  try {
    const {
      district, landType, minPrice, maxPrice,
      minArea, maxArea, roadFacing, status,
      sort, page = 1, limit = 12, search, featured,
    } = req.query;

    const filter = {};

    // Only show available by default (non-admin)
    if (!req.query.admin) filter.status = 'Available';
    if (status && status !== 'All') filter.status = status;
    if (featured === 'true') filter.isFeatured = true;
    if (district && district !== 'All Districts') filter.district = new RegExp(`^${district}$`, 'i');
    if (landType && landType !== 'All Types') filter.landType = landType;
    if (roadFacing === 'true') filter.roadFacing = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
      filter.area = {};
      if (minArea) filter.area.$gte = Number(minArea);
      if (maxArea) filter.area.$lte = Number(maxArea);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      areaAsc: { area: 1 },
      areaDesc: { area: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name phone email avatar')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single listing + increment views
// @route   GET /api/listings/:id
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name phone email avatar');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create listing (authenticated users)
// @route   POST /api/listings
const createListing = async (req, res) => {
  try {
    const data = { ...req.body, seller: req.user._id };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Parse arrays/booleans sent as strings
    if (typeof data.nearbyLandmarks === 'string') {
      data.nearbyLandmarks = data.nearbyLandmarks
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (typeof data.coordinates === 'string') {
      try { data.coordinates = JSON.parse(data.coordinates); } catch {}
    }
    if (data.roadFacing === 'true' || data.roadFacing === true) {
      data.roadFacing = true;
    } else if (data.roadFacing === 'false' || data.roadFacing === false) {
      data.roadFacing = false;
    }
    if (data.negotiable === 'true' || data.negotiable === true) {
      data.negotiable = true;
    } else if (data.negotiable === 'false' || data.negotiable === false) {
      data.negotiable = false;
    }

    const listing = await Listing.create(data);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Only owner or admin can update
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    if (data.price && data.area) {
      data.pricePerUnit = Math.round(Number(data.price) / Number(data.area));
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete listing (admin only)
// @route   DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update listing status (approve/reject/sold)
// @route   PATCH /api/listings/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Toggle featured
// @route   PATCH /api/listings/:id/featured
const toggleFeatured = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    listing.isFeatured = !listing.isFeatured;
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get district counts & preview images for popular locations
// @route   GET /api/listings/districts
const getDistrictCounts = async (req, res) => {
  try {
    const counts = await Listing.aggregate([
      { $match: { status: 'Available' } },
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 },
          sampleImage: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Public platform statistics (Dynamic for Home Page Hero)
// @route   GET /api/listings/public-stats
const getPublicStats = async (req, res) => {
  try {
    const [totalActive, totalSold, totalViews, distinctDistricts] = await Promise.all([
      Listing.countDocuments({ status: 'Available' }),
      Listing.countDocuments({ status: 'Sold' }),
      Listing.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Listing.distinct('district', { status: 'Available' }),
    ]);

    res.json({
      activeListings: totalActive,
      districtsCount: distinctDistricts.length || 14,
      soldCount: totalSold,
      totalViews: totalViews[0]?.total || 0,
      listingFee: '₹0',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Dynamic filter options (Districts & Land Types)
// @route   GET /api/listings/filters
const getFilters = async (req, res) => {
  try {
    const [districts, landTypes] = await Promise.all([
      Listing.distinct('district'),
      Listing.distinct('landType'),
    ]);
    res.json({
      districts: districts.filter(Boolean),
      landTypes: landTypes.filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Admin stats
// @route   GET /api/listings/stats
const getStats = async (req, res) => {
  try {
    const [total, pending, available, sold, featured] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'Pending' }),
      Listing.countDocuments({ status: 'Available' }),
      Listing.countDocuments({ status: 'Sold' }),
      Listing.countDocuments({ isFeatured: true }),
    ]);
    res.json({ total, pending, available, sold, featured });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateStatus,
  toggleFeatured,
  getDistrictCounts,
  getPublicStats,
  getFilters,
  getStats,
};
