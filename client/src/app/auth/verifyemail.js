angular.module('app.verifyemail', [])


.controller('verifyEmailController', function ($scope, $rootScope, $window, $location, $http, $timeout) {

   var url = $location.url();
   console.log(url);
   var token = url.slice(url.indexOf("=")).slice(1);
   console.log(token);

   $http({
    method: 'POST',
    url: '/verifyemail',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    data: {}
    })
   .success(function(data){
    $scope.response = data;
    $timeout(function(){ $location.path("/login")}, 5000);

   })
   .catch(function(err){
    $scope.response = err.data.message;
    $timeout(function(){ $location.path("/login")}, 5000);
    console.log(err);
   })


});


