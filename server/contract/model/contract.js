var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @module  Contract
 * @description contain the details of Attribute
 */

var Contract = new Schema({

  /**
    metadata. Object keeps different static data about the contract
  */
  metadata: {
    dateCreated: Date,
    templateId: String,
    title: String,
    snapshot: String
  },

  /**
    Versions. Versions of contract draft in html format
  */
  versions: [{
    userid: String,
    versionDate: Date,
    text: String,
    tag: String
  }],

  /**
    Drafts. Personal drafts of users in html format
  */
  drafts: [{
    userid: String,
    versionDate: Date,
    text: String,
    tag: String
  }],

  /**
    Comments.
  */
  comments: [{
    userid: String,
    commentDate: Date,
    text: String,
    selection: String
  }],

  /**
    users. Users of the contract
  */
  users: { type: [String], index: true },

  parties:[{
    party: String,
    title: String,
    userid: String,
    digitalSignature: String,
    signedText: String,
    signedOn: Date,
    userIP: String
  }],

  status: {
    type: String,
    enum: ['open', 'ready', 'closed']
  }

}, { autoIndex: false });

Contract.statics.newContract = function(requestData, callback) {
  this.create(requestData, callback);
};

Contract.statics.updateContract = function(contract, callback) {
  contract.save(callback);
};

Contract.statics.findContract = function(id, callback) {
  this.findOne({ _id: id }, callback);
};

Contract.statics.findContractByUserId = function(userId, callback) {
  this.find({ users: userId }, callback);
};

Contract.statics.addVersion = function(id, version, callback) {
  this.findOne({ _id: id }, function(item) {
    item.versions.push(version);
    item.save(callback);
  });
};

var contract = mongoose.model('contract', Contract);

/** export schema */
module.exports = {
  Contract: contract
};
