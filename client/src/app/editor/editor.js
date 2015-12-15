angular.module('app.editor', [])
.controller('EditorController', function ($scope, DocumentFactory) {


  // Lines 5 - 17 replace the textarea in editor.html
  // with the ckEditor proper using the editor API.

  var editor = CKEDITOR.replace('contractEditor', {
    enterMode: CKEDITOR.ENTER_BR,
    allowedContent: 'br strong ins del em s ul ol li',
    extraPlugins: 'menu,contextmenu'
  });

  $scope.ckEditor = {};
  $scope.buttonText = 'Show Changes';
  $scope.comments = [];

  var showingChanges = false;
  var original = '<strong>House Rental Contract</strong><br />This contract is an agreement between&nbsp;<strong>{Renter}</strong>, who will be renting a house from&nbsp;<strong>{Owner}</strong>, who owns the house being rented. This arrangement will begin on&nbsp;<strong>{date}</strong>&nbsp;and will end on&nbsp;<strong>{date}</strong>.<br />The rent for this house will be&nbsp;<strong>{rent}</strong>. This amount must be paid on&nbsp;<strong>{date}</strong>&nbsp;every month. Late payments will incur a fee of&nbsp;<strong>{fee}</strong>. A deposit in the amount of&nbsp;<strong>{deposit}</strong>&nbsp;will be held for the duration of the lease and will be returned to the renter within one month after the keys are surrendered.<br />The major rules regarding this house are as follows:&nbsp;<strong>{house rental rules, concerning pets, smoking, and other major violations}</strong>. By signing this agreement, the renter acknowledges that a complete list of these rules has been provided to him or her, and that the renter has read and understood these rules.<br />The owner has a right to enter the house with an advanced notice of 24 hours for any reason. In an emergency, owner may violate this right and enter immediately. Emergencies include those instances in which the property is in immediate danger, such as from a fire or flood.<br />The renter will make his or her best effort to keep the house in good condition. No major alterations will be made to the house without prior discussion with the owner. This includes painting, changes to the lawns, and installation of any permanent changes. All maintenance for the house will be taken care of by the owner, and the tenant must notify the owner immediately of maintenance required.<br />Utilities will be the responsibility of the tenant. The renter will set up and shut down all utilities. This includes water, electric, and gas. Trash services is provided by&nbsp;<strong>{trash}</strong>&nbsp;and will be paid by the tenant.<br />Signing this agreement implies full understanding of the above conditions and the rental agreement. This agreement cannot be altered without full informed consent in writing provided by both parties. In certain cases of violation, the tenant may be required to vacate without appeal.';

  var doc = DocumentFactory;
  doc.create(original);
  editor.setData(doc.original());


  // Lines 17 onward describe UI methods.
  $scope.ckEditor.sign = function (){

  };

  $scope.ckEditor.showChanges = function() {
    showingChanges = !showingChanges;
    if (showingChanges) {
      doc.update(editor.getData());
      editor.setData(doc.html());
      editor.setReadOnly(true);
      $scope.buttonText = 'Edit';
    } else {
      editor.setData(doc.view());
      editor.setReadOnly(false);
      $scope.buttonText = 'Show Changes';
    }
  };

  $scope.ckEditor.acceptChanges = function() {
    if (showingChanges) {
      doc.acceptAll();
      editor.setData(doc.html());
    }
  };

  $scope.ckEditor.rejectChanges = function() {
    if (showingChanges) {
      doc.rejectAll();
      editor.setData(doc.html());
    }
  };

  $scope.ckEditor.addComment = function() {
    if ($scope.comment) {
      $scope.comments.push({
        comment: $scope.comment,
        selection: editor.getSelectedHtml(true)
      });
      $scope.comment = '';
    }
  };

  $scope.ckEditor.deleteComment = function(comment) {
    $scope.comments.splice($scope.comments.indexOf(comment), 1);
  };
})

