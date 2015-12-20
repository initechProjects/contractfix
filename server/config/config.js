'use strict';

var Boom   = require('boom');
var User   = require('../main/model/user').User;
var Common = require('../main/controller/common');
var Jwt    = require('jsonwebtoken');

var config = {
  dev: true,
  params: {
    saltRounds: 12
  },
  server: {
    host: '127.0.0.1',
    port: 8000
  },
  database: {
    host: '127.0.0.1',
    port: 27017,
    db: 'ContractFix',
    username: '',
    password: ''
  },
  token: {
    key: 'f16fc55d48f2494d'
    // expiry: {
    //   emailVerification: 24 * 60 * 60, //1 day
    //   refresh: 15 * 60 //15 minutes
    // }
  },
  email: {
    username: 'team@contractfix.com',
    accountName: 'ContractFix',
    verifyEmailUrl: 'verifyemail',
    invitationUrl: 'invitation',
    resetPasswordUrl: 'resetpassword'
  },
  // Validate function for auth
  validate: function(request, token, callback) {

    if (token === undefined) {
      console.log('token undefined');
      return callback(Boom.forbidden('verification: wrong token'), false);
    }

    if (token.scope.indexOf('registered') < 0 && token.scope !== 'registered') {
      console.log('verification: not registered', token.scope[0]);
      return callback(Boom.forbidden('verification: wrong token'), false);
    }
    User.findUserByIdAndUserName(token.id, token.username, function(err, user){
      if (err) {
        console.error(err);
        return callback(Boom.badImplementation(err), false);
      }
      if (user === null) {
        console.log('verification: user not found', token.username);
        return callback(Boom.forbidden('verification: user not found'), false);
      }
      if (user.userName !== token.username) {
        console.log('verification: request damaged');
        return callback(Boom.forbidden('verification: request damaged'), false);
      }
      if (user.isVerified === false) {
        console.log('verification: user not verified', token.username);
        return callback(Boom.forbidden('verification: user not verified'), false);
      }
      if (user.isRevoked === true) {
        console.log('verification: user is suspended', token.username);
        return callback(Boom.forbidden('verification: user is suspended'), false);
      }
      if (user.password !== token.password) {
        console.log("verification: User's password has been changed");
        return callback(Boom.forbidden("verification: user's password has been changed"), false);
      }

      // If passed all above, user is authenticated
      // add user's id to user's scope and send user credentials to callback
      user.scope.push(user._id);
      return callback(null, true, user);

    });
  },
  gettoken: function(operation, user, contract) {
    let tokenData = {};

    let types = {
      userops : {
        fields  : {
          users: [['username', 'userName'], ['scope', 'scope'], ['id', '_id']],
        },
        expires : 48 * 60 * 60 // 48 hrs in seconds
      },
      login   : {
        fields  : {
          users: [['username', 'userName'], ['scope', 'scope'], ['id', '_id'], ['password', 'password']]
        },
        expires : 15 * 60 // 15 mins in seconds
      },
      invite  : {
        fields  : {
          users: [['username', 'userName'], ['scope', 'scope'], ['id', '_id']],
          contracts : [['contractid', '_id']]
        },
        expires : 48 * 60 * 60 // 48 hrs in seconds
      }
    };

    types[operation].fields.users.forEach(function(field) {
      tokenData[field[0]] = user[field[1]];
    });

    if (contract) {
      types[operation].fields.contracts.forEach(function(field) {
        tokenData[field[0]] = contract[field[1]];
      });
    }

    console.log('dev:', config.dev);

    var expiration = config.dev ? 24*30*3600 : types[operation].expires

    return Jwt.sign(tokenData, config.token.key, { algorithm: 'HS256', expiresIn: expiration });
  },
  checkUserOpsToken: function(token) {
    var promise = new Promise(function(resolve, reject) {
      Jwt.verify(token, config.token.key, { algorithm: 'HS256' }, function(err, decoded) {

        if (err) {
          console.error(err);
          return reject({ boom: 'badImplementation', message: err });
        }
        if(decoded === undefined) {
          console.log('decoded undefined', request.headers.authorization);
          return reject({ boom: 'forbidden', message: 'invalid verification link' });
        }
        if(decoded.scope[0] !== 'registered') {
          console.log('not registered', decoded.scope[0]);
          return reject({ boom: 'forbidden', message: 'invalid verification link' });
        }
        User.findUserByIdAndUserName(decoded.id, decoded.username, function(err, user){
          if (err) {
            console.error(err);
            return reject({ boom: 'badImplementation', message: err });
          }
          if (user === null) {
            console.log('user not found', decoded.username);
            return reject({ boom: 'forbidden', message: 'invalid verification link' });
          }

          if (decoded.contractid) user.contractid = decoded.contractid;

          return resolve(user);
        });
      });
    });

    return promise;
  }
};


module.exports = config;
