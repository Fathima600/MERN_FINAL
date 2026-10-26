const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true, maxlength: 120 },
  courseDuration: { type: String, required: true, trim: true, maxlength: 60 },
  comments: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
