var Mongoose = require('mongoose');
var config   = require('./config');

var path = 'mongodb://initech:hrr9@ds037215.mongolab.com:37215/heroku_vtlmqz20';

// Mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);
Mongoose.connect(path);
var db = Mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
  console.log('Connection with database succeeded.');
});

exports.Mongoose = Mongoose;
exports.db = db;
