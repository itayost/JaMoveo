// server/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  instrument: {
    type: String,
    required: [true, 'Instrument is required'],
    enum: ['guitar', 'bass', 'drums', 'vocals', 'keyboard', 'saxophone', 'other']
  },
  otherInstrument: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return this.instrument !== 'other' || (v && v.length > 0);
      },
      message: 'Please specify your instrument'
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ isAdmin: 1 });
userSchema.index({ instrument: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;