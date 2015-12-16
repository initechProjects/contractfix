'use strict';

var Joi    = require('joi');
var Boom   = require('boom');
var Contract   = require('../model/contract').Contract;
var _ = require('lodash');

exports.save = {
  validate: {
    payload: {
      contractId: Joi.string(),
      templateId: Joi.string(), //Joi.when('contractId', { is: undefined, then: Joi.string().required() }),
      text: Joi.string().required(),
      comments: Joi.array(),
      personal: Joi.boolean()
    }
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      if (request.payload.contractId) {

        Contract.findContract(request.payload.contractId, function(err, contract) {
          if (!err) {
            if (!contract) { reply(Boom.badImplementation('wrong contractId')); }

            // if user belongs to any group required by the contract
            if (_.intersection(contract.users, request.auth.credentials.scope).length > 0) {
              // Here update code
              let version = {
                userid: request.auth.credentials._id,
                versionDate: Date.now(),
                text: request.payload.text
              };

              if (request.payload.personal) {
                contract.drafts.push(version);
              } else {
                contract.versions.push(version);
              }

              request.payload.comments.forEach(function(item) {
                let comment = {
                  userid: request.auth.credentials._id,
                  commentDate: Date.now(),
                  text: item.comment,
                  selection: item.selection
                };

                if (!contract.comments) contract.comments = [];
                contract.comments.push(comment);
              });

              Contract.updateContract(contract, function(err) {
                if (!err) {
                  reply('Contract has been updated');
                } else {
                  reply(Boom.badImplementation(err));
                }
              });

            } else {
              reply(Boom.forbidden("You don't have privileges for this contract."));
            }
          } else {
            reply(Boom.badImplementation(err));
          }
        });

      } else {
        // Create new contract
        let contract = {};

        contract.metadata = {};
        contract.metadata.dateCreated = Date.now();
        if (request.payload.templateId) contract.metadata.templateId = request.payload.templateId;

        contract.versions = [];
        let version = {
          userid: request.auth.credentials._id,
          versionDate: Date.now(),
          text: request.payload.text
        };
        contract.versions.push(version);

        request.payload.comments.forEach(function(item) {
          let comment = {
            userid: request.auth.credentials._id,
            commentDate: Date.now(),
            text: item.comment,
            selection: item.selection
          };

          if (!contract.comments) contract.comments = [];
          contract.comments.push(comment);
        });

        contract.users =[request.auth.credentials._id];

        Contract.newContract(contract, function(err) {
          if (!err) {
            reply('Contract has been saved');
          } else {
            reply(Boom.badImplementation(err));
          }
        });
      }
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

exports.open = {
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {

      let contractId = request.payload.contractid;
      if (!contractId) reply(Boom.badImplementation('No contract id'));

      Contract.findContract(contractId, function(err, contract) {
        if (err) reply(Boom.badImplementation(err));
        if (!contract) reply(Boom.badImplementation('wrong contractId'));
        if (_.intersection(contract.users, request.auth.credentials.scope).length === 0) reply(Boom.forbidden("You don't have privileges for this contract."));

        let result = {};

        result.contractId = contract._id;
        result.metadata = contract.metadata;
        result.comments = contract.comments;

        if (contract.drafts) {
          let l = contract.drafts.length;

          while (l--) {
            if (contract.drafts[l].userid === request.auth.credentials._id) {
              result.personal = {};
              result.personal.text = contract.drafts[l].text;
              result.personal.versionDate = contract.drafts[l].versionDate;
              break;
            }
          }
        }

        result.revisions = contract.versions.length;

        // console.log(result);
        result.latest = {};
        result.latest.text = contract.versions[result.revisions - 1].text;
        result.latest.versionDate = contract.versions[result.revisions - 1].versionDate;
        if (result.revisions > 1) {
          result.previous = {};
          result.previous.text = contract.versions[result.revisions - 2].text;
          result.previous.versionDate = contract.versions[result.revisions - 2].versionDate;
        }

        reply(result);
      });

    }
  }
};
