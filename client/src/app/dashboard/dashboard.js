angular.module('app.dashboard', [])


.controller('DashboardController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {

  $scope.user = $rootScope.fullname || localStorage.getItem('fullname');
  var token = $rootScope.token || localStorage.getItem('token');
  $scope.contracts = [];
  $scope.drafts = [];

  $scope.showingDrafts = $location.hash() === 'drafts';
  console.log($scope.showingDrafts);

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
   
    var data = res.data;
    $scope.personal = [];
    $scope.shared = [];
    $scope.ready = [];
    $scope.signed = [];

    for(var i = 0; i < data.length; i++){
      if(data[i].status === "open" && data[i].drafts){
        $scope.personal.push(data[i]);
      }
      if(data[i].status === "open"){
        $scope.shared.push(data[i]);
      }
      if(data[i].status === "ready"){
        $scope.ready.push(data[i]);
      }
      if(data[i].status === "closed"){
        $scope.signed.push(data[i]);
      }
    }

    console.log('data', res.data);
    
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(id, draft) {
    $location.path('/editor').search('id', id);
    $location.hash('');
    console.log(draft);
    if (draft)
      $location.search('draft', true);
  };

  $scope.handleSignature = function(id) {
    $location.path('/signatures').search('id', id);
  };

  // $scope.showDrafts = function() {
  //   $scope.showingDrafts = true;
  //   $location.hash('drafts');
  // };

  // $scope.showContracts = function() {
  //   $scope.showingDrafts = false;
  //   $location.hash('');
  // };

  $scope.newContract = function() {
    $location.path('/editor');
  };
});



