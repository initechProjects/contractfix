'user strict';

var sendgrid  = require('sendgrid')('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');
var Config    = require('../../config/config');
var Welcome   = require('./emailtemplates/email_welcome_email.js');
var Reset   = require('./emailtemplates/email_reset_password_email.js');


var mail = function(from, fromname, email, subject, mailbody){
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
};

exports.sendMailVerificationLink = function(user, token) {
  var mailbody = Welcome.email(user, token);
  mail(Config.email.username, `${Config.email.companyName} Team`, user.userName , "Account Verification", mailbody);
};

exports.sendMailInvitation = function(user, senderemail, sendername, title, token) {
  var mailbody = `<p>You have received this invitation from ${sendername}.</p><p>You can clicking on the link below to review, comment and sign ${title}.<br/><a href='http://${Config.server.host}/#/${Config.email.invitationUrl}?q=${token}'>Verification Link</a></p>`;
  mail(Config.email.username, `${Config.email.companyName} Team`, user.userName , `Invitation to ${title}`, mailbody);
};

exports.sendMailForgotPassword = function(user, token) {
  var mailbody = Reset.email(user, token);
  mail(Config.email.username, `${Config.email.companyName} Team`, user.userName , 'Account password', mailbody);
};

exports.sendMailSignedWarning = function(fullname, username, title, contractId) {
  var mailbody = `<p>Dear ${fullname}</p><p>Other party signed ${title}.<br/><p>If you want to check your contract, please click below link:</p><p><a href='http://${Config.server.host}/#/${Config.email.loginUrl}?q=${contractId}'>http://${Config.server.host}/#/${Config.email.loginUrl}?q=${contractId}</a>`;
  mail(Config.email.username, `${Config.email.companyName} Team`, username , `ContractFix: ${title} signed`, mailbody);
};
