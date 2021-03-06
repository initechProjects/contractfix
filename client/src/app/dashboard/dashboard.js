angular.module('app.dashboard', [])


.controller('DashboardController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {

  var token = $rootScope.token || localStorage.getItem('token');
  $scope.user = $rootScope.fullname || localStorage.getItem('fullname');
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
    var data = res.data;
    $scope.personal = [];
    $scope.shared = [];
    $scope.ready = [];
    $scope.signed = [];

    for (var i = 0; i < data.length; i++) {
      if (data[i].status === "open"){
        if (data[i].drafts) 
          $scope.personal.push(data[i]);

        if (data[i].versions)
          $scope.shared.push(data[i]);
      }

      if (data[i].status === "ready")
        $scope.ready.push(data[i]);

      if (data[i].status === "closed")
        $scope.signed.push(data[i]);
    }
    
  }, function(res) {
    console.log(res);
  });

  $scope.handleClick = function(id, draft) {
    $location.path('/editor').search('id', id);
    $location.hash('');

    if (draft)
      $location.search('draft', true);

    $('#templateModal').modal('hide');
  };

  $scope.handleSignature = function(id) {
    $location.path('/signatures').search('id', id);
  };

  $scope.newContract = function() {
    $location.path('/editor');
  };
});



