const FAQ = require('../models/FAQ');
const HelpContact = require('../models/HelpContact');
const HelpTicket = require('../models/HelpTicket');

// ─── FAQs ────────────────────────────────────────────────────────────────────

// @desc   Get all FAQs (public)
// @route  GET /api/help/faqs
const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create a new FAQ (admin only)
// @route  POST /api/help/faqs
const createFAQ = async (req, res) => {
  const { question, answer, order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ success: false, message: 'Question and answer are required.' });
  }
  try {
    const faq = await FAQ.create({ question, answer, order: order || 0 });
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update a FAQ (admin only)
// @route  PUT /api/help/faqs/:id
const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.status(200).json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete a FAQ (admin only)
// @route  DELETE /api/help/faqs/:id
const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.status(200).json({ success: true, message: 'FAQ deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Help Contact Config ──────────────────────────────────────────────────────

// @desc   Get contact details (public)
// @route  GET /api/help/contact
const getContact = async (req, res) => {
  try {
    let contact = await HelpContact.findOne();
    if (!contact) contact = await HelpContact.create({ email: '', phone: '' });
    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Save contact details (admin only)
// @route  POST /api/help/contact
const saveContact = async (req, res) => {
  const { email, phone } = req.body;
  try {
    let contact = await HelpContact.findOne();
    if (contact) {
      contact.email = email || '';
      contact.phone = phone || '';
      await contact.save();
    } else {
      contact = await HelpContact.create({ email: email || '', phone: phone || '' });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Public Ticket Submission ─────────────────────────────────────────────────

// @desc   Submit support ticket (public – no auth required)
// @route  POST /api/help/tickets
const submitTicket = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket = await HelpTicket.create({
      id: ticketId,
      subject,
      description: message,
      category: 'Other',
      status: 'Open',
      priority: 'Medium',
      userName: name,
      userEmail: email,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      messages: [{ sender: 'user', text: message, timestamp: new Date() }],
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get all tickets (admin only)
// @route  GET /api/help/tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await HelpTicket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update ticket status (admin only)
// @route  PUT /api/help/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const ticket = await HelpTicket.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete a ticket (admin only)
// @route  DELETE /api/help/tickets/:id
const deleteTicket = async (req, res) => {
  try {
    const ticket = await HelpTicket.findOneAndDelete({ id: req.params.id });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.status(200).json({ success: true, message: 'Ticket deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  getContact, saveContact,
  submitTicket, getTickets, updateTicket, deleteTicket,
};
