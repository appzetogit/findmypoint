const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminAuthMiddleware');
const {
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  getContact, saveContact,
  submitTicket, getTickets, updateTicket, deleteTicket,
} = require('../controllers/helpController');

// ── FAQs ──────────────────────────────────────────
router.get('/faqs', getFAQs);                          // public
router.post('/faqs', adminProtect, createFAQ);         // admin
router.put('/faqs/:id', adminProtect, updateFAQ);      // admin
router.delete('/faqs/:id', adminProtect, deleteFAQ);   // admin

// ── Contact Config ────────────────────────────────
router.get('/contact', getContact);                    // public
router.post('/contact', adminProtect, saveContact);    // admin

// ── Support Tickets ───────────────────────────────
router.post('/tickets', submitTicket);                 // public (no auth)
router.get('/tickets', adminProtect, getTickets);      // admin
router.put('/tickets/:id', adminProtect, updateTicket);    // admin
router.delete('/tickets/:id', adminProtect, deleteTicket); // admin

module.exports = router;
