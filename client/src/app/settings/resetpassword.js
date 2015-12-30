angular.module('app.resetPassword', [])

.controller('resetPasswordController', function ($scope, $rootScope, $window, $location, $http, Auth, $timeout) {

	 var url = $location.url();
   var token = url.slice(url.indexOf("=")).slice(1);

  $scope.inputType = 'password';
  $scope.hideShowPassword = function(){
    if($scope.inputType === 'password'){
      $scope.inputType = 'text';
    } else {
      $scope.inputType = 'password';
    }
  };

   $scope.resetPassword = function(newPassword){

	   $http({
	    method: 'POST',
	    url: '/resetpassword',
	    headers: {
	      'Authorization': token,
	      'Content-Type': 'application/json'
	    },
	    data: {
	    	'password': newPassword
	    }
	    })
	   .success(function(data){
	   	$scope.flag = true;
	   	$scope.response = data;
	   	$scope.counter = 5;

	   	$scope.onTimeout = function(){
	    if($scope.counter > 0){
	      $scope.counter--;
	      mytimeout = $timeout($scope.onTimeout, 1000);
	     } else {
	      $scope.counter = 0;
	     }
	    }
	    var mytimeout = $timeout($scope.onTimeout, 1000);
	    $timeout(function(){ $location.path("/login")}, 5000);

	   })
	   .catch(function(err){

	    console.log(err);
	   })
   };

    
});