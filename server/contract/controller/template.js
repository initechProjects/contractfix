'use strict';

var Joi    = require('joi');
var Boom   = require('boom');
var Template   = require('../model/template').Template;
var _ = require('lodash');

exports.save = {
  description: 'create a new template or update existing one',
  tags:['api', 'Template'],
  validate: {
    payload: {
      templateid: Joi.string().description('templateid to be saved'),
      name: Joi.string().description('name of the template'),
      group: Joi.string().description('group of the template'),
      text: Joi.string().required().description('text of the template'),
      published: Joi.boolean().description('is it published?')
    },
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      if (request.payload.templateid) {

        Template.findTemplate(request.payload.templateid, function(err, template) {
          if (err) return reply(Boom.badImplementation(err));
          if (!template) return reply(Boom.badImplementation('wrong templateid'));

          // if user belongs to any group required by the template
          if (_.intersection(template.users, request.auth.credentials.scope).length === 0) return reply(Boom.forbidden("You don't have privileges for this template."));
          // Here update code
          if (request.payload.name) template.name = request.payload.name;
          if (request.payload.group) template.group = request.payload.group;
          if (request.payload.text) template.text = request.payload.text;
          if (request.payload.published) template.published = request.payload.published;

          Template.updateTemplate(template, function(err) {
            if (!err) return reply(Boom.badImplementation(err));
            return reply('Template has been updated');
          });
        });

      } else {
        // Create new template
        let template = {};
        if (request.payload.name) template.name = request.payload.name;
        if (request.payload.group) template.group = request.payload.group;
        if (request.payload.text) template.text = request.payload.text;
        if (request.payload.published) template.published = request.payload.published;

        Template.newTemplate(template, function(err) {
          if (!err) return reply(Boom.badImplementation(err));
          return reply('Template has been saved');
        });
      }
    }
  }
};

exports.findTemplateByGroup = {
  description: 'list templates under the selected group',
  tags:['api', 'Template'],
  validate: {
    payload: {
      group: Joi.string().description('template group')
    },
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  response: {
    schema: Joi.array().items(Joi.object({
      templateid: Joi.any().required().description('templateid'),
      name: Joi.string().description('name of template')
    }))
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Template.findTemplateByGroup(request.auth.credentials._id, function(err, templates) {
        if (err) return reply(Boom.badImplementation(err));

        let templatesList = [];

        templates.forEach(function(template) {
          let item = {};
          item.templateid = template._id;
          item.name = template.name;

          templatesList.push(item);
        });
        return reply(templatesList);
      });
    }
  }
};

exports.open = {
  description: 'open requested template',
  tags:['api', 'Template'],
  validate: {
    payload: {
      templated: Joi.string().required().description('templateid to be opened'),
    },
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  response: {
    schema: Joi.object({
      templateid: Joi.any().required().description('templateid'),
      name: Joi.string().description('name of template'),
      group: Joi.string().description('group of template'),
      text: Joi.string().description('text of template')
    })
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {

      let templateid = request.payload.templateid;

      Template.findTemplate(templateid, function(err, template) {
        if (err) return reply(Boom.badImplementation(err));
        if (!template) return reply(Boom.badImplementation('wrong templateid'));

        let result = {};

        result.templateid = template._id;
        result.name = template.name;
        result.text = template.text;
        result.group = template.group;

        return reply(result);
      });
    }
  }
};
