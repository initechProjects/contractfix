var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');

/**
 * @module  Contract
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
    users. Users of the contract
  */
  users: { type: [String], index: true }

}, { autoIndex: false });

Contract.statics.saveContract = function(requestData, callback) {
  this.create(requestData, callback);
};

Contract.statics.updateContract = function(contract, callback) {
  contract.save(callback);
};

Contract.statics.findContract = function(id, callback) {
  this.findOne({
    _id: id
  }, callback);
};

Contract.statics.findContractByUserId = function(userId, callback) {
  this.find({
    users: userId
  }, callback);
};

var contract = mongoose.model('contract', Contract);

/** export schema */
module.exports = {
  Contract: contract
};
