'use strict';

// var Confidence   = require('confidence');

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
    key: 'f16fc55d48f2494d',
    algorithm: 'HS256'
  },
  encryption: {
    key: 'f6ec95b3f51f468fb48a5239c985c808',
    algorithm: 'aes-256-ctr'
  },
  email: {
    username: 'team@contractfix.com',
    companyName: 'ContractFix',
    verifyEmailUrl: 'verifyemail',
    invitationUrl: 'invitation',
    resetPasswordUrl: 'resetpassword',
    loginUrl: 'login'
  }
};


module.exports = config;
