const mongoose = require('mongoose');

const BusinessDetailSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  images: [{ type: String }],
  description: { type: String },
  quote: { type: String },
  foodRange: { type: String },
  mustTry: { type: String },
  priceForTwo: { type: String },
  timings: { type: String },
  address: { type: String },
  rating: { type: Number }
}, { _id: false });

const RecommendationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  img: { type: String },
  desc: { type: String },
  link: { type: String }
}, { _id: false });

const ArticleSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String },
  views: { type: String },
  commentsCount: { type: Number, default: 0 },
  mainImage: { type: String },
  galleryImages: [{ type: String }],
  author: {
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String },
    verified: { type: Boolean, default: false },
    date: { type: String }
  },
  introParagraphs: [{ type: String }],
  businesses: [BusinessDetailSchema],
  tags: [{ type: String }],
  recommendations: [RecommendationSchema]
}, { timestamps: true });

module.exports = mongoose.model('Article', ArticleSchema);
