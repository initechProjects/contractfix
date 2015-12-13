angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $rootScope, $window, $location, Auth){
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (profile) {
        //accessible anywhere
        $rootScope.profile = profile;
        $location.path('/dashboard');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (profile) {
        console.log(profile, "inside signup in AuthJS");
        $rootScope.profile = profile;
        $location.path('/login');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
    
});


