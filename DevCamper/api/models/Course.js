const
  mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: { /* create relationship to bootcamp collection named 'bootcamp' via the id */
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp', /* reference bootcamp model */
    required: true
  }
});

// Static method to get average of course tuition per bootcamp
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('Calculating average cost...'.blue);

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
          averageCost: {
            $avg: '$tuition'
          }
        }
      }
    ]);

  try {
    await this.model('Bootcamp')
      .findByIdAndUpdate(
        bootcampId,
        {
          averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        }
      );
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);