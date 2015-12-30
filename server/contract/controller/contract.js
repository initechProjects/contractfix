'use strict';

var Joi    = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
var Boom   = require('boom');
var Contract   = require('../model/contract').Contract;
var User = require('../../main/model/user').User;
var OpenPGP = require('openpgp');
var Mongoose = require('mongoose');
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
      snapshot: Joi.string().description('snapshot of the latest version, if exists'),
      status: Joi.string().description('status of the contract')
    }))
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Contract.findContractByUserId(request.auth.credentials._id, function(err, contracts) {
        let contractsList = [];

        contracts.forEach(function(contract) {
          let item = {};
          item.id = contract._id;
          item.status = contract.status;
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
      previous: Joi.object().description('previous version of published contract'),
      parties: Joi.array().description('parties of the contract, if exists'),
      status: Joi.string().description('status of the contract')
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
        result.status = contract.status;

        if (contract.parties) result.parties = contract.parties;

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

exports.sign = {
  description: 'sign contract',
  tags:['api', 'Contract'],
  validate: {
    payload: {
      contractId: Joi.string().required().description('id of signed contract'),
      text: Joi.string().required().description('signed text of the contract'),
      signature: Joi.object({
        digital: Joi.string().required(),
        image: Joi.string().required()
      }).required().description('signature on the contract'),
      publicKey: Joi.string().required().description('ephemeral public key of signer')
    },
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  response: {
    schema: Joi.object({
      contractId: Joi.any().required().description('contractId'),
      parties: Joi.array().description('parties of the contract, if exists')
    })
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      // check the token username, public key user are the same
      let loggedin = request.auth.credentials.userName.trim();
      let signatureUser = OpenPGP.key.readArmored(request.payload.publicKey).keys[0].users[0].userId.userid.trim();

      if (loggedin !== signatureUser) return reply(Boom.unauthorized('wrong user key'));

      Contract.findContract(request.payload.contractId, function(err, contract) {
        if (err) return reply(Boom.badImplementation(err));
        if (!contract) return reply(Boom.badImplementation('wrong contractId'));

        let signer;
        let notSignedBy = [];

        contract.parties.forEach(function(party, index) {
          if (party.userid === request.auth.credentials._id.toString()) {
            if (party.pgpSignature)  return reply(Boom.unauthorized('already signed'));
            signer = index;
          } else {
            if (!party.pgpSignature) {
              notSignedBy.push(party.userId);
            }
          }
        });

        // if all users signed, change status to closed
        if (notSignedBy.length === 0) contract.status = 'closed';

        if (signer === undefined) return reply(Boom.unauthorized('user is not a party'));

        let publicKeyObject = OpenPGP.key.readArmored(request.payload.publicKey).keys[0];

        let cleartextMessageObject = OpenPGP.cleartext.readArmored(request.payload.text);
        OpenPGP.verifyClearSignedMessage(publicKeyObject, cleartextMessageObject)
        .then(function(result) {
            let validMessage = false;
            if ('signatures' in result) {
              let signatures = result['signatures'];
              if (signatures.length > 0) {
                let signature = signatures[0];
                if ('valid' in signature) {
                   validMessage = signature['valid'];
                }
              }
            }

            // check if the sent signed document is valid
            if (!validMessage) return reply(Boom.unauthorized('wrong document'));

            // check if the signed document is the same as latest version sent
            if (result.text !== contract.versions[contract.versions.length - 1].text) return reply(Boom.unauthorized('wrong text of the contract'));

            // update parties with signature
            contract.parties[signer].pgpSignature = request.payload.signature.digital;
            contract.parties[signer].imageSignature = request.payload.signature.image;
            contract.parties[signer].signedText = request.payload.text;

            let xFF = request.headers['x-forwarded-for'];
            let userIP = xFF ? xFF.split(',')[0] : request.info.remoteAddress;

            contract.parties[signer].userIP = userIP;
            contract.parties[signer].signedOn = (new Date(request.info.received));

            Contract.updateContract(contract, function(err, item) {
              if (err) return reply(Boom.badImplementation(err));
              if (!item) return reply(Boom.badImplementation('could not save'));

              let promises = [];
              var tmpContract = item.toObject();

              tmpContract.parties.forEach(function(part, index) {
                promises.push(new Promise(function(resolve, reject){
                  User.findUserById(Mongoose.Types.ObjectId(part.userid), function(err, user) {
                    if (err) return reject(err);
                    if (!user) return reject('corrupted data');
                    part.username = user.userName;
                    part.fullname = user.fullname;
                    resolve(user);
                  });
                }));
              });

              let response = {
                success: function(values) {
                  // send all users in parties the pdf of signed version

                  // send email to users who are not signed yet
                  //add Email sending to each party
                  // values.forEach(function(user) {

                  //   Email.sendMailSignedWarning(user.fullname, user.userName, contract.metadata.title, contract._id);

                  // });

                  return reply({
                    contractId: tmpContract._id,
                    parties: tmpContract.parties
                  });
                },
                error: function(result) {
                  console.log(result);
                  return reply(Boom.badImplementation(result));
                }
              };

              Promise.all(promises).then(response.success, response.error);
            });

        }).catch(function(err) {
          return reply(Boom.badImplementation(err));
        });
      });
    }
  }
};

exports.getUsersDetails = {
  description: 'sign contract',
  tags:['api', 'Contract'],
  validate: {
    payload: {
      contractId: Joi.string().required().description('id of signed contract'),
    },
    headers: Joi.object({
      'authorization': Joi.string().regex(/^Bearer\s/).required().description('Starts with "Bearer "')
    }).options({ allowUnknown: true })
  },
  response: {
    schema: Joi.object({
      usersdetails: Joi.array().description('parties of the contract')
    })
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      Contract.findContract(request.payload.contractId, function(err, contract) {
        let promises = [];

        contract.users.forEach(function(item) {
          promises.push(new Promise(function(resolve, reject){
            User.findUserById(Mongoose.Types.ObjectId(item), function(err, user) {

              resolve({
                userId: user._id.toString(),
                userName: user.userName,
                fullname: user.fullname
              });
            });
          }));
        });

        let response = {
          success: function(values) {

            return reply({
              usersdetails: values
            });
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

exports.prepareForSignature = {
  description: 'sign contract',
  tags:['api', 'Contract'],
  validate: {
    payload: {
      contractId: Joi.string().required().description('id of signed contract'),
      parties: Joi.array().description('parties of the contract')

      // party: String,
      // title: String,
      // userid: String,
      // fullname: String,
      // userName: String,
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
      Contract.findContract(request.payload.contractId, function(err, contract) {

        request.payload.parties.forEach(function(item) {
          contract.parties = [];
          contract.parties.push(item);
        });

        Contract.updateContract(contract, function(err, saved) {
          return reply('Contract prepared for signature');
        });
      });
    }
  }
};
