// Load modules

var User   = require('./controller/user');
var Static = require('./static');

// API Server Endpoints
exports.endpoints = [

  /**
    Static pages
  */
  { method: 'GET',  path: '/{somethingss*}', config: Static.get },

  /** Create a new user
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     reminder text for email confirmation, and sends verification email
  */
  { method: 'POST', path: '/user', config: User.create },

  /** User login
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     username (email)
  *     scope (user's role)
  *     token (valid for 1 hour)
  */
  { method: 'POST', path: '/login', config: User.login },

  /** Forgot password (needs to be changed with another strategy)
  *   requires:
  *     userName: email, required
  *   returns:
  *     text for password reminder email, and sends email containing password
  */
  { method: 'POST', path: '/forgotPassword', config: User.forgotPassword },

  /** Verify email
  *   requires:
  *     Post call including token in the header (Authorization) which was sent by email
  *   returns:
  *     marks user account as verified, and sends text about confirmation
  */
  { method: 'POST', path: '/verifyEmail', config: User.verifyEmail },

  /** Resend verification email
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     reminder text for email confirmation, and sends verification email
  */
  { method: 'POST', path: '/resendVerificationEmail', config: User.resendVerificationEmail }

];
