angular.module('app.dashboard', [])


.controller('DashboardController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {

  $scope.user = $rootScope.authResult.fullname;
  var token = $rootScope.token || localStorage.getItem('token');
  $scope.contracts = [];
  $scope.drafts = [];

  $http({
    method: 'POST',
    url: '/findmycontracts',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }).then(function(res) {
    $scope.contracts = res.data;
    $scope.drafts = res.data.filter(function(contract) { return contract.drafts; });
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(contract, draft) {
    $location.path('/editor').search('id', contract);
    if (draft)
      $location.search('draft', true);
  };
});