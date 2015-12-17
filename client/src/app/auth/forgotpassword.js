angular.module('app.forgotPassword', [])


.controller('forgotPasswordController', function ($scope, $rootScope, $window, $location, Auth) {

	  $scope.forgotPassword = function(){
      Auth.forgotPassword($scope.user)
      .then(function(authResult) {
        console.log("I am authResult", authResult);
        $scope.flag = true;
        $scope.authResult = authResult;
      })
      .catch(function(error){
        $scope.flag = true;
        $scope.authResult = error.data.message;
      })
    }

    
});