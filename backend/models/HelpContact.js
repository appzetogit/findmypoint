const mongoose = require('mongoose');

// Singleton contact config doc for the Help page
const HelpContactSchema = new mongoose.Schema({
  email: { type: String, default: 'panchalajay717@gmail.com' },
  phone: { type: String, default: '+91 8339977383' },
  address: { type: String, default: 'G-161, Sector 22 Noida, Uttar Pradesh 201301 India' },
}, { timestamps: true });

module.exports = mongoose.model('HelpContact', HelpContactSchema);

