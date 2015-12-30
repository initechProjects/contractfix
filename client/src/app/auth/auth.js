angular.module('app.auth', [])
.controller('AuthController', function($scope, $rootScope, $window, $location, Auth, $http){

  $scope.user = {};
  $scope.flag = false;
  var token;
  var contractid = $rootScope.contractid;

  $scope.login = function () {
    Auth.login($scope.user)
      .then(function (authResult) {
        $rootScope.authResult = authResult;
        token = authResult.token;

        if(contractid){
          $http({
            method: 'POST',
            url: '/opencontract',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            data: {
              'contractId': contractid
            }
          })
          .success(function(data){
            $location.path('/editor').search({ 'id': data.contractid });
          })
          .catch(function(err){
            console.log(err);
          });
        }
        if(authResult.token){
          if(authResult.fullname === undefined){
            $location.path('/signup2');
          } else {
            Auth.save(authResult);
            $location.path('/dashboard');
          }
        } else if(authResult.token === undefined){
          $scope.flag = true;
          $scope.authResult = authResult.data.message;
          $location.path('/login');
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (authResult) {
        if(typeof authResult === "string"){
          $scope.flag=true;
          $scope.message = authResult;
        } else {
        $scope.message = authResult.data.message;
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
    $location.path("/login");
  };


});


