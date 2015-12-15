'use strict';

var Hapi   = require('hapi');
var Routes = require('./routes');
var Db     = require('./config/db');
// var Moment = require('moment');
var Config = require('./config/config');
var JwtToken = require('hapi-auth-jwt');

var app = {};
app.config = Config;

var privateKey = app.config.token.key;
var ttl = app.config.token.expiry.refresh;

var server = new Hapi.Server();
server.connection({ port: app.config.server.port });

// Plugins
server.register([{
  register: JwtToken
}],
function(err) {
  server.auth.strategy('token', 'jwt', {
    validateFunc: app.config.validate,
    key: privateKey,
    verifyOptions: { algorithms: ['HS256'] }  // only allow HS256 algorithm
  });

  server.route(Routes.endpoints);
});

server.start(function() {
  console.log('Server started ', server.info.uri);
});
