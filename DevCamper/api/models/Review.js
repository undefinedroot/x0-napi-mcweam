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
    max: 10,
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

// prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  // initiate aggregation
  const obj =
    await this.aggregate([
      {
        $match: {
          bootcamp: bootcampId  /* match the id */
        }
      },
      {
        $group: {
          _id: '$bootcamp',
          averageRating: {
            $avg: '$rating'
          }
        }
      }
    ]);

  console.log(obj[0].averageRating);

  try {
    console.log('trying to update rating');
    let avgRating = 0;
    if (typeof obj[0].averageRating !== undefined) {
      avgRating = obj[0].averageRating;
    }
    console.log(`avgRating: ${avgRating}`);

    await this.model('Bootcamp')
      .findByIdAndUpdate(
        bootcampId,
        {
          averageRating: avgRating
        }
      );
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save operation of Review
ReviewSchema.post('save', async function () {
  console.log('statics getAverageRating(), post save, ReviewSchema');
  await this.constructor.getAverageRating(this.bootcamp);
});

ReviewSchema.post('update', async function () {
  console.log('statics getAverageRating(), post update, ReviewSchema');
  await this.constructor.getAverageRating(this.bootcamp);
});


// Call getAverageRating before remove operation of Review
ReviewSchema.pre('remove', async function (next) {
  console.log('statics getAverageRating(), pre remove, ReviewSchema');
  await this.constructor.getAverageRating(this.bootcamp);
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);