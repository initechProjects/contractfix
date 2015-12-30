angular.module('app.invitation', [])

.controller('invitationController', function ($scope, $rootScope, $window, $location, $http, $timeout) {
  var url = $location.url();
  var token = url.slice(url.indexOf("=")).slice(1);

    $http({
      method: 'POST',
      url: '/invitation',
      headers: {
        'Authorization': token,
        'Content-Type' : 'application/json'
      },
      data: {}
    })
    .success(function(data){
      $scope.response = data;
      $rootScope.contractid = data.contractid;
 
      if(data.newuser === true){
        $timeout(function(){ $location.path("/signup2")}, 3000);
      } else {
        $timeout(function(){ $location.path("/login")}, 3000);
      }
    })
    .catch(function(err){
      console.log(err);
    })

});