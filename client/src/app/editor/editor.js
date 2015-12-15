angular.module('app.editor', [])
.controller('EditorController', function ($scope) {

  // Lines 5 - 17 replace the textarea in editor.html
  // with the ckEditor proper using the editor API.

  var editor = CKEDITOR.replace('contractEditor', {
  enterMode: CKEDITOR.ENTER_BR,
  allowedContent: 'br strong ins del em s ul ol li',
  });

  var showingChanges = false;




  // Lines 17 onward describe UI methods.

  $scope.ckEditor.showChanges = function(event) {
    showingChanges = !showingChanges;
    if (showingChanges) {
      doc.update(editor.getData());
      editor.setData(doc.html());
      editor.setReadOnly(true);
      this.textContent = 'Edit';
    } else {
      editor.setData(doc.view);
      editor.setReadOnly(false);
      this.textContent = 'Show Changes';
    }
    event.preventDefault();
  }

  $scope.ckEditor.acceptChanges = function(event) {
    if (showingChanges) {
      doc.acceptAll();
      editor.setData(doc.html());
    }
    event.preventDefault();
  }

  $scope.ckEditor.rejectChanges = function(event) {
    if (showingChanges) {
      doc.rejectAll();
      editor.setData(doc.html());
    }
    event.preventDefault();
  }
});