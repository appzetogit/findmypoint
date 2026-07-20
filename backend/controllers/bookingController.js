const Booking = require('../models/Booking');

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

  // Only businessName and amount are strictly required. service/date/time are
  // optional so product orders (which have no time slot) can be saved too.
  if (!businessName || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide businessName and amount' });
  }

  try {
    // Generate a collision-resistant ID BKxxxxxx if not passed in req.body
    const bookingId = id || `BK${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;

    const booking = await Booking.create({
      id: bookingId,
      businessId: businessId || '',
      businessName,
      category: category || '',
      service: service || '',
      date: date || '',
      time: time || '',
      amount,
      location: location || '',
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      customerAddress: customerAddress || '',
      items: Array.isArray(items) ? items : [],
      formData: formData && typeof formData === 'object' ? formData : {},
      bookingType: bookingType || 'service',
      paymentId: paymentId || '',
      paymentMethod: paymentMethod || '',
      paymentStatus: paymentStatus || (paymentId ? 'paid' : 'pending'),
      userId: req.user._id,
      status: paymentId ? 'confirmed' : 'pending'
    });

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
    const booking = await Booking.findOne({ id: req.params.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization (Must be booking owner, Admin, or the Business itself)
    const isAuthorizedOwner = booking.userId.toString() === req.user._id.toString();
    const isAuthorizedBusiness = req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to change this booking status' });
    }

    booking.status = status;
    await booking.save();

    if (status === 'completed') {
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

// @desc    Refund a cancelled booking's payment
// @route   PUT /api/bookings/:id/refund
// @access  Private
const refundBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAuthorizedOwner = booking.userId.toString() === req.user._id.toString();
    const isAuthorizedBusiness = req.user.isBusiness && booking.businessId === req.user.businessId;

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
    const booking = await Booking.findOne({ id: req.params.id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Must be admin, booking owner, or the Business itself
    const isAuthorizedOwner = booking.userId.toString() === req.user._id.toString();
    const isAuthorizedBusiness = req.user.isBusiness && booking.businessId === req.user.businessId;

    if (!req.user.isAdmin && !isAuthorizedOwner && !isAuthorizedBusiness) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await Booking.deleteOne({ id: req.params.id });
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  refundBooking,
  deleteBooking
};
