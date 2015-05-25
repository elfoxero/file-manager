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
  var localStorage = window.localStorage;
  localStorage.dateFormat = localStorage.dateFormat || 'dd/mm/yyyy hh:MM:ss TT';

  function refreshToolbar() {
    var container = (document.querySelector('.current') ? document.querySelector('.current') : document.querySelector('[data-position="current"]'));
    window.config.toolbar = [container.querySelector('ul.files').childNodes.length, 'items'];
  }

  var isSimulator = navigator.getDeviceStorages('sdcard').length === 1 && !navigator.getDeviceStorages('sdcard')[0].storageName.length;

  window.config = (function () {
    var titleText = '';
    var appName = '';

    return {
      get app() {
        return appName;
      },
      set app(newApp) {
        appName = newApp;
        this.title = newApp;
      },
      get title() {
        return titleText;
      },
      set title(newTitle) {
        titleText = newTitle;
        document.getElementById('folder').textContent = newTitle;
      },
      set toolbar(value) {
        if (typeof value === 'string') {
          document.body.dataset.loading = 'true';

          document.getElementById('footer-label').textContent = _(value);
        } else if (value.length === 2) {
          document.body.dataset.loading = 'false';

          document.getElementById('footer-label').textContent = _(value[1], {n: value[0]});
        }
      },
      get isActivity() {
        return this.activity.length > 0;
      },
      'activity': '',
      'refreshToolbar': refreshToolbar,
      'isSimulator': isSimulator,
      'baseDir': function (dir, excludePre) {
        if (isSimulator) {
          if (dir.length) {
            return dir + '/';
          }
        } else {
          return (!excludePre ? '/' : '') + dir + '/';
        }

        return '';
      }
    };
  })();
}(window, document);
