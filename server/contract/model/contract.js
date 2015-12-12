var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

/**
 * @module  User
 * @description contain the details of Attribute
 */

var Contract = new Schema({
  /**
    _id: using UUID for id field
  */
  _id: {
    type: String,
    default: uuid.v1
  },

  /**
    metadata. Object keeps different static data about the contract
  */
  metadata: {
    dateCreated: Date,
    template: String
  },

  /**
    original. Original contract draft in html format
  */
  original: String,

  /**
    master. Original contract draft in html format
  */
  master: String,


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
