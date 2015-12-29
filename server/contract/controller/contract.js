'use strict';

var Joi    = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
var Boom   = require('boom');
var Contract   = require('../model/contract').Contract;
var User = require('../../main/model/user').User;
var _ = require('lodash');

exports.save = {
  description: 'create a new contract',
  tags:['api', 'Contract'],
  validate: {
    payload: {
      contractId: Joi.string().description('contractid to be saved'),
      title: Joi.string().description('title of the contract'),
      templateid: Joi.string().description('tempplateid, if contract created using a template'),
      text: Joi.string().required().description('latest text to be saved'),
      tag: Joi.string().description('tag of the draft/version'),
      comments: Joi.array().description('newly added comments'),
      personal: Joi.boolean().description('is it personal draft?'),
      snapshot: Joi.string().description('snapshot of latest version')
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
      if (request.payload.contractId) {

        Contract.findContract(request.payload.contractId, function(err, contract) {
          if (!err) {
            if (!contract) { return reply(Boom.badImplementation('wrong contractId')); }

            // if user belongs to any group required by the contract
            if (_.intersection(contract.users, request.auth.credentials.scope).length > 0) {
              // Here update code
              let version = {
                userid: request.auth.credentials._id,
                versionDate: Date.now(),
                text: request.payload.text
              };

              if (request.payload.tag) version.tag = request.payload.tag;

              if (request.payload.snapshot) contract.metadata.snapshot = request.payload.snapshot;

              if (request.payload.title) contract.metadata.title = request.payload.title;

              if (request.payload.personal) {
                contract.drafts.push(version);
              } else {
                contract.versions.push(version);
              }

              if (request.payload.comments && Array.isArray(request.payload.comments)) {
                if (!contract.comments) contract.comments = [];
                contract.comments = request.payload.comments;
              }

              contract.status = 'open';

              Contract.updateContract(contract, function(err) {
                if (!err) {
                  return reply('Contract has been updated');
                } else {
                  return reply(Boom.badImplementation(err));
                }
              });

            } else {
              return reply(Boom.forbidden("You don't have privileges for this contract."));
            }
          } else {
            return reply(Boom.badImplementation(err));
          }
        });

      } else {
        // Create new contract
        let contract = {};

        contract.metadata = {};
        contract.metadata.dateCreated = Date.now();
        if (request.payload.templateid) contract.metadata.templateId = request.payload.templateid;
        if (request.payload.title) contract.metadata.title = request.payload.title;
        if (request.payload.snapshot) contract.metadata.snapshot = request.payload.snapshot;

        if (request.payload.personal) {
          contract.drafts = [];
          let draft = {
            userid: request.auth.credentials._id,
            versionDate: Date.now(),
            text: request.payload.text
          };
          contract.drafts.push(draft);
        } else {
          contract.versions = [];
          let version = {
            userid: request.auth.credentials._id,
            versionDate: Date.now(),
            text: request.payload.text
          };
          contract.versions.push(version);
        }

        if (request.payload.comments && Array.isArray(request.payload.comments)) {
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
        }

        contract.users =[request.auth.credentials._id];

        contract.status = 'open';

        Contract.newContract(contract, function(err) {
          if (!err) {
            return reply('Contract has been saved');
          } else {
            return reply(Boom.badImplementation(err));
          }
        });
      }
    }
  }
};

