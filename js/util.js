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

window.utils = window.utils || {};

document.byId = function (query) {
  return document.getElementById(query);
};

window.utils.preload = (function(win, doc, undefined) {
  function completePreload() {
    var loadingProgress = doc.byId('loading-progress');
    var loading = doc.byId('loading');
    var self = win.utils.preload;

    loading.className = 'fadeOut';

    loading.addEventListener('animationend', function _animationend() {
      loading.className = '';
      loading.removeEventListener('animationend', _animationend);
    });

    if (typeof self.oncomplete === 'function') {
      self.oncomplete.call(self);
    }
  }

  function startPreload() {
    var self = win.utils.preload;

    doc.byId('loading-bar').className = 'fade-in';

    if (typeof self.onstart === 'function') {
      self.onstart.call(self);
    }
  }

  return {
    get max() {
      return doc.byId('loading-progress').max;
    },
    set max(val) {
      var loadingProgress = doc.byId('loading-progress');
      var defaultMax = loadingProgress.max;

      loadingProgress.max = val;

      if (defaultMax === 1) {
        startPreload();
      }
    },
    get value() {
      return doc.byId('loading-progress').value;
    },
    set value(val) {
      var loadingProgress = doc.byId('loading-progress');

      loadingProgress.value = val;

      if (loadingProgress.value === loadingProgress.max) {
        completePreload();
      }
    },
    'complete': completePreload,
    'start': startPreload,
    'oncomplete': null,
    'onstart': null
  };
})(window, document);
