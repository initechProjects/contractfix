angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $window, $location, Auth){
  $scope.user = {};

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (storageItem) {
        $window.localStorage.setItem('contractFix_user', storageItem.userId);
        $window.localStorage.setItem('contractFix_token', storageItem.token);
        $location.path('/dashboard');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (storageItem) {
        $window.localStorage.setItem('contractFix_user', storageItem.userId);
        $window.localStorage.setItem('contractFix_token', storageItem.token);
        $location.path('/login');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
    
});


