/*
*
* This angular module encompasses all controllers and services
* related to the redirection and processing of invited users.
*
* If a user does not have an account, they will be asked to provide
* a full name before being registered.  If the invited user already
* has an account, they will be redirected to the login page.
*
*/

angular.module('app.invitation', [])


.controller('invitationController', function ($scope, $rootScope, $window, $location, $http) {

  var url = $location.url();
  var token = url.slice(url.indexOf("=")).slice(1);

  $scope.validateInvite = function(){

    $http({
      method: 'POST',
      url: '/invitation',
      headers: {
        'Authorization': token,
        'Content-Type' : 'application/json'
      }
    })
    .success(function(data){
      $scope.response = data;
      console.log(data);
    })
    .catch(function(err){
      console.log(err);
    })
  };

  // Execute immediate token verification on page-load.

  angular.element(document).ready(function () {
    console.log('page loaded')
    $scope.validateInvite();
  });
});


/*-----------------------------------------------------------------------------
*
* Developer notes.
*
*------------------------------------------------------------------------------

newuser (true/false)
contractid (string)
username (email address)
*/
//if new user
  //route to name and password page
  //pass with contract id to new page
    //on new page call update profile with full name, pass, contract id
    //receive login token/contract id
      //open editor page with contract id
      //save token in memeory ($rootscope)

//if returning user
  //forward to login page with contract id & username

  //in login page, username will be already filled in
    //when login, call login with username, password and contract id
    //receive token & contract id
      //send to editor page with contract id