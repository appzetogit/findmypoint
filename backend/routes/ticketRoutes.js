const express = require('express');
const router = express.Router();
const {
  getTickets,
  createTicket,
  addTicketMessage,
  updateTicketStatus
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All ticket routes require authentication

router.get('/', getTickets);
router.post('/', createTicket);
router.post('/:id/messages', addTicketMessage);
router.put('/:id/status', updateTicketStatus);

module.exports = router;
