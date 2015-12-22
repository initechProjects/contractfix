/*-----------------------------------------------------------------------------
* This angular module encompasses all controllers and services
* related to the redirection and processing of invited users.
* If a user does not have an account, they will be asked to provide
* a full name before being registered.  If the invited user already
* has an account, they will be redirected to the login page. In
* either case, the user will arrive at the editor page after
* registration/login.
-----------------------------------------------------------------------------*/

angular.module('app.invitation', [])

.controller('invitationController', function ($scope, $rootScope, $window, $location, $http) {
  console.log("I am inside invitationCtrl");
  var url = $location.url();
  var token = url.slice(url.indexOf("=")).slice(1);
  console.log(token);

    $http({
      method: 'POST',
      url: '/invitation',
      headers: {
        'Authorization': token,
        'Content-Type' : 'application/json'
      },
      data: {}
    })
    .success(function(data){
      $scope.response = data;
      console.log(data);
    
    })
    .catch(function(err){
      console.log(err);
    })
 

});