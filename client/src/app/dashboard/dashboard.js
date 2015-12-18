angular.module('app.dashboard', [])


.controller('DashboardController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {
  var token = $rootScope.token || localStorage.getItem('token');
  $scope.contracts = [];

  $http({
    method: 'POST',
    url: '/findmycontracts',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }).then(function(res) {
    $scope.contracts = res.data;
    console.log(res);
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(contract) {
    $location.path('/editor').search('id', contract);
  };
});