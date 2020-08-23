const
  mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for  the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 100,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: { /* create relationship to bootcamp collection named 'bootcamp' via the id */
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp', /* reference bootcamp model */
    required: true
  },
  user: { /* create relationship to user collection named 'User' via the id */
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Review', ReviewSchema);