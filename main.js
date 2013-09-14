global.$ = $;

var abar = require('address_bar');
var controls = require('controls');
var folder_view = require('folder_view');
var path = require('path');
var gui = require('nw.gui')
var fs = require('fs');
var shell = gui.Shell;


function getRuleBySelector(sheet, selector) {
  var rules = sheet.cssRules, rule;
  for(var i=0; i < rules.length; i++) {
    rule = rules[i];
    if (rule.selectorText === selector) {
      return rule;
    }
  }
  return false;
}

function getCSSRule(rule) {
  var SS = document.styleSheets, sheet, match;
  for(var i=0; i < SS.length; i++) {
    sheet = SS[i];
    match = getRuleBySelector(sheet, rule);
    if (match !== false) {
      return match;
    }
  }
  return false;
}

// From: http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
var debounce = function (func, threshold, execAsap) {
    var timeout;
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null; 
        };
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
        timeout = setTimeout(delayed, threshold || 100); 
    };
}

$(document).ready(function() {
  var app = gui.App;
  var settings = {app: app, thumbSize: 96};

  var dataPath = app.dataPath + ""; //cast to string
  var thumbDir = path.join(dataPath, "/thumbs/");
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir);
  }
  var startDir = process.cwd();
  if (app.argv.length) {
    startDir = app.argv[0];
  }

  var folder = new folder_view.Folder(settings, $('#files'));
  var reThumb = debounce(function() {folder.updateThumbnails();}, 500);
  var addressbar = new abar.AddressBar($('#addressbar'));

  var thumbSize = new controls.ThumbSize(gui.App, $('#thumb-size-input'));

  thumbSize.on('update', function(thumbSize) {
    console.log("New thumbnail size: ", thumbSize);
    settings.thumbSize = thumbSize;
    var cssRule = getCSSRule('.file');
    if (cssRule) {
      cssRule.style.width = thumbSize + 'px';
      reThumb();
    }
  });

  folder.open(startDir);
  addressbar.set(startDir);

  folder.on('navigate', function(dir, mime) {
    if (mime.type == 'folder') {
      addressbar.enter(mime);
    } else {
      shell.openItem(mime.path);
    }
  });

  addressbar.on('navigate', function(dir) {
    folder.open(dir);
  });


  $('.filesystem-links').on('click', 'li > a', function(e) {
    var dir = path.normalize(this.getAttribute('data-path'));
    if (dir === '~') {
      dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
    $(this).closest('ul').find('li').removeClass('active');
    $(this).closest('li').addClass('active');
    addressbar.set(dir);
    folder.open(dir);
    e.preventDefault();
    e.stopPropagation();
    return false;
  });
});