exports.findContractByUserId = {
  description: 'list contracts that user has access to',
  tags:['api', 'Contract'],
  validate: {
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  response: {
    schema: Joi.array().items(Joi.object({
      id: Joi.any().required().description('contractid'),
      title: Joi.string().description('title of contract'),
      drafts: Joi.any().description('tag of latest draft, if exists, or true'),
      versions: Joi.any().description('tag of latest version, if exists, or true'),
      snapshot: Joi.string().description('snapshot of the latest version, if exists')
    }))
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Contract.findContractByUserId(request.auth.credentials._id, function(err, contracts) {
        let contractsList = [];

        contracts.forEach(function(contract) {
          let item = {};
          item.id = contract._id;
          if (contract.metadata.title) item.title = contract.metadata.title;
          if (contract.metadata.snapshot) item.snapshot = contract.metadata.snapshot;

          if (contract.drafts) {
            let l = contract.drafts.length;

            while (l--) {
              console.log(contract.drafts[l].userid, request.auth.credentials._id);
              if (contract.drafts[l].userid == request.auth.credentials._id) {
                item.drafts = contract.drafts[l].tag || true;
                break;
              }
            }
          }

          if (contract.versions && contract.versions.length > 0) {
            item.versions = contract.versions[contract.versions.length - 1].tag || true;
          }

          contractsList.push(item);
          console.log('Contract ID:', contract._id, ', Users:', contract.users);
        });
        return reply(contractsList);
      });
    }
  }
};

exports.open = {
  description: 'open requested contracts',
  tags:['api', 'Contract'],
  validate: {
    payload: {
      contractId: Joi.string().required().description('contractid to be opened'),
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
      contractId: Joi.any().required().description('contractId'),
      metadata: Joi.object().description('metadata of contract'),
      comments: Joi.array().description('array of comments'),
      users: Joi.array().description('users who can access'),
      revisions: Joi.number().integer().description('number of revisions published'),
      personal: Joi.object().description('personal draft'),
      latest: Joi.object().description('latest published version'),
      previous: Joi.object().description('previous version of published contract')
    })
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {

      let contractId = request.payload.contractId;
      if (!contractId) return reply(Boom.badImplementation('No contract id'));

      Contract.findContract(contractId, function(err, contract) {
        if (err) return reply(Boom.badImplementation(err));
        if (!contract) return reply(Boom.badImplementation('wrong contractId'));
        if (_.intersection(contract.users, request.auth.credentials.scope).length === 0) return reply(Boom.forbidden("You don't have privileges for this contract."));

        let result = {};

        result.contractId = contract._id;
        result.metadata = contract.metadata;
        result.comments = contract.comments;

        if (contract.drafts) {
          let l = contract.drafts.length;

          while (l--) {
            if (contract.drafts[l].userid == request.auth.credentials._id) {
              result.personal = {};
              result.personal.text = contract.drafts[l].text;
              result.personal.versionDate = contract.drafts[l].versionDate;
              if (contract.drafts[l].tag) result.personal.tag = contract.drafts[l].tag;
              break;
            }
          }
        }

        if (contract.versions) {
          result.revisions = contract.versions.length;

          if (result.revisions > 0) {
            result.latest = {};
            result.latest.text = contract.versions[result.revisions - 1].text;
            result.latest.versionDate = contract.versions[result.revisions - 1].versionDate;
            if (contract.versions[result.revisions - 1].tag) result.latest.tag = contract.versions[result.revisions - 1].tag;

            if (result.revisions > 1) {
              result.previous = {};
              result.previous.text = contract.versions[result.revisions - 2].text;
              result.previous.versionDate = contract.versions[result.revisions - 2].versionDate;
              if (contract.versions[result.revisions - 2].tag) result.latest.tag = contract.versions[result.revisions - 2].tag;
            }
          }
        }

        let promises = [];

        contract.users.forEach(function(userId) {
          promises.push(new Promise(function(resolve, reject){
            User.findUserById(userId, function(err, user) {
              if (err) {
                console.log(err);
                return reject(err);
              }

              resolve(user);
            });
          }));
        });

        result.users = [];

        let response = {
          success: function(values) {

            values.forEach(function(user) {
              result.users.push({
                id: user._id,
                fullname: user.fullname,
                email: user.userName
              });
            });

            return reply(result);
          },
          error: function(result) {
            console.log(result);
            return reply(Boom.badImplementation(result));
          }
        };

        Promise.all(promises).then(response.success, response.error);

      });
    }
  }
};
