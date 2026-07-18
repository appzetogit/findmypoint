const mongoose = require('mongoose');

// Singleton contact config doc for the Help page
const HelpContactSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HelpContact', HelpContactSchema);
