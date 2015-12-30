// Load modules

var Static = require('./main/controller/static');
var User   = require('./main/controller/user');
var Contract   = require('./contract/controller/contract');
var Template   = require('./contract/controller/template');

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
  *     valid: boolean - makes token valid for 48hrs !!!DEVELOPMENT ONLY!!!
  *   returns:
  *     username (email)
  *     scope (user's role)
  *     fullname
  *     token (valid for 15 minutes)
  */
  { method: 'POST', path: '/login', config: User.login },

  /** Invitation login
  *   requires:
  *     userName: email, required
  *     password: required
  *   returns:
  *     username (email)
  *     scope (user's role)
  *     token (valid for 48 hours)
  */
  { method: 'POST', path: '/invitation', config: User.invitationVerify },

  /** Invite Collaborators
  *   requires:
  *     contractid: string().required(),
  *     title: string().required(),
  *     collaborators: array(emails).required()
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
  *     Old token
  *   returns:
  *     New token
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
      tag: string, tag of the draft/version
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
      drafts(bool) if exists, true or the tag of draft
      versions(bool) if exists, true or the tag of version
  */
  { method: 'POST', path: '/findmycontracts', config: Contract.findContractByUserId },

  { method: 'POST', path: '/signcontract', config: Contract.sign },
  { method: 'POST', path: '/getusersdetails', config: Contract.getUsersDetails },
  { method: 'POST', path: '/prepareforsignature', config: Contract.prepareForSignature },


  { method: 'POST', path: '/template/get', config: Template.open },
  { method: 'POST', path: '/template/list', config: Template.findTemplateByGroup },
  { method: 'POST', path: '/template/save', config: Template.save },
  { method: 'POST', path: '/template/__', config: Template.__internalTemplates },


];
