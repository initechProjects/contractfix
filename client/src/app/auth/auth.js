angular.module('app.auth', [])

//todo: username if it is an email address or not
.controller('AuthController', function($scope, $rootScope, $window, $location, Auth, $http){
  $scope.user = {};
  var token;
  $scope.flag = false;

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (authResult) {
        $rootScope.authResult = authResult;
        
        console.log(authResult);
        token = authResult.token;
        console.log("I am token", token);
       
        if(authResult.fullname === undefined){
          $location.path('/signup2');
        } else if(authResult.token === undefined){
          $scope.flag = true;
          $scope.authResult = authResult.data.message;
          $location.path('/login');
        } else {
          Auth.save(authResult);
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
        console.log(authResult, typeof authResult);
        if(typeof authResult === "string"){
          $scope.flag=true;
          $scope.message = authResult;
        } else {
        $scope.message = authResult.data.message;
        console.log(authResult.data.message);  
        }
        
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
      $scope.authResult = authResult;
      $scope.flag2=true;
    })
    .catch(function(error) {
      console.log(error);
    });
    }

  $scope.redirect = function(){
    //Why does the screen turn gray here?
    $location.path("/login");
  };

 
});


