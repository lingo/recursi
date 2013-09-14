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

$(document).ready(function() {
  var app = gui.App;
  var dataPath = app.dataPath + ""; //cast to string
  var thumbDir = path.join(dataPath, "/thumbs/");
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir);
  }
  var startDir = process.cwd();
  if (app.argv.length) {
    startDir = app.argv[0];
  }

  var folder = new folder_view.Folder(gui.App, $('#files'));
  var addressbar = new abar.AddressBar($('#addressbar'));

  var thumbSize = new controls.ThumbSize(gui.App, $('#thumb-size-input'));

  thumbSize.on('update', function(thumbSize) {
    console.log("New thumbnail size: ", thumbSize);
    var cssRule = getCSSRule('.file');
    if (cssRule) {
      cssRule.style.width = thumbSize + 'px';
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
});
