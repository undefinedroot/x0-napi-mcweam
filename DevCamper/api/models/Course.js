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
    min: 0,
    required: [true, 'Please add a tuition cost'],
    default: 0
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
  },
  user: { /* create relationship to user collection named 'User' via the id */
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Static method to get average of course tuition per bootcamp
CourseSchema.statics.getAverageCost = async function (bootcampId) {
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
    let avgCost = 0;
    if (typeof obj[0].averageCost !== undefined) {
      avgCost = Math.ceil(obj[0].averageCost / 10) * 10   /* to get a whole number value */
    }

    await this.model('Bootcamp')
      .findByIdAndUpdate(
        bootcampId,
        {
          averageCost: avgCost
        }
      );
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save operation of Course
CourseSchema.post('save', async function () {
  console.log('statics getAverageCost(), post save, CourseSchema');
  await this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove operation of Course
CourseSchema.pre('remove', async function (next) {
  console.log('statics getAverageCost(), pre remove, CourseSchema');
  await this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model('Course', CourseSchema);