angular.module('app.editor', [])
.controller('EditorController', function ($scope, $rootScope, $http, $location) {


  // Lines 5 - 17 replace the textarea in editor.html
  // with the ckEditor proper using the editor API.

  var contractId = $location.search().id;
  var templateId = $location.search().tempId;
  var isDraft = $location.search().draft;
  var user = $rootScope.username || localStorage.getItem('username');
  var token = $rootScope.token || localStorage.getItem('token');
  var original = '';
  var showingChanges = false;
  var editor = CKEDITOR.replace('contractEditor');
  var headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  $scope.ckEditor = {};
  $scope.selection = '';
  $scope.comments = $scope.comments || [];
  $scope.contractUsers = [];

  if (contractId) {
    $http({
      method: 'POST',
      url: '/opencontract',
      headers: headers,
      data: {
        contractId: contractId
      }
    }).then(function success(res) {
      original = isDraft ? res.data.personal.text : res.data.latest.text;
      $scope.title = res.data.metadata.title || 'Untitled';
      $scope.comments = res.data.comments || [];

      editor.setData(original);
    }, function error(res) {
      console.log(res);
    });
  } else if (templateId) {
    $http({
      method: 'POST',
      url: '/template/get',
      headers: headers,
      data: {
        templateid: templateId
      }
    }).then(function success(res) {
      $scope.title = res.data.name;
      original = res.data.text;
      editor.setData(original);
      $scope.lite.toggleTracking(!!original);
    }, function error(res) {
      console.log(res);
    });
  }

  editor.on('instanceReady', function() {
    editor.addCommand('Comment', {
      exec: function() {
        var selection = editor.getSelectedHtml(true);
        if (selection) {
          $scope.$apply(function() {
            var html = selection.replace(/&nbsp;/g, '');
            html = html.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, '');
            $scope.selection = html;
          });
        }
        $scope.$apply($scope.ckEditor.addComment);
      }
    });

    editor.addMenuGroup('Comment', 3);

    editor.addMenuItems({
        Comment: {
          label: 'Comment',
          group: 'Comment',
          order: 3,
          command: 'Comment'
        }
    });

    editor.contextMenu.addListener(function(element, selection) {
      return {
        Comment: CKEDITOR.TRISTATE_OFF
      };
    });

    editor.setData(original);
  });

  editor.on('lite:init', function() {
    $scope.lite = editor.plugins.lite.findPlugin(editor);
    $scope.lite.setUserInfo({ name: user, id: user });
    $scope.lite.toggleTracking(!!original);
  });

  $scope.ckEditor.saveFile = function() {
    var pdf = new jsPDF();
    var source = editor.getData();
    pdf.fromHTML(source, 15, 15, { width: 180 });
    pdf.output('dataurlnewwindow');
  };

  $scope.ckEditor.inviteEmail = function (collabEmail){
    $http({
      method: 'POST',
      url: '/invite',
      headers: headers,
      data: {
        'contractId' : contractId,
        'collaborators': [collabEmail]
      }
    })
    .success(function(data){
    })
    .catch(function(err){
      console.log(err);
    });

  };

  $scope.ckEditor.addComment = function() {
    if ($scope.comment) {
      $scope.comments.push({ text: $scope.comment, selection: $scope.selection });
      $scope.comment = '';
      $scope.selection = '';
    }
  };

  $scope.ckEditor.deleteComment = function(comment) {
    $scope.comments.splice($scope.comments.indexOf(comment), 1);
  };

  $scope.ckEditor.save = function(personal) {
    var data = {
      text: editor.getData(),
      personal: personal,
      comments: $scope.comments,
      title: $scope.title
    };

    if (contractId)
      data.contractId = contractId;

    if (personal)
      data.tag = $scope.title;

    $http({
      method: 'POST',
      url: '/savecontract',
      headers: headers,
      data: data
    }).then(function success(res) {
      contractId = res.data.contractId;

      if (contractId)
        $location.search('id', contractId);

      if (personal)
        $location.search('draft', true);

    }, function error(res) {
      console.log(res);
    });
  };

  $scope.getDetails = function() {
    $http({
      method: 'POST',
      url: '/getusersdetails',
      headers: headers,
      data: {
        contractId: contractId
      }
    }).then(function success(res) {
      $scope.contractUsers = res.data.usersdetails;
    }, function error(res) {
      console.log(res);
    });
  };

  $scope.signatoryList = [{ user: '' }];

  $scope.addSignatory = function() {
    $scope.signatoryList.push({ user: '' });
  };

  $scope.saveSignatories = function() {
    var payload = {
      contractId: contractId,
      parties: []
    };

    $scope.signatoryList.forEach(function(signatory) {
      payload.parties.push({
        party: signatory.party,
        title: signatory.jobtitle,
        userid: signatory.user.userId,
        fullname: signatory.user.fullname,
        userName: signatory.user.userName
      });
    });

    $http({
      method: 'POST',
      url: '/prepareforsignature',
      headers: header,
      data: payload
    }).then(function(res) {
      $('#prepareSignature').modal('hide');
      $location.path('/signatures').search('id', contractId);
    }, function(res) {
      console.log(res);
    });

  };

});
