var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

/**
 * @module  User
 * @description contain the details of Attribute
 */

var User = new Schema({
  /**
    _id: using UUID for id field
  */
  _id: {
    type: String,
    default: uuid.v1
  },

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

  created_at: Date,
  updated_at: Date


});

User.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (this.isNew) this.created_at = currentDate;

  next();
});

User.statics.saveUser = function(requestData, callback) {
  console.log(requestData);
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
