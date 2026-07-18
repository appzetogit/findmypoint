const HelpTicket = require('../models/HelpTicket');

// @desc    Get support tickets (All for Admin, User-specific for customers)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    let query = {};
    if (!req.user.isAdmin) {
      query = { userId: req.user._id };
    }

    const tickets = await HelpTicket.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  const { subject, description, category, priority } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ success: false, message: 'Please provide subject and description' });
  }

  try {
    // Generate simple ID TKT-xxxx
    const ticketId = `TKT-${Math.floor(100 + Math.random() * 900)}`;

    const ticket = await HelpTicket.create({
      id: ticketId,
      subject,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName || ''}`.trim(),
      userEmail: req.user.email || '',
      userPhone: req.user.mobile1,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      messages: [{
        sender: 'user',
        text: description,
        timestamp: new Date()
      }]
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add message to support ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
const addTicketMessage = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
  }

  try {
    const ticket = await HelpTicket.findOne({ id: req.params.id });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check authorization (Must be ticket owner or Admin)
    if (!req.user.isAdmin && ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this ticket' });
    }

    const senderRole = req.user.isAdmin ? 'support' : 'user';

    ticket.messages.push({
      sender: senderRole,
      text,
      timestamp: new Date()
    });

    // If support replies, mark status as In Progress
    if (req.user.isAdmin && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  try {
    const ticket = await HelpTicket.findOne({ id: req.params.id });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Check authorization (Must be ticket owner or Admin)
    if (!req.user.isAdmin && ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTickets,
  createTicket,
  addTicketMessage,
  updateTicketStatus
};
