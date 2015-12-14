var dmp = new diff_match_patch();

var DocumentModel = function(initial) {
  if (typeof initial === 'string') {
    this.original = initial;
    this.view = this.original;
    this.diffs = [[0, initial]];
  } else {
    this.diffs = initial;
    this.view = this.content();
    this.original = this.content();
  }
};

DocumentModel.prototype.html = function() {
  var text = '';
  for (var i = 0; i < this.diffs.length; i++) {
    var type = this.diffs[i][0];
    var content = this.diffs[i][1];
    if (type === 1) 
      text += '<ins>' + content + '</ins>';
    if (type === -1)
      text += '<del>' + content + '</del>';
    if (type === 0) 
      text += content;
  }
  return text;
};

DocumentModel.prototype.content = function() {
  var text = '';
  for (var i = 0; i < this.diffs.length; i++) {
    var type = this.diffs[i][0];
    var content = this.diffs[i][1];
    if (type === 1 || type === 0)
      text += content;
  }
  return text;
};

DocumentModel.prototype.update = function(content) {
  var diffs = dmp.diff_main(this.original, content, false);
  dmp.diff_cleanupSemantic(diffs);
  this.diffs = diffs;
  this.view = content;
};

DocumentModel.prototype.accept = function(i) {
  if (this.diffs[i][0] === 1)
    this.diffs[i][0] = 0;
  if (this.diffs[i][0] === -1)
    this.diffs.splice(i, 1);
};

DocumentModel.prototype.reject = function(i) {
  if (this.diffs[i][0] === -1)
    this.diffs[i][0] = 0;
  if (this.diffs[i][0] === 1)
    this.diffs.splice(i, 1);
};


DocumentModel.prototype.acceptAll = function() {
  for (var i = 0; i < this.diffs.length; i++) {
    this.accept(i);
  }
  this.updateOriginal();
};

DocumentModel.prototype.rejectAll = function() {
  for (var i = 0; i < this.diffs.length; i++) {
    this.reject(i);
  }
  this.patchView();
};

DocumentModel.prototype.each = function(callback) {
  var diffStart = 0;
  var diffEnd = this.content().length;
  for (var i = this.diffs.length - 1; i >= 0; i--) {
    var content = this.diffs[i][1];
    diffStart = diffEnd - content.length;
    callback.call(this, this.diffs[i], i, diffStart, diffEnd);
    diffEnd -= content.length;
  }
  this.updateOriginal();
};

DocumentModel.prototype.updateOriginal = function() {
  this.original = this.content();
};

DocumentModel.prototype.patchView = function() {
  this.view = dmp.patch_apply(dmp.patch_make(this.diffs), this.original)[0];
};

function removeTags(html) {
  return html.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, '');
}

function getOffsetWithinHtml(html, caret) {
  var lengthCounter = 0;
  var once = false;

  while (match = html.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/)) {
    html = html.slice(0, match.index) + html.slice(match.index + match[0].length);

    lengthCounter += match[0].length;

    if (match.index > caret && !once) {
      once = true;
      return lengthCounter - match[0].length + caret;
    }
  }

  return caret;

}

function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

function generateHtmlFromModel(model) {
  var text = '';
  for (var i = 0; i < model.length; i++) {
    var type = model[i][0];
    var content = model[i][1];
    if (type === DIFF_INSERT) text += '<ins>' + content + '</ins>';
    if (type === DIFF_DELETE) text += '<del>' + content + '</del>';
    if (type === DIFF_EQUAL) text += content;
  }
  return text;
}

function getSelectionHtml() {
  var html = "";
  if (typeof window.getSelection != "undefined") {
    var sel = window.getSelection();
    if (sel.rangeCount) {
      var container = document.createElement("div");
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents());
      }
      html = container.innerHTML;
    }
  } else if (typeof document.selection != "undefined") {
    if (document.selection.type == "Text") {
      html = document.selection.createRange().htmlText;
    }
  }
  return html;
}

function getTextNodesIn(node) {
  var textNodes = [];
  if (node.nodeType == 3) {
    textNodes.push(node);
  } else {
    var children = node.childNodes;
    for (var i = 0, len = children.length; i < len; ++i) {
      textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
    }
  }
  return textNodes;
}

function setSelectionRange(el, start, end) {
  if (document.createRange && window.getSelection) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var textNodes = getTextNodesIn(el);
    var foundStart = false;
    var charCount = 0, endCharCount;

    for (var i = 0, textNode; textNode = textNodes[i++]; ) {
      endCharCount = charCount + textNode.length;
      if (!foundStart && start >= charCount
            && (start < endCharCount ||
            (start == endCharCount && i <= textNodes.length))) {
        range.setStart(textNode, start - charCount);
        foundStart = true;
      }
      if (foundStart && end <= endCharCount) {
        range.setEnd(textNode, end - charCount);
        break;
      }
      charCount = endCharCount;
    }

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (document.selection && document.body.createTextRange) {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(true);
    textRange.moveEnd("character", end);
    textRange.moveStart("character", start);
    textRange.select();
  }
}

// --------------------------------------

var _htmlHash = {};
var _currentHash = 44032;
var _is_debug = false;

function pushHash(tag) {
  if (typeof(_htmlHash[tag]) == 'undefined') {
    _htmlHash[tag] = eval('"\\u'+_currentHash.toString(16)+'"');
    _currentHash++;
  }
  return _htmlHash[tag];
}

function clearHash() {
  _htmlHash = {};
  _currentHash = 44032; //朝鲜文音节 Hangul Syllables
}

function html2plain(html) {
  html = html.replace(/<(S*?)[^>]*>.*?|<.*?\/>/g, function(tag){
    //debug:
    if (_is_debug) {
      return pushHash(tag.toUpperCase().replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    } else {
      return pushHash(tag.toUpperCase());
    }
  });
  
  return html;
}

function plain2html(plain) {
  for(var tag in _htmlHash){
    plain = plain.replace(RegExp(_htmlHash[tag], 'g'), tag);
  }
  return plain;
}

// -------------------------------------

function htmlToPlain(html) {
  html = html.replace(/<br \/>/g, 'BRBR');
  html = html.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, '');
  html = html.replace(/(BRBR)/g, '<br />');
  return html;
}