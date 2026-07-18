const mongoose = require('mongoose');

const ServiceBookingSubmissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom random submission slug (e.g. sub-178394017...)
  businessId: { type: String, required: true }, // Reference to business slug
  businessName: { type: String },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Dynamic fields payload
  timestamp: { type: String, required: true } // Date formatted string (e.g., DD/MM/YYYY HH:MM)
}, { timestamps: true });

module.exports = mongoose.model('ServiceBookingSubmission', ServiceBookingSubmissionSchema);
