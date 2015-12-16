var Config    = require('../../config/config');

exports.email = function(user, token) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Welcome to ${Config.email.accountName}!</title>
    <style type="text/css" rel="stylesheet" media="all">
      /* Base ------------------------------ */
      *:not(br):not(tr):not(html) {
        font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
      }
      body {
        width: 100% !important;
        height: 100%;
        margin: 0;
        line-height: 1.4;
        background-color: #F2F4F6;
        color: #74787E;
        -webkit-text-size-adjust: none;
      }
      a {
        color: #3869D4;
      }

      /* Layout ------------------------------ */
      .email-wrapper {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #F2F4F6;
      }
      .email-content {
        width: 100%;
        margin: 0;
        padding: 0;
      }

      /* Masthead ----------------------- */
      .email-masthead {
        padding: 25px 0;
        text-align: center;
      }
      .email-masthead_logo {
        max-width: 400px;
        border: 0;
      }
      .email-masthead_name {
        font-size: 16px;
        font-weight: bold;
        color: #bbbfc3;
        text-decoration: none;
        text-shadow: 0 1px 0 white;
      }

      /* Body ------------------------------ */
      .email-body {
        width: 100%;
        margin: 0;
        padding: 0;
        border-top: 1px solid #EDEFF2;
        border-bottom: 1px solid #EDEFF2;
        background-color: #FFF;
      }
      .email-body_inner {
        width: 570px;
        margin: 0 auto;
        padding: 0;
      }
      .email-footer {
        width: 570px;
        margin: 0 auto;
        padding: 0;
        text-align: center;
      }
      .email-footer p {
        color: #AEAEAE;
      }
      .body-action {
        width: 100%;
        margin: 30px auto;
        padding: 0;
        text-align: center;
      }
      .body-sub {
        margin-top: 25px;
        padding-top: 25px;
        border-top: 1px solid #EDEFF2;
      }
      .content-cell {
        padding: 35px;
      }
      .align-right {
        text-align: right;
      }

      /* Type ------------------------------ */
      h1 {
        margin-top: 0;
        color: #2F3133;
        font-size: 19px;
        font-weight: bold;
        text-align: left;
      }
      h2 {
        margin-top: 0;
        color: #2F3133;
        font-size: 16px;
        font-weight: bold;
        text-align: left;
      }
      h3 {
        margin-top: 0;
        color: #2F3133;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
      }
      p {
        margin-top: 0;
        color: #74787E;
        font-size: 16px;
        line-height: 1.5em;
        text-align: left;
      }
      p.sub {
        font-size: 12px;
      }
      p.center {
        text-align: center;
      }

      /* Buttons ------------------------------ */
      .button {
        display: inline-block;
        width: 200px;
        background-color: #3869D4;
        border-radius: 3px;
        color: #ffffff;
        font-size: 15px;
        line-height: 45px;
        text-align: center;
        text-decoration: none;
        -webkit-text-size-adjust: none;
        mso-hide: all;
      }
      .button--green {
        background-color: #22BC66;
      }
      .button--red {
        background-color: #dc4d2f;
      }
      .button--blue {
        background-color: #3869D4;
      }

      /*Media Queries ------------------------------ */
      @media only screen and (max-width: 600px) {
        .email-body_inner,
        .email-footer {
          width: 100% !important;
        }
      }
      @media only screen and (max-width: 500px) {
        .button {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
            <!-- Logo -->
            <tr>
              <td class="email-masthead">
                <a class="email-masthead_name">${Config.email.accountName}</a>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="100%">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell">
                      <h1>Hi,</h1>
                      <p>Thanks for signing up for ${Config.email.accountName}. We’re very excited to have you on board.</p>
                      <p>To get started using ${Config.email.accountName}, please confirm your account below:</p>
                      <!-- Action -->
                      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <div>
                              <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://${Config.server.host}:${Config.server.port}/#/${Config.email.verifyEmailUrl}/${token}" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="7%" stroke="f" fill="t">
                              <v:fill type="tile" color="#22BC66" />
                              <w:anchorlock/>
                              <center style="color:#ffffff;font-family:sans-serif;font-size:15px;">Confirm your account</center>
                            </v:roundrect><![endif]-->
                              <a href="http://${Config.server.host}:${Config.server.port}/#/${Config.email.verifyEmailUrl}/${token}" class="button button--green">Confirm your account</a>
                            </div>
                          </td>
                        </tr>
                      </table>
                      <p>For your reference, your username is <strong>${user.userName}</strong> for logging in.</p>
                      <p>Thanks,<br>${Config.email.accountName} Team</p>
                      <p><strong>P.S.</strong> Need help getting started? Check out our help documentation. Or, just reply to this email with any questions or issues you have. The ${Config.email.accountName} support team is always excited to help you.</p>
                      <!-- Sub copy -->
                      <table class="body-sub">
                        <tr>
                          <td>
                            <p class="sub">If you’re having trouble clicking the confirm account button, copy and paste the URL below into your web browser.
                            </p>
                            <p class="sub"><a href="http://${Config.server.host}:${Config.server.port}/#/${Config.email.verifyEmailUrl}/${token}">http://${Config.server.host}:${Config.server.port}/#/${Config.email.verifyEmailUrl}/${token}</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-cell">
                      <p class="sub center">&copy; 2015 ${Config.email.accountName}. All rights reserved.</p>
                      <p class="sub center">
                        ${Config.email.accountName}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};
