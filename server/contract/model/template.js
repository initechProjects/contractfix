var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @module  Contract
 * @description contain the details of Attribute
 */

var Template = new Schema({

  /**
    name. Name of the template
  */
  name: String,

  /**
    Group. Group of the template
  */
  group: {
    type: String,
    index: true,
    enum: [
      'warranties',
      'event contracts',
      'health and medical directives',
      'household services contracts',
      'job contracts',
      'professional services contracts',
      'real estate contracts',
      'rental contracts',
      'sales contracts',
      'employee agreements',
      'debt and loans',
      'business partnership contracts',
      'personal relationship agreements',
      'child care contracts',
      'contracts for children',
      'liability releases',
      'will',
      'miscellaneous contracts'
    ],
  },

  /**
    Description. description of the template
  */
  description: String,

  /**
    Published. If the template is accessable by users
  */
  published: {
    type: Boolean,
    default: false
  },

  /**
    Editors. Users who can edit the template
  */
  editors: { type: [String], index: true, default:['host'] },

  /**
    text. Text of contract in html format
  */
  text: String

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

Template.statics.findTemplateByGroup = function(group, published, callback) {
  this.find({ group: group, published: published }, callback);
};

var template = mongoose.model('template', Template);

/** export schema */
module.exports = {
  Template: template
};
