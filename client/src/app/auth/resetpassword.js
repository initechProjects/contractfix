angular.module('app.resetPassword', [])


.controller('resetPasswordController', function ($scope, $rootScope, $window, $location, $http, Auth) {
	console.log("I am inside resetpasswordCtrl");

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
   	 console.log(newPassword);
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
	    console.log(data);

	   })
	   .catch(function(err){
	    console.log(err);
	   })
   };


    
});