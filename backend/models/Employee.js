const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  empIdNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  fieldLocation: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: 'O+'
  },
  contactNumber: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    required: true
  },
  joinedDate: {
    type: String,
    required: true
  },
  isValidWorking: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', EmployeeSchema);
