angular.module('app.dashboard', [])


.controller('DashboardController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {

  $scope.user = $rootScope.fullname || localStorage.getItem('fullname');
  var token = $rootScope.token || localStorage.getItem('token');
  $scope.contracts = [];
  $scope.drafts = [];
  $scope.showingDrafts = $location.hash() === 'drafts';

  $http({
    method: 'POST',
    url: '/findmycontracts',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }).then(function(res) {
    $scope.contracts = res.data.filter(function(contract) { return contract.versions; });
    $scope.drafts = res.data.filter(function(contract) { return contract.drafts; });
    console.log(res.data);
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(id, draft) {
    $location.path('/editor').search('id', id);
    $location.hash('');
    if (draft)
      $location.search('draft', true);
  };

  $scope.showDrafts = function() {
    $scope.showingDrafts = true;
    $location.hash('drafts');
  };

  $scope.showContracts = function() {
    $scope.showingDrafts = false;
    $location.hash('');
  };
});