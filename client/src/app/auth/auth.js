angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $window, $location, Auth){
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (profile, token) {
        $window.localStorage.setItem('profile', token);
        $window.localStorage.setItem('token', token);
        $location.path('/dashboard');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (profile, token) {
        $window.localStorage.setItem('profile', profile);
        $window.localStorage.setItem('token', token);
        $location.path('/login');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
    
});


