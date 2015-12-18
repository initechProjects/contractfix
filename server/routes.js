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

  /** Invitation login
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     username (email)
  *     scope (user's role)
  *     token (valid for 1 hour)
  */
  { method: 'POST', path: '/invitationlogin', config: User.invitationLogin },

  /** Invite Collaborators
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     username (email)
  *     scope (user's role)
  *     token (valid for 1 hour)
  */
  { method: 'POST', path: '/invite', config: User.inviteCollaborators },

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

  /** Update profile
  *   requires:
  *     token in the header (Authorization)
  *
  *     username: optional (email - if sent, username will be changed)
  *     password: optional (if sent, password will be changed)
  *     fullname: optional (if sent, fullname will be changed)
  *
  *   returns:
  *     OK - 200
  */
  { method: 'POST', path: '/updateprofile', config: User.updateProfile },

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
      title: string
      comments: array of string
      templateId: if contract created based on existing template, id should be passed
      personal: boolean, if true, it will be saved as personal draft
  */
  { method: 'POST', path: '/savecontract', config: Contract.save },

  /** Get contract
    requires:
      in Headers -> Authorization: 'Bearer ' + token

      contracti§d: STRING
  */
  { method: 'POST', path: '/opencontract', config: Contract.open },

  /** Find user's contracts
    requires:
      token only

    returns:
      id
      title
      drafts(bool)
      versions(bool)
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
