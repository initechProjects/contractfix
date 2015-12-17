var Boom   = require('boom');
var User   = require('../main/model/user').User;
var Common = require('../main/controller/common');

var config = {
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
    key: 'f16fc55d48f2494d',
    expiry: {
      emailVerification: 24 * 60 * 60, //1 day
      refresh: 15 * 60 //15 minutes
    }
  },
  email: {
    username: 'team@contractfix.com',
    accountName: 'ContractFix',
    verifyEmailUrl: 'verifyemail',
    resetPasswordUrl: 'resetpassword'
  },
  // Validate function for auth
  validate: function(request, token, callback) {

    if (token === undefined) {
      console.log('token undefined');
      return callback(Boom.forbidden('wrong token'), false);
    }
    // if (token.userName !== request.payload.username) {
    //   console.log('request damaged', request.headers.authorization);
    //   return callback(Boom.forbidden('request damaged'), false);
    // }
    if (token.scope.indexOf('registered') < 0 && token.scope !== 'registered') {
      console.log('not registered', token.scope[0]);
      return callback(Boom.forbidden('wrong token'), false);
    }
    User.findUserByIdAndUserName(token.id, token.userName, function(err, user){
      if (err) {
        console.error(err);
        return callback(Boom.badImplementation(err), false);
      }
      if (user === null) {
        console.log('user not found', token.userName);
        return callback(Boom.forbidden('user not found'), false);
      }
      if (user.isVerified === false) {
        console.log('user not verified', token.userName);
        return callback(Boom.forbidden('user not verified'), false);
      }
      if (user.isRevoked === true) {
        console.log('user is suspended', token.userName);
        return callback(Boom.forbidden('user is suspended'), false);
      }
      if (user.userName !== token.userName) {
        console.log('request damaged');
        return callback(Boom.forbidden('request damaged'), false);
      }

      console.log(token.password);
      console.log(user.password);

      if (token.password !== user.password) {
        console.log("User's password has been changed");
        return callback(Boom.forbidden("user's password has been changed"), false);
      }

      // If passed all above, user is authenticated
      // add user's id to user's scope and send user credentials to callback
      user.scope.push(user._id);
      return callback(null, true, user);

    });
  }

};

module.exports = config;
