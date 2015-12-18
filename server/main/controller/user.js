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
        console.log('returned from mongo');
        // if (err) return reply(Boom.badImplementation(err));

        if (!err) {
          var tokenData = {
            userName: user.userName,
            scope: user.scope,
            id: user._id
          };
          Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification } ));
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

        var tokenData = {
          userName: user.userName,
          password: user.password,
          fullname: user.fullname,
          scope: user.scope,
          id: user._id
        };
        var res = {};

        res.username = user.userName;
        if (user.userName) res.fullname = user.userName;
        res.scope = user.scope;

        if (request.payload.valid) {
          res.token = Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification });
        } else {
          res.token = Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.refresh });
        }

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
      var tokenData = {
        userName: request.auth.credentials.userName,
        password: request.auth.credentials.password,
        fullname: request.auth.credentials.fullname,
        scope: request.auth.credentials.scope,
        id: request.auth.credentials._id
      };
      var res = {
        username: request.auth.credentials.userName,
        scope: request.auth.credentials.scope,
        token: Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.refresh })
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
    Jwt.verify(request.headers.authorization, privateKey, { algorithm: 'HS256' }, function(err, decoded) {
      if(decoded === undefined) {
        console.log('decoded undefined', request.headers.authorization);
        return reply(Boom.forbidden('invalid verification link'));
      }
      if(decoded.scope[0] !== 'registered') {
        console.log('not registered', decoded.scope[0]);
        return reply(Boom.forbidden('invalid verification link'));
      }
      User.findUserByIdAndUserName(decoded.id, decoded.userName, function(err, user){
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (user === null) {
          console.log('user not found', decoded.userName);
          return reply(Boom.forbidden('invalid verification link'));
        }
        if (user.isVerified === false) return reply(Boom.forbidden('email is not verified'));

        Common.hash(request.payload.password, function(error, hashedPassword) {
          user.password = hashedPassword;

          User.updateUser(user, function(err, user) {
            if (err) {
              console.error(err);
              return reply(Boom.badImplementation(err));
            }

            return reply('password changed successfully.');
          });
        });
      });
    });
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

        var tokenData = {
          userName: user.userName,
          scope: user.scope,
          id: user._id
        };
        Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification }));
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

      var tokenData = {
        userName: user.userName,
        scope: user.scope,
        id: user._id
      };

      Common.sendMailForgotPassword(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.refresh }));
      return reply('instructions to reset password sent to your registered email.');
    });
  }
};

exports.verifyEmail = {
  handler: function(request, reply) {
    Jwt.verify(request.headers.authorization, privateKey, { algorithm: 'HS256' }, function(err, decoded) {
      if(decoded === undefined) {
        console.log('decoded undefined', request.headers.authorization);
        return reply(Boom.forbidden('invalid verification link'));
      }
      if(decoded.scope[0] !== 'registered') {
        console.log('not registered', decoded.scope[0]);
        return reply(Boom.forbidden('invalid verification link'));
      }
      User.findUserByIdAndUserName(decoded.id, decoded.userName, function(err, user){
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (user === null) {
          console.log('user not found', decoded.userName);
          return reply(Boom.forbidden('invalid verification link'));
        }
        if (user.isVerified === true) return reply(Boom.forbidden('account is already verified'));
        user.isVerified = true;
        User.updateUser(user, function(err, user){
          if (err) {
            console.error(err);
            return reply(Boom.badImplementation(err));
          }
          return reply('account sucessfully verified');
        });
      });
    });
  }
};

exports.updateProfile = {
  validate: {
    payload: {
      username: Joi.string().email(),
      password: Joi.string(),
      fullname: Joi.string()
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
          user.fullname = request.payload.password;
          changed = true;
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

          return reply('updated successfully.');
        });
      });
    }
  }
};

