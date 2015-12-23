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
      text: Joi.string().description('text of the template'),
      snapshot: Joi.string().description('snapshot of the template in base64 format'),
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
          // if (_.intersection(template.users, request.auth.credentials.scope).length === 0) return reply(Boom.forbidden("You don't have privileges for this template."));
          // Here update code
          if (request.payload.name) template.name = request.payload.name;
          if (request.payload.group) template.group = request.payload.group;
          if (request.payload.text) template.text = request.payload.text;
          if (request.payload.published) template.published = request.payload.published;

          if (request.payload.snapshot) template.snapshot = request.payload.snapshot;
          // console.log(template.snapshot);
          // if (request.payload.snapshot) {
          //   var base64Data = request.payload.snapshot.replace(/^data:image\/png;base64,/, "");
          //   var filename = `${require('node-uuid').v1()}.png`;

          //   require("fs").writeFile('./snapshots/' + filename, base64Data, 'base64', function(err) {
          //     console.log(err);
          //     template.snapshot = filename;
          //     console.log(filename);

          //     Template.updateTemplate(template, function(err) {
          //       if (err) return reply(Boom.badImplementation(err));
          //       return reply('Template has been updated');
          //     });

          //   });
          // } else {
          //   Template.updateTemplate(template, function(err) {
          //     if (err) return reply(Boom.badImplementation(err));
          //     return reply('Template has been updated');
          //   });
          // }

          Template.updateTemplate(template, function(err) {
            if (err) {
              console.log(err);
              return reply(Boom.badImplementation(err));
            }
            return reply('Template has been saved');
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
          if (err) return reply(Boom.badImplementation(err));
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
      group: Joi.string().required().description('template group'),
      published: Joi.string().description('Should not be passed as parameters, future use')
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
      Template.findTemplateByGroup(request.payload.group, true, function(err, templates) {
        if (err) return reply(Boom.badImplementation(err));

        let templatesList = [];

        templates.forEach(function(template) {
          let item = {};
          item.templateid = template._id;
          item.name = template.name;
          if (template.snapshot) item.snapshot = template.snapshot;
          templatesList.push(item);
        });
        return reply(templatesList);
      });
    }
  }
};

exports.__internalTemplates = {
  description: 'list templates under the selected group',
  tags:['api', 'Template'],
  validate: {
    payload: {
      group: Joi.string().required().description('template group'),
      published: Joi.string().description('Should not be passed as parameters, future use')
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
      name: Joi.string().description('name of template'),
      text: Joi.string().description('text of template'),
      snapshot: Joi.string().description('text of template')
    }))
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Template.findTemplateByGroup(request.payload.group, true, function(err, templates) {
        if (err) return reply(Boom.badImplementation(err));

        let templatesList = [];

        templates.forEach(function(template) {
          let item = {};
          item.templateid = template._id;
          item.name = template.name;
          if (template.snapshot) item.snapshot = template.snapshot;
          item.text = template.text;

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
      templateid: Joi.string().required().description('templateid to be opened'),
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
