angular.module('app.editor', [])
.controller('EditorController', function ($scope) {


  // Lines 5 - 17 replace the textarea in editor.html
  // with the ckEditor proper using the editor API.


  CKEDITOR.disableAutoInline = true;
  var editor = CKEDITOR.inline('contractEditor');

  $scope.ckEditor = {};
  $scope.buttonText = 'Show Changes';
  $scope.comments = [];

  var showingChanges = false;
  var original = 'This contract is an agreement between&nbsp;<strong>{Renter}</strong>, who will be renting a house from&nbsp;<strong>{Owner}</strong>, who owns the house being rented. This arrangement will begin on&nbsp;<strong>{date}</strong>&nbsp;and will end on&nbsp;<strong>{date}</strong>.<br />The rent for this house will be&nbsp;<strong>{rent}</strong>. This amount must be paid on&nbsp;<strong>{date}</strong>&nbsp;every month. Late payments will incur a fee of&nbsp;<strong>{fee}</strong>. A deposit in the amount of&nbsp;<strong>{deposit}</strong>&nbsp;will be held for the duration of the lease and will be returned to the renter within one month after the keys are surrendered.<br />The major rules regarding this house are as follows:&nbsp;<strong>{house rental rules, concerning pets, smoking, and other major violations}</strong>. By signing this agreement, the renter acknowledges that a complete list of these rules has been provided to him or her, and that the renter has read and understood these rules.<br />The owner has a right to enter the house with an advanced notice of 24 hours for any reason. In an emergency, owner may violate this right and enter immediately. Emergencies include those instances in which the property is in immediate danger, such as from a fire or flood.<br />The renter will make his or her best effort to keep the house in good condition. No major alterations will be made to the house without prior discussion with the owner. This includes painting, changes to the lawns, and installation of any permanent changes. All maintenance for the house will be taken care of by the owner, and the tenant must notify the owner immediately of maintenance required.<br />Utilities will be the responsibility of the tenant. The renter will set up and shut down all utilities. This includes water, electric, and gas. Trash services is provided by&nbsp;<strong>{trash}</strong>&nbsp;and will be paid by the tenant.<br />Signing this agreement implies full understanding of the above conditions and the rental agreement. This agreement cannot be altered without full informed consent in writing provided by both parties. In certain cases of violation, the tenant may be required to vacate without appeal.';

  // Lines 17 onward describe UI methods.
  $scope.ckEditor.sign = function (){

  };

  $scope.ckEditor.showChanges = function() {
    $scope.lite.toggleShow();
  };

  $scope.ckEditor.acceptChanges = function() {
    editor.execCommand('lite-acceptone');
  };

  $scope.ckEditor.rejectChanges = function() {
  };

  $scope.ckEditor.addComment = function() {
    if ($scope.comment) {
      var html = editor.getSelectedHtml(true).replace(/&nbsp;/g, '');
      html = html.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, '');
      $scope.comments.push({ comment: $scope.comment, selection: html });
      $scope.comment = '';
    }
  };

  $scope.ckEditor.deleteComment = function(comment) {
    $scope.comments.splice($scope.comments.indexOf(comment), 1);
  };

  $scope.ckEditor.handleClick = function(event) {
    localStorage.setItem('data', editor.getSnapshot());
  };

  editor.on('instanceReady', function() {

    editor.addCommand('Comment', {
      exec: function() {
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

    var text = localStorage.getItem('data');
    editor.loadSnapshot(localStorage.getItem('data') || original);
  });

  editor.on('lite:init', function() {
    $scope.lite = editor.plugins.lite.findPlugin(editor);
  });
  
});