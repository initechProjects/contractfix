var Joi    = require('joi');
var Boom   = require('boom');
var Common = require('./common');
var Config = require('../../config/config');
var Jwt    = require('jsonwebtoken');
var User   = require('../model/user').User;

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
          var tokenData = {
            userName: user.userName,
            scope: user.scope,
            id: user._id
          };
          Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification } ));
          reply('Please confirm your email id by clicking on link in email');
        } else {
          if ( err.code === 11000 || err.code === 11001 ) {
            reply(Boom.forbidden('please provide another user email'));
          } else {
            reply(Boom.forbidden(err)); // HTTP 403
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
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (err) {
        console.error(err);
        reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));

      Common.checkPassword(request.payload.password, user.password, function(err, result) {
        if (err) {
          console.error(err);
          reply(Boom.badImplementation(err));
        }
        if (!result) reply(Boom.forbidden('invalid username or password'));
        if(!user.isVerified) return reply(Boom.forbidden('Your email address is not verified. please verify your email address to proceed'));

        var tokenData = {
          userName: user.userName,
          scope: user.scope,
          id: user._id
        };
        var res = {
          username: user.userName,
          scope: user.scope,
          token: Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.refresh })
        };

        reply(res);

      });
    });
  }
};

exports.changePassword = {
  validate: {
    payload: {
      password: Joi.string().required()
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
          reply(Boom.badImplementation(err));
        }

        if (user === null) return reply(Boom.forbidden('invalid username or password'));

        Common.hash(request.payload.password, function(error, hashedPassword) {
          user.password = hashedPassword;

          User.updateUser(user, function(err, user) {
            if (err) {
              console.error(err);
              reply(Boom.badImplementation(err));
            }

            reply('password changed successfully.');
          });
        });
      });
    }
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
        reply(Boom.badImplementation(err));
      }

      if (user === null) return reply(Boom.forbidden('invalid username or password'));

      Common.checkPassword(request.payload.password, user.password, function(err, result) {
        if (err) {
          console.error(err);
          reply(Boom.badImplementation(err));
        }
        if (!result) reply(Boom.forbidden('invalid username or password'));

        if(user.isVerified) return reply('your email address is already verified');

        var tokenData = {
          userName: user.userName,
          scope: [user.scope],
          id: user._id
        };
        Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresIn: Config.token.expiry.emailVerification }));
        reply('account verification link is sucessfully send to your email');
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
      reply('instructions to reset password sent to your registered email.');
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

