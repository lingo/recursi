global.$ = $;

var abar = require('address_bar');
var folder_view = require('folder_view');
var path = require('path');
var gui = require('nw.gui')
var fs = require('fs');
var shell = gui.Shell;

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
