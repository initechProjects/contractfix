angular.module('app.templates', [])

.controller('TemplatesController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {
  var token = $rootScope.token || localStorage.getItem('token');
  $scope.user = $rootScope.fullname || localStorage.getItem('fullname');
  $scope.templates = [];
  $scope.currentTemplate = '';

  $http({
    method: 'POST',
    url: '/template/__',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    data: {
      group: 'event contracts'
    }
  }).then(function(res) {
    $scope.templates = res.data;
  });

  $scope.showTemplates = function(group) {
    $scope.templates = [];

    $http({
      method: 'POST',
      url: '/template/__',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        group: group
      }
    }).then(function(res) {
      $scope.templates = res.data;
    });
  };

  $scope.handleClick = function(templateId) {
    if ($location.path() === '/templates') {
      $http({
        method: 'POST',
        url: '/template/get',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        data: {
          templateid: templateId
        }
      }).then(function success(res) {
         $('#templatetext').html(res.data.text);
         $scope.currentTemplate = templateId;
      });
    } else {
      $location.path('/editor').search('tempId', templateId);
    }
  };


  $scope.takeSnapshot = function() {
    html2canvas($('#templatetext'), { letterRendering: true, width: 630, height: 891,
      onrendered: function(canvas) {
        var img = canvas.toDataURL('base64');
        $http({
          method: 'POST',
          url: '/template/save',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          data: {
            templateid: $scope.currentTemplate,
            snapshot: img
          }
        })
      }
    });

  };

});
