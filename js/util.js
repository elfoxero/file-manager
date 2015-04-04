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
