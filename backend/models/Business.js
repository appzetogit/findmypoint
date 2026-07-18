const mongoose = require('mongoose');

const ProductServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  img: { type: String },
  desc: { type: String },
  addedDate: { type: String }
}, { _id: true });

const UserReviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userInitial: { type: String },
  userColor: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String },
  reviewText: { type: String, required: true },
  image: { type: String },
  userEmail: { type: String }
}, { _id: true });

const FAQItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const SimilarListingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String },
  rating: { type: Number },
  img: { type: String },
  category: { type: String }
}, { _id: false });

const BusinessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // slug-like ID (e.g. vishal-mega-mart)
  name: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  phone: { type: String },
  address: { type: String },
  timings: { type: String },
  openStatus: { type: String },
  website: { type: String },
  images: [{ type: String }],
  description: { type: String },
  products: [ProductServiceSchema],
  reviews: [UserReviewSchema],
  faqs: [FAQItemSchema],
  similarListings: [SimilarListingSchema],
  whatsapp: { type: String },
  extraNumbers: [{ type: String }],
  branches: [{ type: String }],
  openTime: { type: String },
  closeTime: { type: String },
  holidayTime: { type: String },
  officers: [{
    name: { type: String },
    designation: { type: String }
  }],
  facilities: [{ type: String }],
  email: { type: String },
  videoLink: { type: String },
  locationLink: { type: String },
  othersDestination: { type: String },
  subCategoryLine: { type: String },
  categoryLine: { type: String },
  highlightsName: { type: String },
  isVerified: { type: Boolean, default: false },
  isBookingDisabled: { type: Boolean, default: false },
  bookingButtonLabel: { type: String },
  isTimingMandatory: { type: Boolean, default: false },
  country: { type: String },
  state: { type: String },
  district: { type: String },
  cityTown: { type: String },
  pincode: { type: String },
  password: { type: String },
  clientPassword: { type: String }, // Plain text — admin reference only
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const bcrypt = require('bcryptjs');

// Hash password pre-save
BusinessSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('Business', BusinessSchema);
