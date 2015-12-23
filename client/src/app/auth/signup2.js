angular.module('app.signup2', [])


.controller('signup2Controller', function ($scope, $rootScope, $window, $location, $http, $timeout) {
  console.log($rootScope.authResult.token);
  var token = $rootScope.authResult.token;
   $scope.flag = false;
   
   $scope.enterName = function(fullname){
    $http({
      method: 'POST',
      url: '/updateprofile',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type' : 'application/json'
      },
      data: {
        'fullname': fullname
      }
    })
    .success(function(data){
      //internal server error?
      $scope.flag = true;
      $scope.response = data;
      $timeout(function(){ $location.path("/dashboard")}, 3000);
      console.log(data);
    })
    .catch(function(err){
      console.log(err);
    })
  };


});