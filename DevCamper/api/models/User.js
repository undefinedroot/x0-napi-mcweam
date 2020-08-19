const
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false /* will not return 'password' field if we retrieve a user */
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
// https://github.com/dcodeIO/bcrypt.js
// before we save the document, we hash the password first
UserSchema.pre('save', async function (next) {
  // check first if password is modified, without this,
  // forgotPassword() from auth controller will return an error
  // because this runs before any save operation
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT (jsonwebtoken) and return
// can check https://jwt.io/
// https://github.com/auth0/node-jsonwebtoken
// by default algorithm is HS256
UserSchema.methods.getSignedJwtToken = function () {
  return jwt
    .sign(
      { id: this._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Match user entered password to hased password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate the token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken =
    crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

  // set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes before reset token expires

  return resetToken; // return original reset token
}

module.exports = mongoose.model('User', UserSchema);