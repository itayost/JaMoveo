// server/models/session.model.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    default: function() {
      return `Rehearsal ${new Date().toLocaleString()}`;
    }
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Session must have an admin']
  },
  activeSong: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  connectedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: {
      type: String
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Active sessions index
sessionSchema.index({ isActive: 1, createdAt: -1 });

// Admin index for quickly finding sessions by admin
sessionSchema.index({ admin: 1 });

// Active song index for finding sessions playing specific songs
sessionSchema.index({ activeSong: 1 });

// Compound index for admin + isActive queries
sessionSchema.index({ admin: 1, isActive: 1 });

// Index for connected users (for lookup efficiency)
sessionSchema.index({ 'connectedUsers.user': 1 });

// Method to check if a user is connected to the session
sessionSchema.methods.isUserConnected = function(userId) {
  return this.connectedUsers.some(user => user.user.toString() === userId.toString());
};

// Method to add a user to the session
sessionSchema.methods.addUser = function(userId, socketId) {
  if (!this.isUserConnected(userId)) {
    this.connectedUsers.push({
      user: userId,
      socketId,
      joinedAt: new Date()
    });
  } else {
    // Update socket ID if user is already connected
    const userIndex = this.connectedUsers.findIndex(
      user => user.user.toString() === userId.toString()
    );
    this.connectedUsers[userIndex].socketId = socketId;
  }
  return this.save();
};

// Method to remove a user from the session
sessionSchema.methods.removeUser = function(userId) {
  this.connectedUsers = this.connectedUsers.filter(
    user => user.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to remove a user by socket ID
sessionSchema.methods.removeUserBySocketId = function(socketId) {
  this.connectedUsers = this.connectedUsers.filter(
    user => user.socketId !== socketId
  );
  return this.save();
};

// Method to set the active song
sessionSchema.methods.setActiveSong = function(songId) {
  this.activeSong = songId;
  return this.save();
};

// Method to end the session
sessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.endedAt = new Date();
  return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;