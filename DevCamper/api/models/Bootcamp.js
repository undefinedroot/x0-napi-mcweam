const
  mongoose = require('mongoose'),
  slugify = require('slugify'),
  geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String, /* explicit type */
    required: [true, 'Please add a name'], /* required with a custom message */
    unique: true, /* no two bootcamps can have the same name */
    trim: true, /* remove whitespace */
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: String, /* url friendly version of the name, for the front end */
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Name can not be more than 500 characters']
  },
  website: {
    type: String,
    match: [ /*  regular expression for http:// and https://  */
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    default: 0
  },
  averageCost: {
    type: Number,
    default: 0
  },
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {  /* create relationship to user collection named 'User' via the id */
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, { /* enable virtuals */
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/* Create bootcamp slug from the name using mongoose middleware/hook
   run this before (.pre) the operation of 'save' */
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Geocode and create location field
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB, we already have the 'formattedAddress'
  this.address = undefined;
  next();
});

// Cascade delete courses, so before a bootcamp is deleted it will first delete related courses
BootcampSchema.pre('remove', async function (next) {
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id }); /* delete only related course */
  next();
});

/* reverse populate with virtuals to get courses for each bootcamp,
   this virtual property named 'courses_virtual' will never exist at the database
*/
BootcampSchema.virtual('courses_virtual', {
  ref: 'Course', /* name of the collection to link to */
  localField: '_id', /* the id of this document on this record */
  foreignField: 'bootcamp', /* field in the course model, where we link this document */
  justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema); /* create new model using the defined schema */