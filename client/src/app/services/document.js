app.factory('DocumentFactory', function() {
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