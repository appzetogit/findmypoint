const FAQ = require('../models/FAQ');
const Business = require('../models/Business');

// @desc    Sync (Overwrite) all FAQs for a business
// @route   PUT /api/faqs/business/:businessId
// @access  Private
const syncBusinessFAQs = async (req, res) => {
  const { businessId } = req.params;
  const { faqs } = req.body; // Array of { question, answer }

  if (!businessId || !Array.isArray(faqs)) {
    return res.status(400).json({ success: false, message: 'Please provide businessId and faqs array' });
  }

  try {
    const business = await Business.findOne({ id: businessId });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business listing not found' });
    }

    // Check permission: Admin or Business Owner allowed
    const isAdmin = req.user.isAdmin === true;
    const isOwnBusiness = req.user.isBusiness === true && req.user.businessId === businessId;
    const isOwner = business.owner && business.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwnBusiness && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage FAQs for this business' });
    }

    // 1. Clear old FAQs for this business from dedicated collection
    await FAQ.deleteMany({ businessId });

    // 2. Insert new FAQs in dedicated collection
    const createdFaqs = [];
    for (const item of faqs) {
      if (!item.question || !item.answer) continue;
      const doc = await FAQ.create({
        businessId,
        question: item.question.trim(),
        answer: item.answer.trim()
      });
      createdFaqs.push(doc);
    }

    // 3. Update the embedded faqs array in Business for backward compatibility
    business.faqs = createdFaqs.map(f => ({
      question: f.question,
      answer: f.answer
    }));
    await business.save();

    res.status(200).json({ success: true, count: createdFaqs.length, data: createdFaqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all FAQs for a business
// @route   GET /api/faqs/business/:businessId
// @access  Public
const getBusinessFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ businessId: req.params.businessId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { syncBusinessFAQs, getBusinessFAQs };