exports.invitationLogin = {
  // TO BE CHANGED TOTALLY
  validate: {
    payload: {
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    Jwt.verify(request.headers.authorization, privateKey, { algorithm: 'HS256' }, function(err, decoded) {
      if(decoded === undefined) {
        console.log('decoded undefined', request.headers.authorization);
        return reply(Boom.forbidden('invalid verification link'));
      }
      if(decoded.scope[0] !== 'registered') {
        console.log('not registered', decoded.scope[0]);
        return reply(Boom.forbidden('invalid verification link'));
      }
      User.findUserByIdAndUserName(decoded.id, decoded.userName, function(err, user){
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(err));
        }
        if (user === null) {
          console.log('user not found', decoded.userName);
          return reply(Boom.forbidden('invalid verification link'));
        }
        if (user.isVerified === false) return reply(Boom.forbidden('email is not verified'));

        Common.hash(request.payload.password, function(error, hashedPassword) {
          user.password = hashedPassword;

          User.updateUser(user, function(err, user) {
            if (err) {
              console.error(err);
              return reply(Boom.badImplementation(err));
            }

            return reply('password changed successfully.');
          });
        });
      });
    });
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

        request.payload.collaborators.forEach(function(email, index) {
          User.findUser(email, function(err, user) {

            if (err) {
              console.error(err);
              return reply(Boom.badImplementation(err));
            }

            if (user === null) {

              promises[index] = new Promise(function(resolve, reject) {

                Common.hash('temporary_pass', function(error, hashedPassword) {
                  request.payload.password = hashedPassword;

                  user = {};
                  user.userName = email;
                  user.scope = ['registered'];
                  user.isInvited = true;
                  user.password = hashedPassword;

                  User.saveUser(user, function(err, result) {
                    if (err) {
                      console.error(err);
                      reject('db write error');
                      return reply(Boom.badImplementation(err));
                    }

                    user._id = result._id;

                    let tokenData = {
                      userName: user.userName,
                      scope: user.scope,
                      id: user._id
                    };

                    contract.users.push(user._id);

                    Common.sendMailVerificationLink(user, request.auth.credentials.fullname, request.payload.title, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification } ));

                    Contract.updateContract(contract, function(err, result) {
                      if (err) {
                        console.error(err);
                        reject('db write error');
                        return reply(Boom.badImplementation(err));
                      }

                      if (result === null) {
                        reject('contract not found');
                        reply(Boom.badImplementation('contract cannot be saved'));
                      }

                      resolve(user);
                    });
                  });
                });
              });

            } else {
              contract.users.push(user._id);

              var tokenData = {
                userName: user.userName,
                scope: user.scope,
                id: user._id
              };

              Common.sendMailVerificationLink(user, request.auth.credentials.fullname, request.payload.title, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification } ));

              Contract.updateContract(contract, function(err, result) {
                if (err) {
                  console.error(err);
                  return reply(Boom.badImplementation(err));
                }

                if (result === null) reply(Boom.badImplementation('contract cannot be saved'));

                return reply('Invitation(s) sent');
              });
            }

          });

        });
      });

    }

    return reply('Invitation(s) sent');

    // let user ={};


    // Common.hash(request.payload.password, function(error, hashedPassword) {
    //   request.payload.password = hashedPassword;

    //   User.saveUser(request.payload, function(err, user) {
    //     console.log('returned from mongo');
    //     // if (err) return reply(Boom.badImplementation(err));

    //     if (!err) {
    //       var tokenData = {
    //         userName: user.userName,
    //         scope: user.scope,
    //         id: user._id
    //       };
    //       Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification } ));
    //       return reply('Please confirm your email id by clicking on link in email');
    //     } else {
    //       if ( err.code === 11000 || err.code === 11001 ) {
    //         return reply(Boom.forbidden('please provide another user email'));
    //       } else {
    //         return reply(Boom.forbidden(err)); // HTTP 403
    //       }
    //     }
    //   });
    // });
  }
};
