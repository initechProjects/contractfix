angular.module('app.templates', [])


.controller('TemplatesController', function ($scope, $rootScope, $window, $location, Dashboard, $http) {

  $scope.user = $rootScope.authResult.fullname;
  var token = $rootScope.token || localStorage.getItem('token');
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
    // console.log(res.data);
    $scope.templates = res.data;
  }, function(res) {
    console.log(res);
  });

  $scope.showTemplates = function(group) {
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
      // console.log(res.data);
      $scope.templates = res.data;
      jQuery('#templatetext').html('');
      console.log($scope.templates);
    }, function(res) {
      console.log(res);
    });
  };

  $scope.handleClick = function(id) {
    var l = $scope.templates.length;

    for (var i = 0; i<l; i++) {
      if ($scope.templates[i].templateid === id) {
        $scope.currentTemplate = id;
        jQuery('#templatetext').html($scope.templates[i].text);
        break;
      }
    }
  };

  $scope.takeSnapshot = function() {
    html2canvas($('#templatetext'), { letterRendering: true, width: 630, height: 891,
      onrendered: function(canvas) {
        var img = canvas.toDataURL('base64');
        // console.log(img);

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
        }).then(function(res) {
          console.log('saved:', img);
          // alert('saved');
        }, function(res) {
          console.log(res);
        });

        // console.log(img);
        // window.open(img);
      }
    });

  };

});
