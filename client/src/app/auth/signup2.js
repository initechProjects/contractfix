angular.module('app.signup2', [])

.controller('signup2Controller', function ($scope, $rootScope, $window, $location, $http, $timeout) {
   var url = $location.url();
   var token = url.slice(url.indexOf("=")).slice(1) || $rootScope.token || localStorage.getItem('token');
   console.log(token);
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
      $scope.flag = true;
      $scope.response = "Your name is updated!";
      $timeout(function(){ $location.path("/dashboard")}, 3000);
    })
    .catch(function(err){
      console.log(err);
    })
  };


});