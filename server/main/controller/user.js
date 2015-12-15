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
    request.payload.password = Common.encrypt(request.payload.password);
    request.payload.scope = ['registered'];
    User.saveUser(request.payload, function(err, user) {
      if (!err) {
        var tokenData = {
          userName: user.userName,
          scope: user.scope,
          id: user._id
        };
        Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresInMinutes: Config.token.expiry.emailVerification } ));
        reply('Please confirm your email id by clicking on link in email');
      } else {
        if ( err.code === 11000 || err.code === 11001 ) {
          reply(Boom.forbidden('please provide another user email'));
        } else {
          reply(Boom.forbidden(err)); // HTTP 403
        }
      }
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
      if (!err) {
        if (user === null) return reply(Boom.forbidden('invalid username or password'));
        if (request.payload.password === Common.decrypt(user.password)) {

          if(!user.isVerified) return reply(Boom.forbidden('Your email address is not verified. please verify your email address to proceed'));

          var tokenData = {
              userName: user.userName,
              scope: user.scope,
              id: user._id
          };
          var res = {
              username: user.userName,
              scope: user.scope,
              token: Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresInMinutes: Config.token.expiry.refresh })
          };

          reply(res);
        } else {
          reply(Boom.forbidden('invalid username or password'));
        }
      } else {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }
    });
  }
};

exports.resendVerificationEmail = {
  validate: {
    payload: {
      userName: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    User.findUser(request.payload.userName, function(err, user) {
      if (!err) {
        if (user === null) return reply(Boom.forbidden('invalid username or password'));
        if (request.payload.password === Common.decrypt(user.password)) {

          if(user.isVerified) return reply('your email address is already verified');

          var tokenData = {
            userName: user.userName,
            scope: [user.scope],
            id: user._id
          };
          Common.sendMailVerificationLink(user, Jwt.sign(tokenData, privateKey, { algorithm: 'HS256', expiresInMinutes: Config.token.expiry.emailVerification }));
          reply('account verification link is sucessfully send to your email');
        } else reply(Boom.forbidden('invalid username or password'));
      } else {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }
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
      if (!err) {
        if (user === null) return reply(Boom.forbidden('invalid username'));
        Common.sendMailForgotPassword(user);
        reply('password is send to registered email id');
      } else {
        console.error(err);
        return reply(Boom.badImplementation(err));
      }
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

