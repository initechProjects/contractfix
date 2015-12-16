// Load modules

var Static = require('./main/controller/static');
var User   = require('./main/controller/user');
var Contract   = require('./contract/controller/contract');

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
  { method: 'POST', path: '/forgotpassword', config: User.forgotPassword },

  /** Verify email
  *   requires:
  *     Post call including token in the header (Authorization) which was sent by email
  *   returns:
  *     marks user account as verified, and sends text about confirmation
  */
  { method: 'POST', path: '/verifyemail', config: User.verifyEmail },

  /** Reset password
  *   requires:
  *     Post call including token in the header (Authorization) which was sent by email
  *     and password in body
  *   returns:
  *     changes password and returns confirmation message
  */
  { method: 'POST', path: '/resetpassword', config: User.resetPassword },

  /** Refresh token
  *   requires:
  *     Post call including token in the header (Authorization) which was sent by email
  *     and password in body
  *   returns:
  *     changes password and returns confirmation message
  */
  { method: 'POST', path: '/refreshtoken', config: User.refreshToken },

  /** Resend verification email
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     reminder text for email confirmation, and sends verification email
  */
  { method: 'POST', path: '/resendverificationemail', config: User.resendVerificationEmail },

  /** Save contract
    requires:
      in Headers -> Authorization: 'Bearer ' + token

      in Body:
      contractId: required to update, if null new contract
      text: latest text of the contract
      comments: array of string
      templateId: if contract created based on existing template, id should be passed
      personal: boolean, if true, it will be saved as personal draft
  */
  { method: 'POST', path: '/savecontract', config: Contract.save },

  /** Get contract
    requires:
      in Headers -> Authorization: 'Bearer ' + token

      contractId: STRING
  */
  { method: 'POST', path: '/opencontract', config: Contract.open },

  /** Find user's contracts
    requires:
      contractId: STRING
  */
  { method: 'POST', path: '/findmycontracts', config: Contract.findContractByUserId },

  // // Auth test route
  // { method: 'GET', path: '/test', config:
  //   {
  //     auth: {
  //       strategy: 'token',
  //       scope: ['admin', '7884ffd0-a078-11e5-a51b-33808da5a148']
  //     },

  //     handler: function(request, reply) {
  //       if (request.auth.isAuthenticated) {
  //         console.log(request.auth.credentials._id);
  //         console.log(request.auth.credentials.userName);
  //         console.log(request.auth.credentials.scope);
  //         return reply('success');
  //       }
  //     }
  //   }
  // }

];
