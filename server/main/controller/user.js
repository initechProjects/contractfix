'use strict';

var Joi    = require('joi');
var Boom   = require('boom');
var Config = require('../../config/config');
var User   = require('../model/user').User;
var Contract   = require('../../contract/model/contract').Contract;
var Auth = require('../auth');
var Email = require('../communication/email');

exports.create = {
  description: 'Signup user',
  tags:['api', 'User'],
  validate: {
    payload: {
      userName: Joi.string().email().required().description('email of user'),
      password: Joi.string().required().description('password of user')
    }
  },
  handler: function(request, reply) {
    request.payload.scope = ['registered'];

    Auth.hash(request.payload.password, function(error, hashedPassword) {
      request.payload.password = hashedPassword;

      User.saveUser(request.payload, function(err, user) {

        if (!err) {
          Email.sendMailVerificationLink(user, Auth.gettoken('userops', user));
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
  description:'user login',
  tags:['api', 'User'],
  validate: {
    payload: {
      userName   : Joi.string().email().required().description('email of user'),
      password   : Joi.string().required().description('password of user'),
      valid      : Joi.boolean().description('only for development use') // ONLY FOR DEVELOPMENT!!!!!
    }
  },
  response: {
    schema: Joi.object({
      username: Joi.string().required().description('email address of user'),
      fullname: Joi.string().description('full name of user, if exist'),
      scope: Joi.array().required().description('array of roles of user'),
      token: Joi.string().required().description('login token valid for 15 mins')
    })
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));
      if (user.isRevoked) return reply(Boom.forbidden('your account has been suspended'));

      Auth.checkPassword(request.payload.password, user.password, function(err, result) {
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

        Config.dev = request.payload.valid ? true : false;
        res.token = Auth.gettoken('login', user);

        return reply(res);
      });
    });
  }
};

exports.refreshToken = {
  description: 'refresh existing token, login tokens are valid for 15 mins',
  tags:['api', 'User'],
  validate: {
    headers: Joi.object({
      'authorization': Joi.string().required().description('Starts with "Bearer ", old token')
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  response: {
    schema: Joi.object({
      username: Joi.string().required().description('email of user'),
      scope: Joi.array().required().description('array of roles of user'),
      fullname: Joi.string().description('full name of user, if exist'),
      token: Joi.string().required().description('refreshed token')
    })
  },
  handler: function(request, reply) {
    if (request.auth.isAuthenticated) {
      var res = {
        username: request.auth.credentials.userName,
        scope: request.auth.credentials.scope,
        fullname: request.auth.credentials.fullname,
        token: Auth.gettoken('login', request.auth.credentials)
      };

      return reply(res);
    }
  }
};

exports.resetPassword = {
  description: 'reset forgotten password using email token',
  tags:['api', 'User'],
  validate: {
    payload: {
      password: Joi.string().required().description('new password')
    }
  },
  handler: function(request, reply) {

    let callback = {
      success: function(user) {

        if (user.isVerified === false) return reply(Boom.forbidden('email is not verified'));

        Auth.hash(request.payload.password, function(error, hashedPassword) {
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
    };

    Auth.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);

  }
},

exports.resendVerificationEmail = {
  description: 'resend verification email',
  tags:['api', 'User'],
  validate: {
    payload: {
      userName: Joi.string().email().required().description('email of user'),
      password: Joi.string().required().description('password of user')
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));

      Auth.checkPassword(request.payload.password, user.password, function(err, result) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (!result) return reply(Boom.forbidden('invalid username or password'));

        if(user.isVerified) return reply('your email address is already verified');

        Email.sendMailVerificationLink(user, Auth.gettoken('userops', user));
        return reply('account verification link is sucessfully send to your email');
      });
    });
  }
};

exports.forgotPassword = {
  description: 'request password reset email',
  tags:['api', 'User'],
  validate: {
    payload: {
      userName: Joi.string().email().required().description('email of user')
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username'));

      Email.sendMailForgotPassword(user, Auth.gettoken('userops', user));
      return reply('instructions to reset password sent to your registered email.');
    });
  }
};

exports.verifyEmail = {
  description: 'verify user email using token',
  tags:['api', 'User'],
  validate: {
    headers: Joi.object({
      'authorization': Joi.string().required().description('token from email link')
    }).options({ allowUnknown: true })
  },
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

          reply('your email verified successfully.');
        });
      },
      error: function(data) {
        if (data.boom === void 0) data.boom = 'badImplementation';
        reply(Boom[data.boom](data.message));
      }
    };

    Auth.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);
  }
};

exports.updateProfile = {
  description: 'update user profile',
  tags:['api', 'User'],
  validate: {
    payload: {
      username: Joi.string().email().description('email of user'),
      password: Joi.string().description('password of user'),
      fullname: Joi.string().description('full name of user'),
      contractid: Joi.string().description('contractid that user logged in with')
    }
  },
  auth: {
    strategy: 'token'
  },
  response: {
    schema: Joi.object({
      token: Joi.string().required().description('refreshed token')
    })
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
          Auth.hash(request.payload.password, function(error, hashedPassword) {
            user.password = hashedPassword;
            changed = true;
          });
        }

        if (request.payload.username) {
          User.findUser(request.payload.username, function(err, user) {
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

          reply(Auth.gettoken('login', user));
        });
      });
    }
  }
};

exports.invitationVerify = {
  description: 'validate the invitation token sent by email',
  tags:['api', 'User'],
  validate: {
    headers: Joi.object({
      'authorization': Joi.string().required().description('token from email link')
    }).options({ allowUnknown: true })
  },
  response: {
    schema: Joi.object({
      newuser: Joi.boolean().required().description('if user is new user'),
      contractid: Joi.string().required().description('contractid that user will open'),
      username: Joi.string().required().description('email of user'),
    })
  },
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
    };

    Auth.checkUserOpsToken(request.headers.authorization).then(callback.success, callback.error);
  }
};

exports.inviteCollaborators = {
  description: 'send invitation to other users by email',
  tags:['api', 'User'],
  validate: {
    payload: {
      contractId: Joi.string().required().description('contractid for invited users'),
      collaborators: Joi.array().required().description('array of emails to send invitation')
    },
    headers: Joi.object({
      'authorization': Joi.string().required()
    }).options({ allowUnknown: true })
  },
  auth: {
    strategy: 'token'
  },
  handler: function(request, reply) {
    console.log(request.payload);

    if (request.auth.isAuthenticated) {

      Contract.findContract(request.payload.contractId, function(err, contract){
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
                Auth.hash('temporary_pass', function(error, hashedPassword) {
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
              Email.sendMailInvitation(user, request.auth.credentials.userName, request.auth.credentials.fullname, contract.metadata.title, Auth.gettoken('invite', user, contract));
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
