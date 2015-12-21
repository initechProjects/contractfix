'use strict';

var Hapi     = require('hapi');

var Config   = require('./config/config');
var Auth     = require('./main/auth');
var Routes   = require('./routes');
var Db       = require('./config/db');
// var Package  = ;

var server = new Hapi.Server();
server.connection({ port: Config.server.port });

// Plugins
server.register([
  {
    register: require('hapi-auth-jwt')
  },
  {
    register: require('inert')
  },
  {
    register: require('blipp'),
    options: {
      showAuth: true
    }
  },
  {
    register: require('vision')
  },
  {
    register: require('hapi-swagger'),
    options: {
      apiVersion: require('../package.json').version,
      info: {
        title: 'ContractFix API'
      }
    }
  },
],
function(err) {
  server.auth.strategy('token', 'jwt', {
    validateFunc: Auth.validate,
    key: Config.token.key,
    verifyOptions: { algorithms: [Config.token.algorithm] }
  });

  server.route(Routes.endpoints);
});

server.on('response', function (request) {
    console.log(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
});

server.start(function() {
  console.log('Server started ', server.info.uri);
});
