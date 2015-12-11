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
  Scope. It can only contain string, is required field, and should have value from enum array.
  */
  scope: {
    type: String,
    enum: ['admin', 'registered', 'contract_owner', 'other_party'],
    required: true
  },

  /**
    isVerified. Boolean value to  check if email address is verified.
  */
  isVerified: {
    type: Boolean,
    default: false
  }


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
