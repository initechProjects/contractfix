'use strict';

var Joi    = require('joi');
var Boom   = require('boom');
var Config = require('../../config/config');
var Diff   = require('../model/diff').Diff;
var _ = require('lodash');

var privateKey = Config.token.key;

exports.create = {
  auth: {
    strategy: 'token',
    scope: ['registered']
  },
  validate: {
    payload: {
      metadata: Joi.object({
        dateCreated: Joi.date().required(),
        template: Joi.string()
      }),
      original: Joi.string().required()
    }
  },
  handler: function(request, reply) {

    request.payload.users = [request.auth.credentials._id];
    Contract.saveContract(request.payload, function(err, contract) {
      if (!err) {
        reply('Contract has been created');
      } else {
        reply(Boom.forbidden(err)); // HTTP 403
      }
    });
  }
};

exports.update = {
  validate: {
    payload: {
      contractId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Contract.findContract(request.payload.contractId, function(err, contract) {
        if (!err) {
          // if user belongs to any group required by the contract
          if (_.intersection(contract.users, request.auth.credentials.scope).length > 0) {
            // Here update code

          }
        }
      });

      reply('Contract has been updated');
    }
  }
};

exports.findContractByUserId = {
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Contract.findContractByUserId(request.auth.credentials._id, function(err, contracts) {
        let contractsList = [];

        contracts.forEach(function(contract) {
          contractsList.push(contract._id);
          console.log('Contract ID:', contract._id, ', Users:', contract.users);
        });
        reply(contractsList);
      });
    }
  }
};
