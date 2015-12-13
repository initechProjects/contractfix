angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $rootScope, $window, $location, Auth){
  $scope.user = {};
  //to show error message on login page
  $scope.flag = false;

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (authResult) {

        $scope.authResult = authResult;

        //accessible anywhere
        $rootScope.authResult = authResult;

        if(authResult.token === undefined){
          $scope.flag = true;
          $location.path('/login');
        } else {
          $location.path('/dashboard');
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (authResult) {
        console.log(authResult, "inside signup in Auth.JS");
        $rootScope.authResult = authResult;
        $location.path('/login');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
    
});


