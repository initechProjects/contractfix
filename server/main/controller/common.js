// var nodemailer = require("nodemailer");
var Config    = require('../../config/config');
var crypto    = require('crypto');
var Bcrypt    = require('bcrypt-nodejs');
var Welcome   = require('./common_welcome_email.js');
var Reset   = require('./common_reset_password_email.js');
var algorithm = 'aes-256-ctr';
var sendgrid  = require('sendgrid')('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');

var privateKey = Config.token.key;

exports.decrypt = function(password) {
  return decrypt(password);
};

exports.encrypt = function(password) {
  return encrypt(password);
};

exports.hash = function(password, callback) {
  Bcrypt.genSalt(Config.params.saltRounds, function(error, salt) {
    if (error) callback(error, null);
    Bcrypt.hash(password, salt, null, callback);
  });
};

exports.checkPassword = function(password, hash, callback) {
  Bcrypt.compare(password, hash, callback);
};

exports.sendMailVerificationLink = function(user, token) {
  // var mailbody = `<p>Thanks for Registering on ${Config.email.accountName}.</p><p>Please verify your email by clicking on the verification link below.<br/><a href='http://${Config.server.host}:${Config.server.port}/${Config.email.verifyEmailUrl}/${token}'>Verification Link</a></p>`;
  var mailbody = Welcome.email(user, token);
  mail(Config.email.username, `${Config.email.accountName} Team`, user.userName , "Account Verification", mailbody);
};

exports.sendMailInvitation = function(user, sender, token) {
  var mailbody = `<p>You have received this invitation from ${sender.email}.</p><p>Please verify your email by clicking on the verification link below.<br/><a href='http://${Config.server.host}:${Config.server.port}/${Config.email.verifyEmailUrl}/${token}'>Verification Link</a></p>`;
  // var mailbody = Welcome.email(user, token);
  mail(Config.email.username, `${Config.email.accountName} Team`, user.userName , "Account Verification", mailbody);
};

exports.sendMailForgotPassword = function(user, token) {
  // var mailbody = `<p>Your ${Config.email.accountName} username: ${user.userName}.</p></p>Your password : ${decrypt(user.password)}</p>`;
  var mailbody = Reset.email(user, token);
  mail(Config.email.username, `${Config.email.accountName} Team`, user.userName , 'Account password', mailbody);
};


// method to decrypt data
function decrypt(data) {
  var decipher = crypto.createDecipher(algorithm, privateKey);
  var dec = decipher.update(data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

// method to encrypt data
function encrypt(data) {
  var cipher = crypto.createCipher(algorithm, privateKey);
  var crypted = cipher.update(data, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function mail(from, fromname, email, subject, mailbody){
  var email = new sendgrid.Email({
    to: email, // list of receivers
    from: from, // sender address
    fromname: fromname, // sender name
    subject: subject, // Subject line
    html: mailbody  // html body
  });

  sendgrid.send(email, function(err, json) {
    if (err) { return console.log(err); }
    console.log(json);
  });
}
