var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var uuid = require('node-uuid');

/**
 * @module  Contract
 * @description contain the details of Attribute
 */

var Template = new Schema({
  /**
    _id: using UUID for id field
  */
  // _id: {
  //   type: String,
  //   default: uuid.v1
  // },

  /**
    metadata. Object keeps different static data about the template
  */
  metadata: {
    dateCreated: Date,
    templateId: String,
    title: String
  },

  /**
    Versions. Versions of template draft in html format
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
    users. Users of the template
  */
  users: { type: [String], index: true }

}, { autoIndex: false });

Template.statics.newTemplate = function(requestData, callback) {
  this.create(requestData, callback);
};

Template.statics.updateTemplate = function(template, callback) {
  template.save(callback);
};

Template.statics.findTemplate = function(id, callback) {
  this.findOne({ _id: id }, callback);
};

Template.statics.findTemplateByUserId = function(userId, callback) {
  this.find({ users: userId }, callback);
};

Template.statics.addVersion = function(id, version, callback) {
  this.findOne({ _id: id }, function(item) {
    item.versions.push(version);
    item.save(callback);
  });
};

var template = mongoose.model('template', Template);

/** export schema */
module.exports = {
  Template: template
};
