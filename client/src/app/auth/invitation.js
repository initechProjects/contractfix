angular.module('app.invitation', [])


.controller('invitationController', function ($scope, $rootScope, $window, $location, $http, $timeout) {
  console.log('controller');
   var url = $location.url();
   var token = url.slice(url.indexOf("=")).slice(1);
   console.log(token);
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
      console.log('SUCCESS');
      $scope.response = data;
      //$timeout(function(){ $location.path("/dashboard")}, 3000);
      console.log(data);
    })
    .catch(function(err){
      console.log(err);
    })
  };

  angular.element(document).ready(function () {
    console.log('page loaded')
    $scope.validateInvite();
  });
});
/*
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