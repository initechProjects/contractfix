'use strict';

var Joi    = require('joi');
var Boom   = require('boom');
var Common = require('./common');
var Config = require('../../config/config');
var Jwt    = require('jsonwebtoken');
var User   = require('../model/user').User;
var Contract   = require('../../contract/model/contract').Contract;

var privateKey = Config.token.key;

exports.create = {
  validate: {
    payload: {
      userName: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    request.payload.scope = ['registered'];

    Common.hash(request.payload.password, function(error, hashedPassword) {
      request.payload.password = hashedPassword;

      User.saveUser(request.payload, function(err, user) {

        if (!err) {
          Common.sendMailVerificationLink(user, Config.gettoken('userops', user));
          return reply('Please confirm your email id by clicking on link in email');
        } else {
          if ( err.code === 11000 || err.code === 11001 ) {
            return reply(Boom.forbidden('please provide another user email'));
          } else {
            return reply(Boom.forbidden(err)); // HTTP 403
          }
        }
      });
    });
  }
};

exports.login = {
  validate: {
    payload: {
      userName: Joi.string().email().required(),
      password: Joi.string().required(),
      contractid: Joi.string(),
      valid: Joi.boolean() // ONLY FOR DEVELOPMENT!!!!!
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));
      if (user.isRevoked) return reply(Boom.forbidden('your account has been suspended'));

      Common.checkPassword(request.payload.password, user.password, function(err, result) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (!result) return reply(Boom.forbidden('invalid username or password'));
        if(!user.isVerified) return reply(Boom.forbidden('Your email address is not verified. please verify your email address to proceed'));

        var res = {};
        res.username = user.userName;
        if (user.fullname) res.fullname = user.fullname;
        res.scope = user.scope;
        if (request.payload.contractid) res.contractid = request.payload.contractid;

        Config.dev = request.payload.valid ? true : false;
        res.token = Config.gettoken('login', user);

        return reply(res);

      });
    });
  }
};

exports.refreshToken = {
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      var res = {
        username: request.auth.credentials.userName,
        scope: request.auth.credentials.scope,
        fullname: request.auth.credentials.fullname,
        token: Config.gettoken('login', request.auth.credentials)
      };

      return reply(res);
    }
  }
};

exports.resetPassword = {
  validate: {
    payload: {
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {

    let callback = {
      success: function(user) {

        if (user.isVerified === false) return reply(Boom.forbidden('email is not verified'));

        Common.hash(request.payload.password, function(error, hashedPassword) {
          user.password = hashedPassword;

          User.updateUser(user, function(err, user) {
            if (err) {
              console.error(err);
              return reject({ boom: 'badImplementation', message: err });
            }

            return reply('password changed successfully.');
          });
        });
      },
      error: function(data) {
        if (data.boom === void 0) data.boom = 'badImplementation';
        reply(Boom[data.boom](data.message));
      }
    }

    Config.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);

  }
},

exports.resendVerificationEmail = {
  validate: {
    payload: {
      userName: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));

      Common.checkPassword(request.payload.password, user.password, function(err, result) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (!result) return reply(Boom.forbidden('invalid username or password'));

        if(user.isVerified) return reply('your email address is already verified');

        Common.sendMailVerificationLink(user, Config.gettoken('userops', user));
        return reply('account verification link is sucessfully send to your email');
      });
    });
  }
};

exports.forgotPassword = {
  validate: {
    payload: {
      userName: Joi.string().email().required()
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username'));

      Common.sendMailForgotPassword(user, Config.gettoken('userops', user));
      return reply('instructions to reset password sent to your registered email.');
    });
  }
};

exports.verifyEmail = {
  handler: function(request, reply) {

    let callback = {
      success: function(user) {
        if (user.isVerified === true) return reply(Boom.forbidden('account is already verified'));

        user.isVerified = true;

        User.updateUser(user, function(err, user) {
          if (err) {
            console.error(err);
            return reject({ boom: 'badImplementation', message: err });
          }

          reply('password changed successfully.');
        });
      },
      error: function(data) {
        if (data.boom === void 0) data.boom = 'badImplementation';
        reply(Boom[data.boom](data.message));
      }
    }

    Config.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);

  }
};

exports.updateProfile = {
  validate: {
    payload: {
      username: Joi.string().email(),
      password: Joi.string(),
      fullname: Joi.string(),
      contractid: Joi.string()
    }
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {

    if (request.auth.isAuthenticated) {
      User.findUserById(request.auth.credentials._id, function(err, user) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }

        if (user === null) return reply(Boom.forbidden('invalid username or password'));

        let changed = false;

        if (request.payload.fullname) {
          user.fullname = request.payload.fullname;
          changed = true;
        }

        if (request.payload.password) {
          Common.hash(request.payload.password, function(error, hashedPassword) {
            user.password = hashedPassword;
            changed = true;
          });
        }

        if (request.payload.username) {
          User.findUser(request.payload.userName, function(err, user) {
            if (err) {
              console.error(err);
              return reply(Boom.badImplementation(err));
            }

            if (user) return reply(Boom.forbidden('there is a user with this email'));

            user.userName = request.payload.username;
            changed = true;

          });
        }

        if (changed) User.updateUser(user, function(err, user) {
          if (err) {
            console.error(err);
            return reply(Boom.badImplementation(err));
          }

          reply(Config.gettoken('login', user));
        });
      });
    }
  }
};

exports.invitation = {
  handler: function(request, reply) {

    let callback = {
      success: function(user) {

        let res = {};
        res.newuser = user.isInvited;
        res.contractid = user.contractid;
        res.username = user.userName;
        console.log('success');
        reply(res);
      },
      error: function(data) {
        if (data.boom === void 0) data.boom = 'badImplementation';
        reply(Boom[data.boom](data.message));
      }
    }

    Config.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);
  }
};

exports.inviteCollaborators = {
  validate: {
    payload: {
      contractid: Joi.string().required(),
      title: Joi.string().required(),
      collaborators: Joi.array().required()
    }
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {

    if (request.auth.isAuthenticated) {

      Contract.findContract(request.payload.contractid, function(err, contract){
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }

        if (contract === null) return reply(Boom.preconditionFailed('wrong contractid'));

        let promises = [];

        request.payload.collaborators.forEach(function(email) {
          promises.push(new Promise(function(resolve, reject){

            User.findUser(email, function(err, user) {

              if (err) {
                console.error(err);
                return reject('db read error');
              }

              if (user === null) {

                Common.hash('temporary_pass', function(error, hashedPassword) {

                  user = {};
                  user.userName = email;
                  user.scope = ['registered'];
                  user.isInvited = true;
                  user.password = hashedPassword;

                  User.saveUser(user, function(err, result) {
                    if (err) {
                      console.error(err);
                      return reject('db write error');
                    }

                    user._id = result._id;

                    contract.users.push(user._id);

                    resolve(user);

                  });
                });

              } else {
                contract.users.push(user._id);

                resolve(user);
              }
            });
          }));
        });

        let response = {
          success: function(values) {
            let emails = [];

            Contract.updateContract(contract, function(err, result) {
              if (err) {
                console.error(err);
                return reply(Boom.badImplementation(err));
              }

              if (result === null) {
                return reply(Boom.badImplementation('contract cannot be saved'));
              }
            });

            values.forEach(function(user) {
              emails.push(user.userName);
              Common.sendMailInvitation(user, request.auth.credentials.userName, request.auth.credentials.fullname, request.payload.title, Config.gettoken('userops', user));
            });

            return reply(`Invitation(s) sent to ${emails.join(', ')}.`);
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
