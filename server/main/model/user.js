var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @module  User
 * @description contain the details of Attribute
 */

var User = new Schema({


  /**
    userName. It can only contain valid email id, should be unique, is required and indexed.
  */
  userName: {
    type: String,
    unique: true,
    required: true
  },

  /**
    password. It can only contain string, is required field.
  */
  password: {
    type: String,
    required: true
  },

  /**
    Full name. It can only contain string.
  */
  fullname: {
    type: String,
    required: false
  },

  /**
    password. It can only contain string, is required field.
  */
  privateKey: {
    type: String,
    required: false
  },

  /**
    password. It can only contain string, is required field.
  */
  publicKey: {
    type: String,
    required: false
  },

  /**
  Scope. It can only contain string, is required field, and should have value from enum array.
  */
  scope: {
    type: [String],
    // enum: ['admin', 'registered', 'contract_owner', 'other_party'],
    required: true
  },

  /**
    isVerified. Boolean value to  check if email address is verified.
  */
  isVerified: {
    type: Boolean,
    default: false
  },

  /**
    isRevoked. Boolean value to  check if user access revoked.
  */
  isRevoked: {
    type: Boolean,
    default: false
  },

  /**
    isInvited. Boolean value to  check if user created by invitation.
  */
  isInvited: {
    type: Boolean,
    default: false
  },

  created_at: Date,
  updated_at: Date

});

User.pre('save', function(next) {
  var currentDate = new Date();

  this.updated_at = currentDate;
  if (this.isNew) this.created_at = currentDate;
  next();
});

User.statics.saveUser = function(requestData, callback) {
  this.create(requestData, callback);
};

User.statics.updateUser = function(user, callback) {
  user.save(callback);
};

User.statics.findUser = function(userName, callback) {
  this.findOne({
    userName: userName
  }, callback);
};

User.statics.findUserById = function(id, callback) {
  this.findOne({
    _id: id
  }, callback);
};

User.statics.findUserByIdAndUserName = function(id, userName, callback) {
  this.findOne({
    userName: userName,
    _id: id
  }, callback);
};

var user = mongoose.model('user', User);

/** export schema */
module.exports = {
  User: user
};
