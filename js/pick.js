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
