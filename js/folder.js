/*
* File Manager - A Firefox OS file manager app
* Copyright (C) 2013-2015 Jhon Klever
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* https://github.com/elfoxero/file-manager/blob/master/LICENSE
*/

;+function (win, doc, undefined) {
  var _ = win.document.webL10n.get;

  win.navigator.setMessageHandler = win.navigator.setMessageHandler || win.navigator.mozSetMessageHandler;

  function init(data) {
    win.config.app = _(data.action + '-to');

    win.files.path = data.storage;
    win.files.set(data.files);
    win.files.show();
    win.config.refreshToolbar();
    win.utils.preload.complete();
  }

  win.config.activity = 'folder';

  win.navigator.setMessageHandler('activity', function(request) {
    var activity = request;

    var option = activity.source;
    var data = option.data;
    var doneBtns = doc.getElementsByName('done');

    if ('files' in data) {
      if (win.document.webL10n.getReadyState() !== 'complete') {
        window.addEventListener('localized', function() {
          init(data);
        }, false);
      } else {
        init(data);
      }
    }

    doc.querySelector('#close').onclick = function (e) {
      activity.postError('Activity cancelled');
      activity = null;
    };

    for (var i = 0; i < doneBtns.length; i++) {
      doneBtns[i].addEventListener('click', function () {
        win.files.call(function (curFile, curDir) {
          activity.postResult({path: curDir});
          activity = null;
        });
      });
    }
  });

  win.config.app = '';
}(window, document);
