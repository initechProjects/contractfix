var Hapi   = require('hapi');
var Routes = require('./routes');
var Db     = require('./config/db');
var Moment = require('moment');
var Config = require('./config/config');
var JwtToken = require('hapi-auth-jwt');

var app = {};
app.config = Config;

var privateKey = app.config.key.privateKey;
var ttl = app.config.key.tokenExpiry;

var server = new Hapi.Server();
server.connection({ port: app.config.server.port });

// Validate function to be injected
var validate = function(request, token, callback) {
  // Check token timestamp
  var diff = Moment().diff(Moment(token.iat * 1000));
  if (diff > ttl) {
    return callback(null, false);
  }
  callback(null, true, token);
};
// Plugins
server.register([{
  register: JwtToken
}],
function(err) {
  server.auth.strategy('token', 'jwt', {
    validateFunc: validate,
    key: privateKey
  });

  server.route(Routes.endpoints);
});

server.start(function() {
  console.log('Server started ', server.info.uri);
});
