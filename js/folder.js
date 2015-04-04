/*
* Copyright (c) 2013-2015 Jhon Klever, http://github.com/elfoxero
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to
* deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish and distribute, subject to the
* following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*
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
