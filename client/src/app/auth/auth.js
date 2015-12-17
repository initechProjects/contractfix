angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $rootScope, $window, $location, Auth){
  $scope.user = {};
  //to show error message on login page
  $scope.flag = false;

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (authResult) {
        $rootScope.authResult = authResult;
        
        //console.log(authResult);
        if(authResult === undefined){
          $scope.flag = true;
          $scope.authResult = "invalid username or password";
        } else if(authResult.token === undefined){
          $scope.flag = true;
          $location.path('/login');
        } else {
          $location.path('/dashboard');
          $rootScope.token = authResult.token;
          $rootScope.expires = Date.now() + 600000; // now + 10 minutes
          $rootScope.username = authResult.username;
          localStorage.setItem('token', authResult.token);
          localStorage.setItem('expires', Date.now() + 600000);
          localStorage.setItem('username', authResult.username);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (authResult) {
        console.log("I am inside signup", authResult);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.inputType = 'password';
  $scope.hideShowPassword = function(){
    if($scope.inputType === 'password'){
      $scope.inputType = 'text';
    } else {
      $scope.inputType = 'password';
    }
  };

  $scope.resendEmail = function(){
    Auth.resendEmail($scope.user)
    .then(function (authResult) {
      //console.log(authResult);
      $scope.authResult = authResult;
      $scope.flag=true;
      //Todo: erase the flag message for the next user
    })
    .catch(function(error) {
      console.log(error);
    });
    }
    

  

    
});


