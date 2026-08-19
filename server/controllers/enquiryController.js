const Enquiry = require('../models/Enquiry');

// @desc    Create enquiry
// @route   POST /api/enquiries
const createEnquiry = async (req, res) => {
  try {
    const { listing, name, email, phone, message, contactPreference } = req.body;
    if (!listing || !name || !email || !phone) {
      return res.status(400).json({ message: 'listing, name, email and phone are required' });
    }
    const enquiry = await Enquiry.create({ listing, name, email, phone, message, contactPreference });
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiries
const getEnquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate('listing', 'title location district images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Enquiry.countDocuments(filter),
    ]);

    res.json({ enquiries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update enquiry status
// @route   PATCH /api/enquiries/:id/status
const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete enquiry
// @route   DELETE /api/enquiries/:id
const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get enquiry stats (admin)
const getEnquiryStats = async (req, res) => {
  try {
    const [total, newCount, responded] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Enquiry.countDocuments({ status: 'Responded' }),
    ]);
    res.json({ total, new: newCount, responded });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createEnquiry, getEnquiries, updateEnquiryStatus, deleteEnquiry, getEnquiryStats };
