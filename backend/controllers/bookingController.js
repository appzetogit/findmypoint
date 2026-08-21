const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// @desc    Get all bookings (All for Admin, user-specific for regular users)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query = {};
    if (!req.user.isAdmin) {
      if (req.user.isBusiness) {
        query = { businessId: req.user.businessId };
      } else {
        query = { userId: req.user._id };
      }
    }

    const bookings = await Booking.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new booking/appointment
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const {
    id,
    businessId, businessName, category, service, date, time, amount, location,
    customerName, customerPhone, customerEmail, customerAddress,
    items, formData, bookingType, paymentId, paymentMethod, paymentStatus
  } = req.body;

  // Only businessName and amount are strictly required.
  if (!businessName || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide businessName and amount' });
  }

  // Sanitize customerPhone & email
  const cleanPhone = customerPhone ? String(customerPhone).replace(/\D/g, '').slice(-10) : '';
  const cleanEmail = customerEmail ? String(customerEmail).trim().toLowerCase() : '';

  try {
    // Generate a collision-resistant ID BKxxxxxx
    const bookingId = id || `BK${Date.now()}${Math.floor(10 + Math.random() * 90)}`;
    const isCOD = paymentMethod === 'COD' || paymentId === 'COD';
    const cleanPaymentId = isCOD ? '' : (paymentId && paymentId !== 'COD' ? paymentId : '');
    const cleanPaymentStatus = isCOD ? 'pending' : (cleanPaymentId ? 'paid' : (paymentStatus || 'pending'));

    const booking = await Booking.create({
      id: bookingId,
      businessId: businessId || '',
      businessName,
      category: category || '',
      service: service || '',
      date: date || '',
      time: time || '',
      amount: Number(amount) || 0,
      location: location || '',
      customerName: (customerName || '').trim(),
      customerPhone: cleanPhone || (customerPhone || ''),
      customerEmail: cleanEmail,
      customerAddress: (customerAddress || '').trim(),
      items: Array.isArray(items) ? items : [],
      formData: formData && typeof formData === 'object' ? formData : {},
      bookingType: bookingType || 'service',
      paymentId: cleanPaymentId,
      paymentMethod: paymentMethod || (isCOD ? 'COD' : 'Online'),
      paymentStatus: cleanPaymentStatus,
      userId: req.user._id,
      status: isCOD ? 'pending' : (cleanPaymentId ? 'confirmed' : 'pending')
    });

    // Record Transaction immediately for both online paid and COD bookings
    try {
      const isPaid = !isCOD && (cleanPaymentStatus === 'paid' || (cleanPaymentId && cleanPaymentId.startsWith('pay_')));
      let existingTxn = await Transaction.findOne({ bookingId: booking.id });
      if (existingTxn) {
        existingTxn.amount = booking.amount;
        existingTxn.status = isPaid ? 'Completed' : 'Pending';
        existingTxn.paymentMethod = booking.paymentMethod || (isCOD ? 'COD' : 'Online');
        existingTxn.type = 'debit';
        await existingTxn.save();
      } else {
        const txnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const timestamp = new Date().toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) + `, ` + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });
        await Transaction.create({
          id: txnId,
          timestamp,
          description: booking.service ? `${booking.service}` : `Booking - ${booking.businessName}`,
          businessName: booking.businessName,
          businessId: booking.businessId,
          bookingId: booking.id,
          customerName: booking.customerName || 'Customer',
          details: booking.service ? `${booking.service} at ${booking.businessName}` : `Payment for ${booking.businessName}`,
          amount: booking.amount,
          type: 'debit',
          paymentMethod: booking.paymentMethod || (isCOD ? 'COD' : 'Online'),
          status: isPaid ? 'Completed' : 'Pending',
          userId: booking.userId
        });
      }
    } catch (txnErr) {
      console.error('Warning: Failed to create initial transaction for booking:', txnErr.message);
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (confirmed, pending, cancelled, completed)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  if (!status || !['confirmed', 'pending', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid status value' });
  }

  try {
    let booking = await Booking.findOne({ id: req.params.id });
    if (!booking && req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization (Must be booking owner, Admin, or the Business itself)
    const isAuthorizedOwner = (booking.userId && req.user && req.user._id) ? booking.userId.toString() === req.user._id.toString() : false;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this booking status' });
    }

    booking.status = status;
    await booking.save();

    // Synchronize transaction status when booking status changes
    try {
      const existingTxn = await Transaction.findOne({ bookingId: booking.id });
      if (existingTxn) {
        if (status === 'completed') {
          existingTxn.status = 'Completed';
          await existingTxn.save();
        } else if (status === 'cancelled') {
          existingTxn.status = booking.paymentStatus === 'refunded' ? 'Refunded' : 'Cancelled';
          await existingTxn.save();
        }
      } else if (status === 'completed') {
        const txnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const timestamp = new Date().toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) + `, ` + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });
        await Transaction.create({
          id: txnId,
          timestamp,
          description: booking.service || `Booking - ${booking.businessName}`,
          businessName: booking.businessName,
          businessId: booking.businessId,
          bookingId: booking.id,
          customerName: booking.customerName || 'Customer',
          details: `Payment for ${booking.service || booking.businessName}`,
          amount: booking.amount,
          type: 'debit',
          paymentMethod: booking.paymentMethod || 'Online',
          status: 'Completed',
          userId: booking.userId
        });
      }
    } catch (txnErr) {
      console.error('Warning: Failed to sync transaction on booking status change:', txnErr.message);
    }

    if (status === 'completed') {
      // Emit socket review request
      const io = req.app.get('io');
      const activeSockets = req.app.get('activeSockets');
      if (io && activeSockets) {
        const userIdStr = booking.userId.toString();
        const socketIds = activeSockets.get(userIdStr);
        if (socketIds && socketIds.size > 0) {
          console.log(`Emitting request_review to user ${userIdStr} sockets:`, Array.from(socketIds));
          socketIds.forEach(socketId => {
            io.to(socketId).emit('request_review', {
              bookingId: booking.id,
              businessId: booking.businessId,
              businessName: booking.businessName,
              service: booking.service || 'Service Booking'
            });
          });
        }
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Collect payment for a COD booking and settle commission/transaction
// @route   PUT /api/bookings/:id/collect-payment
// @access  Private
const collectPayment = async (req, res) => {
  try {
    let booking = await Booking.findOne({ id: req.params.id });
    if (!booking && req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAuthorizedOwner = (booking.userId && req.user && req.user._id) ? booking.userId.toString() === req.user._id.toString() : false;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to collect payment for this booking' });
    }

    // BUG-012: Guard against double-payment collection
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment has already been collected for this booking.' });
    }

    // Mark booking payment status as paid
    booking.paymentStatus = 'paid';
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
    }
    await booking.save();

    // Create / settle transaction record in DB
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const txnId = `TXN-${Date.now()}-${rand}`;

    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + `, ` + new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let existingTxn = await Transaction.findOne({ bookingId: booking.id });
    if (existingTxn) {
      existingTxn.status = 'Completed';
      existingTxn.paymentMethod = booking.paymentMethod || 'COD';
      existingTxn.type = 'debit';
      await existingTxn.save();
    } else {
      await Transaction.create({
        id: txnId,
        timestamp,
        description: booking.service || `COD Payment Collected - ${booking.businessName}`,
        businessName: booking.businessName,
        businessId: booking.businessId,
        bookingId: booking.id,
        customerName: booking.customerName || 'Customer',
        details: `Cash payment collected for ${booking.service || booking.businessName}`,
        amount: booking.amount,
        type: 'debit',
        paymentMethod: booking.paymentMethod || 'COD',
        status: 'Completed',
        userId: booking.userId || (req.user ? req.user._id : undefined)
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("collectPayment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refund a cancelled booking's payment
// @route   PUT /api/bookings/:id/refund
// @access  Private
const refundBooking = async (req, res) => {
  try {
    let booking = await Booking.findOne({ id: req.params.id });
    if (!booking && req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAuthorizedOwner = (booking.userId && req.user && req.user._id) ? booking.userId.toString() === req.user._id.toString() : false;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to refund this booking' });
    }

    if (booking.status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Only cancelled bookings can be refunded' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'This booking has no paid amount to refund' });
    }

    booking.paymentStatus = 'refunded';
    await booking.save();

    // Update existing transaction or create a refund credit record
    try {
      const existingTxn = await Transaction.findOne({ bookingId: booking.id });
      if (existingTxn) {
        existingTxn.status = 'Refunded';
        await existingTxn.save();
      } else {
        const txnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const timestamp = new Date().toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) + `, ` + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });
        await Transaction.create({
          id: txnId,
          timestamp,
          description: `Refund - ${booking.service || booking.businessName}`,
          businessName: booking.businessName,
          businessId: booking.businessId,
          bookingId: booking.id,
          customerName: booking.customerName || 'Customer',
          details: `Refund issued for cancelled booking`,
          amount: booking.amount,
          type: 'credit',
          paymentMethod: booking.paymentMethod || 'Online',
          status: 'Refunded',
          userId: booking.userId
        });
      }
    } catch (txnErr) {
      console.error('Warning: Failed to create refund transaction record:', txnErr.message);
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    let booking = await Booking.findOne({ id: req.params.id });
    if (!booking && req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(req.params.id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Must be admin, booking owner, or the Business itself
    const isAuthorizedOwner = (booking.userId && req.user && req.user._id) ? booking.userId.toString() === req.user._id.toString() : false;
    const isAuthorizedBusiness = req.user && req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.deleteOne({ _id: booking._id });

    // Clean up orphaned transactions linked to this booking
    try {
      await Transaction.deleteMany({ bookingId: booking.id });
    } catch (txnErr) {
      console.error('Warning: Failed to clean up booking transactions:', txnErr.message);
    }

    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  collectPayment,
  refundBooking,
  deleteBooking
};
