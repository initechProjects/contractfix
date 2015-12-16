var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @module  Diff
 * @description contain the details of Attribute
 */

var Diff = new Schema({
  /**
    _id: using UUID for id field
  */
  _id: {
    type: String
  },

  /**
    diffs. Changes kept here
  */
  diffs: [Array],

});

Diff.statics.saveDiff = function(requestData, callback) {
  this.create(requestData, callback);
};

Diff.statics.updateDiff = function(contract, callback) {
  contract.save(callback);
};

Diff.statics.findDiff = function(id, callback) {
  this.findOne({
    _id: id
  }, callback);
};

Diff.statics.findDiffByUserId = function(userId, callback) {
  this.findOne({
    users: userId
  }, callback);
};

var diff = mongoose.model('diff', Diff);

/** export schema */
module.exports = {
  Diff: diff
};
