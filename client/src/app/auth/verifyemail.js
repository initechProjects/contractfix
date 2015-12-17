angular.module('app.verifyemail', [])


.controller('verifyEmailController', function ($scope, $rootScope, $window, $location, Dashboard) {
	console.log("I am inside verifyEmail", $rootScope.token);

   //Todo: fix logic for verifyEmail
    $scope.verifyEmail = function(){
      Auth.verifyEmail($scope.user)
      .then(function (authResult) {
        console.log("I am inside verifyEmail", authResult);
      })
      .catch(function(error){
        console.log(error);
      })
    }
    
});