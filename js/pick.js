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

;+function (window, document, undefined) {
  var activity;
  var _ = window.document.webL10n.get;
  var selectedFolder = '';
  
  window.navigator.mozSetMessageHandler('activity', function(request) {
    activity = request;

    var option = activity.source;
    
    if (option.name === 'pick') {
      var data = option.data;
      
      console.log('Recibido', data);
    } else {
      console.error('Not allowed');
    }
  });
  

  window.utils = window.utils || {};
  window.Activity = window.Activity || window.MozActivity;
  window.config.activity = 'pick';

  function init() {
    if (window.files.path.length > 0) {
      window.storage.load(true);
    } else {
      window.utils.preload.complete();
      window.storage.load(false);
    }
  }

  window.addEventListener('localized', function() {
    window.config.app = _('file-manager');

    document.documentElement.lang = document.webL10n.getLanguage();
    document.documentElement.dir = document.webL10n.getDirection();

    init();
  }, false);
}(window, document);

