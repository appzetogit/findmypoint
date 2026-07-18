const mongoose = require('mongoose');

const HelpTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. TKT-101
  subject: { type: String, required: true },
  description: { type: String },
  category: { type: String }, // e.g. "Payment", "Account", "Listing", "Other"
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  userEmail: { type: String },
  userPhone: { type: String },
  userName: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: String }, // matching mock timestamp
  messages: [{
    sender: { type: String }, // 'user' or 'support'
    text: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HelpTicket', HelpTicketSchema);
