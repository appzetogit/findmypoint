const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ServiceFormConfig = require('../models/ServiceFormConfig');
const ServiceBookingSubmission = require('../models/ServiceBookingSubmission');
const Business = require('../models/Business');
const User = require('../models/User');
const { slugify } = require('../utils/slugify');
const whatsappService = require('../services/whatsappService');

// Helper to verify caller owns the business listing or is an Admin
const verifyBusinessAccess = async (req, businessId) => {
  if (!req.user) return false;
  if (req.user.isAdmin === true) return true;
  if (req.user.isBusiness === true && req.user.businessId === businessId) return true;
  if (req.user._id) {
    const isObjectId = mongoose.isValidObjectId(businessId);
    const business = await Business.findOne({
      $or: [
        { id: businessId },
        { slug: slugify(businessId) },
        ...(isObjectId ? [{ _id: businessId }] : [])
      ]
    });
    if (business && (
      (business.owner && business.owner.toString() === req.user._id.toString()) ||
      (req.user.isBusiness && req.user.businessId === business.id)
    )) {
      return true;
    }
  }
  return false;
};

// @desc    Get form configuration by businessId
// @route   GET /api/service-forms/:businessId
// @access  Public
const getFormConfig = async (req, res) => {
  try {
    const config = await ServiceFormConfig.findOne({ businessId: req.params.businessId });
    if (!config) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update form configuration by businessId
// @route   POST /api/service-forms/:businessId
// @access  Private (Client Owner / Admin Auth)
const saveFormConfig = async (req, res) => {
  try {
    const { fields, bookNowEnabled, formTitle, formDescription } = req.body;
    const businessId = req.params.businessId;

    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to configure forms for this business' });
    }

    let config = await ServiceFormConfig.findOne({ businessId });

    if (config) {
      config.fields = fields;
      config.bookNowEnabled = bookNowEnabled;
      config.formTitle = formTitle;
      config.formDescription = formDescription;
      await config.save();
    } else {
      config = await ServiceFormConfig.create({
        businessId,
        fields,
        bookNowEnabled,
        formTitle,
        formDescription
      });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking submissions for a businessId
// @route   GET /api/service-forms/:businessId/submissions
// @access  Private (Client Owner / Admin Auth)
const getSubmissions = async (req, res) => {
  try {
    const { businessId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to view submissions for this business' });
    }

    const submissions = await ServiceBookingSubmission.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new booking submission
// @route   POST /api/service-forms/:businessId/submissions
// @access  Public
const createSubmission = async (req, res) => {
  try {
    const { id, businessName, data } = req.body;
    const businessId = req.params.businessId;

    if (!data) {
      return res.status(400).json({ success: false, message: 'Submission data is required' });
    }

    const formatDateTimeDMY = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Helper to safely extract candidate fields from dynamic payload
    const extractField = (obj, candidateKeys) => {
      if (!obj || typeof obj !== 'object') return '';
      for (const [key, val] of Object.entries(obj)) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const cand of candidateKeys) {
          if (cleanKey.includes(cand) && val) {
            return String(val).trim();
          }
        }
      }
      return '';
    };

    // Helper to clean 10-digit Indian phone number
    const extractPhoneDigits = (val) => {
      if (!val) return '';
      const str = String(val).trim();
      if (str.toUpperCase() === 'N/A' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return '';
      const digits = str.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) return digits.slice(-10);
      if (digits.length === 10) return digits;
      return '';
    };

    // Fetch business details early so we have biz.phone and biz.whatsapp to ensure we NEVER send to business
    let finalBizName = businessName;
    let bizLocation = '';
    let bizOwnerId = '';
    const businessNumbers = new Set();

    try {
      const isObjectId = mongoose.isValidObjectId(businessId);
      const biz = await Business.findOne({
        $or: [
          { id: businessId },
          { slug: slugify(businessId) },
          ...(isObjectId ? [{ _id: businessId }] : [])
        ]
      }).select('name address city phone whatsapp extraNumbers location owner');
      if (biz) {
        if (!finalBizName) finalBizName = biz.name;
        bizLocation = biz.address || biz.city || biz.location?.address || 'Indore, MP';
        if (biz.phone) {
          bizLocation += ` (Tel: ${biz.phone})`;
          const bp = extractPhoneDigits(biz.phone);
          if (bp) businessNumbers.add(bp);
        }
        if (biz.whatsapp) {
          const bw = extractPhoneDigits(biz.whatsapp);
          if (bw) businessNumbers.add(bw);
        }
        if (Array.isArray(biz.extraNumbers)) {
          biz.extraNumbers.forEach(n => {
            const bx = extractPhoneDigits(n);
            if (bx) businessNumbers.add(bx);
          });
        }
        if (biz.owner) {
          bizOwnerId = String(biz.owner);
          try {
            const ownerUser = await User.findById(biz.owner).select('mobile1 email');
            if (ownerUser && ownerUser.mobile1) {
              const bo = extractPhoneDigits(ownerUser.mobile1);
              if (bo) businessNumbers.add(bo);
            }
          } catch (_) { }
        }
      }
    } catch (bizErr) {
      console.warn('[ServiceForm] Business fetch error:', bizErr.message);
    }

    // Helper: Verify if a number belongs to the business or its owner
    const isBusinessNumber = (num) => {
      if (!num) return false;
      const clean = extractPhoneDigits(num);
      return Boolean(clean && businessNumbers.has(clean));
    };

    // 1. Identify customer phone number: check req.body (ignore if it matches business phone)
    let customerPhone = '';
    if (req.body.customerPhone && !isBusinessNumber(req.body.customerPhone)) {
      customerPhone = extractPhoneDigits(req.body.customerPhone);
    }

    // 2. Search candidate fields in dynamic data
    if (!customerPhone) {
      const cand = extractField(data, ['phone', 'mobile', 'contact', 'whatsapp', 'customerphone']);
      if (cand && !isBusinessNumber(cand)) {
        customerPhone = extractPhoneDigits(cand);
      }
    }

    // 3. Search all values in dynamic data for 10-digit phone
    if (!customerPhone) {
      for (const val of Object.values(data)) {
        const d = extractPhoneDigits(val);
        if (d && !isBusinessNumber(d)) {
          customerPhone = d;
          break;
        }
      }
    }

    // 4. Authenticated user fallback if token is present (ONLY if user is NOT the owner of this business)
    let authUser = req.user;
    if (!authUser && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token && process.env.JWT_SECRET) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded && (decoded.id || decoded._id)) {
            const uid = String(decoded.id || decoded._id);
            if (!bizOwnerId || uid !== bizOwnerId) {
              authUser = await User.findById(uid).select('firstName lastName mobile1 email');
            }
          }
        }
      } catch (_) { }
    }

    if (!customerPhone && authUser && authUser.mobile1 && !isBusinessNumber(authUser.mobile1)) {
      customerPhone = extractPhoneDigits(authUser.mobile1);
    }

    // Resolve customer name
    let customerName = (req.body.customerName && req.body.customerName !== 'Guest' && req.body.customerName !== 'Valued Customer' && req.body.customerName !== 'N/A')
      ? req.body.customerName
      : extractField(data, ['fullname', 'customername', 'yourname', 'name', 'clientname']) ||
        (authUser ? [authUser.firstName, authUser.lastName].filter(Boolean).join(' ') : '') ||
        'Valued Customer';

    // Backfill data object with resolved contact info if missing
    if (customerPhone && !data['Phone Number'] && !data['Phone'] && !data['Mobile']) {
      data['Phone Number'] = customerPhone;
    }
    if (customerName && customerName !== 'Valued Customer' && !data['Full Name'] && !data['Name']) {
      data['Full Name'] = customerName;
    }

    // Detect payment status and amount
    const rawAmount = req.body.amount || extractField(data, ['amount', 'price', 'total', 'fee', 'total amount']) || '';
    const cleanAmountNum = String(rawAmount).replace(/[^0-9.]/g, '');
    const amountVal = cleanAmountNum || rawAmount;

    const statusInBody = req.body.paymentStatus;
    const statusInData = extractField(data, ['paymentstatus', 'payment_status', 'payment status', 'status', 'payment']);
    const isExplicitlyPaid = Boolean(
      (statusInBody && String(statusInBody).toLowerCase().includes('paid')) ||
      (statusInData && String(statusInData).toLowerCase().includes('paid')) ||
      req.body.razorpayPaymentId ||
      (req.body.paymentId && req.body.paymentId !== 'COD')
    );
    const finalPaymentStatus = isExplicitlyPaid ? 'Paid' : (statusInBody || statusInData || 'Pending');
    data['Payment Status'] = finalPaymentStatus;

    const submission = await ServiceBookingSubmission.create({
      id: id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId,
      businessName: businessName || '',
      data,
      timestamp: formatDateTimeDMY(new Date())
    });

    // Instantly dispatch WhatsApp confirmation to customer ONLY if phone number is present and NOT the business's number
    if (customerPhone && !isBusinessNumber(customerPhone)) {
      const scheduleDate = extractField(data, ['date', 'slot', 'time']) || submission.timestamp || 'As Scheduled';

      console.log(`[ServiceForm] Instantly sending WhatsApp booking confirmation to customer: ${customerPhone} (Payment: ${finalPaymentStatus}, Amount: ${amountVal})`);
      whatsappService.sendDynamicServiceBookingConfirmation({
        phone: customerPhone,
        customerName,
        bookingId: submission.id,
        businessName: finalBizName || 'FindmyPoint Partner',
        serviceTitle: req.body.serviceTitle || req.body.formTitle || 'Service Request',
        dynamicDetails: data,
        schedule: scheduleDate,
        amount: amountVal,
        paymentStatus: finalPaymentStatus,
        location: bizLocation || 'Indore, MP'
      }).then(waRes => {
        console.log(`✅ [WhatsApp] Instant dynamic service booking notification sent to customer ${customerPhone}. MsgId:`, waRes?.response);
      }).catch(waErr => {
        console.warn(`⚠️ [WhatsApp] Dynamic service booking notification skipped:`, waErr.message);
      });
    } else {
      console.warn(`⚠️ [ServiceForm] No customer phone found or phone matched business phone for submission ${submission.id}. Business owner will NOT receive customer confirmation.`);
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking submission
// @route   DELETE /api/service-forms/:businessId/submissions/:submissionId
// @access  Private (Client Owner / Admin Auth)
const deleteSubmission = async (req, res) => {
  try {
    const { businessId, submissionId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete submissions for this business' });
    }

    const result = await ServiceBookingSubmission.findOneAndDelete({
      id: submissionId,
      businessId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.status(200).json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all booking submissions for a businessId
// @route   DELETE /api/service-forms/:businessId/submissions
// @access  Private (Client Owner / Admin Auth)
const clearSubmissions = async (req, res) => {
  try {
    const { businessId } = req.params;
    const hasAccess = await verifyBusinessAccess(req, businessId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Not authorized to clear submissions for this business' });
    }

    await ServiceBookingSubmission.deleteMany({ businessId });
    res.status(200).json({ success: true, message: 'All submissions cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stats for client dashboard (number of bookings and enquiries)
// @route   GET /api/service-forms/stats/overview
// @access  Private
const getClientStats = async (req, res) => {
  try {
    const Enquiry = require('../models/Enquiry');

    // Find businesses belonging to this user
    let query = {};
    if (req.user && !req.user.isAdmin) {
      // User is client owner
      if (req.user.isBusiness) {
        query = { id: req.user.businessId };
      } else {
        query = { owner: req.user._id };
      }
    }

    const businesses = await Business.find(query);
    const businessSlugs = businesses.map(b => b.id);

    // Sum up submissions and enquiries
    const submissionCount = await ServiceBookingSubmission.countDocuments({ businessId: { $in: businessSlugs } });
    const enquiriesCount = await Enquiry.countDocuments({ businessId: { $in: businessSlugs } });

    res.status(200).json({
      success: true,
      data: {
        bookings: submissionCount,
        enquiries: enquiriesCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFormConfig,
  saveFormConfig,
  getSubmissions,
  createSubmission,
  deleteSubmission,
  clearSubmissions,
  getClientStats
};