.factory('DocumentFactory', function() {
  var DIFF_INSERT = 1;
  var DIFF_DELETE = -1;
  var DIFF_EQUAL = 0;

  var dmp = new diff_match_patch();
  var _original;
  var _view;
  var _diffs = [];
  var _comments = [];

  /**
   * Accept a change based on the index of the diff.
   * @param {number} i - the index of the diff to be accepted.
   * @private
   */
  var accept = function(i) {
    if (_diffs[i][0] === DIFF_INSERT)
      _diffs[i][0] = DIFF_EQUAL;
    if (_diffs[i][0] === DIFF_DELETE)
      _diffs.splice(i, 1);
  };

  /**
   * Reject a change based on the index of the diff.
   * @param {number} i - the index of the diff to be accepted.
   * @private
   */
  var reject = function(i) {
    if (_diffs[i][0] === DIFF_DELETE)
      _diffs[i][0] = DIFF_EQUAL;
    if (_diffs[i][0] === DIFF_INSERT)
      _diffs.splice(i, 1);
  };

  /**
   * Converts the diffs into HTML without mark-up.
   * @return {string} text - the document
   * @private
   */
  var plainHtml = function() {
    var text = '';
    for (var i = 0; i < _diffs.length; i++) {
      var op = _diffs[i][0];
      var content = _diffs[i][1];
      if (op !== DIFF_DELETE)
        text += content;
    }
    return text;
  };

  /**
   * Create patches based on the diffs and apply patches to the original to update the view.
   * @private
   */
  var patchView = function() {
    _view = dmp.patch_apply(dmp.patch_make(_diffs), _original)[0];
  };

  return {
    /**
     * Getter-setter for original text.
     * @param {string} [newOriginal]
     * @return {string} _original - original text
     */
    original: function(newOriginal) {
      if (newOriginal)
        _original = newOriginal;
      return _original;
    },

    /**
     * Getter-setter for view text.
     * @param {string} [newView]
     * @return {string} _view - last known contents of editor
     */
    view: function(newView) {
      if (newView)
        _view = newView;
      return _view;
    },

    /**
     * Getter-setter for diffs.
     * @param {string} [newDiffs]
     * @return {string} _diffs.
     */
    diffs: function(newDiffs) {
      if (newDiffs)
        _diffs = newDiffs;
      return _diffs;
    },

    /**
     * Getter-setter for diffs.
     * @param {string} [newComments]
     * @return {array} _comments - array of comments associated with document version
     */
    comments: function(newComments) {
      if (newComments)
        _comments = newComments;
      return _comments;
    },

    addComment: function(data) {
      // TODO: add user info?
      _comments.push({ comment: data.comment, selection: data.selection || null, createdAt: Date.now() });
    },

    /**
     * Create a new document.
     * @param {string|array} initial - string or diffs used to create a document.
     */
    create: function(initial) {
      if (typeof initial === 'string') {
        _original = initial;
        _view = initial;
        _diffs = [[0, initial]];
      }

      if (Array.isArray(initial)) {
        _diffs = initial;
        _original = plainHtml();
        _view = _original;
      }
    },

    /**
     * Converts the diffs into HTML which shows insertions and deletions.
     * @return {string} text - the document with mark-up
     */
    html: function() {
      var text = '';
      for (var i = 0; i < _diffs.length; i++) {
        var op = _diffs[i][0];
        var content = _diffs[i][1];
        if (op === DIFF_INSERT) 
          text += '<ins>' + content + '</ins>';
        if (op === DIFF_DELETE)
          text += '<del>' + content + '</del>';
        if (op === DIFF_EQUAL) 
          text += content;
      }
      return text;
    },

    /**
     * Updates the 'diffs' array and stores the editor content in 'view'.
     * @param {string} content - editor content that will be compared to the original document
     */
    update: function(content) {
      var diffs = dmp.diff_main(_original, content, false);
      dmp.diff_cleanupSemantic(diffs);
      _view = content;
      _diffs = diffs;
    },

    /**
     * Accepts all the changes made and updates original.
     */
    acceptAll: function() {
      for (var i = 0; i < _diffs.length; i++) {
        accept(i);
      }
      _original = plainHtml();
    },

    /**
     * Accepts all the changes made and updates the view.
     */
    rejectAll: function() {
      for (var i = 0; i < _diffs.length; i++) {
        reject(i);
      }
      patchView();
    }
  };
});