'use strict';

var Boom           = require('boom');
var Jwt            = require('jsonwebtoken');
var crypto         = require('crypto');
var Bcrypt         = require('bcrypt-nodejs');
var Config         = require('../../config/config');
var User           = require('../model/user').User;

var tokenKey       = Config.token.key;
var encryptionKey  = Config.encryption.key;
var encryptionAlgo = Config.encryption.algorithm;


module.exports = {
  encrypt: function encrypt(data) {
    var cipher = crypto.createCipher(encryptionAlgo, encryptionKey);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  decrypt: function decrypt(data) {
    var decipher = crypto.createDecipher(encryptionAlgo, encryptionKey);
    var dec = decipher.update(data, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },
  hash: function(password, callback) {
    Bcrypt.genSalt(Config.params.saltRounds, function(error, salt) {
      if (error) callback(error, null);
      Bcrypt.hash(password, salt, null, callback);
    });
  },
  checkPassword: Bcrypt.compare, //(password, hash, callback)
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
    var expiration = Config.dev ? 24*30*3600 : types[operation].expires;
console.log(expiration);
    return Jwt.sign(tokenData, tokenKey, { algorithm: Config.token.algorithm, expiresIn: expiration });
  },
  checkUserOpsToken: function(token) {
    var promise = new Promise(function(resolve, reject) {
      Jwt.verify(token, tokenKey, { algorithm: Config.token.algorithm }, function(err, decoded) {
        if (err) {
          console.error(err);
          return reject({ boom: 'badImplementation', message: err });
        }
        if(decoded === undefined) {
          console.log('decoded undefined');
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
  },
};

