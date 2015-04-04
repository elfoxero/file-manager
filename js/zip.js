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
  var _ = window.document.webL10n.get;
  var worker = new Worker('../js/zip_worker.js');
    
  function init() {
    setup();
    
    window.config.activity = 'zip';
    window.config.app = window.activityData.filename;
    window.files.path = 'sdcard';
    
    load();
  }
  
  function setup() {
    var index = $('#index');
    index.removeChild($('#drawer'));
    
    // #drawer
    var section = element('section', { role: 'region', id: 'drawer', className: 'skin-dark' });
    
    var header = element('header', { className: 'fixed' }, [
      element('a', { id: 'back', className: 'folder', href: '#' }, [
        element('span', { className: 'icon icon-back', text: 'back' })
      ]),
      element('button', { id: 'close' }, [
        element('span', { className: 'icon icon-close', text: 'close' })
      ]),
      element('h1', { id: 'folder', text: ' ' })
    ]);
    
    var toolbar = element('div', { role: 'toolbar' }, [
      element('ul', null, [
        element('li', null, [
          element('span', { className: 'toolbar-text' }, [
            element('span', { id: 'footer-label', 'data-l10n-id': 'items', 'data-l10n-args': '{"n": "0"}', text: '0 items' })
          ])
        ])
      ]),
      element('ul')
    ]);
    
    section.appendChild(header);
    section.appendChild(toolbar);
    document.body.insertBefore(section, index);
    
    index.appendChild(element('section', { role: 'region', className: 'skin-dark' }, [
      element('article', { className: 'content scrollable scrollable-y header' }, [
        element('section', { 'data-type': 'list' }, [
          element('ul', { className: 'files' })
        ])
      ])
    ]));
    
    for (var i = 0; i < 2; i++) {
      document.body.appendChild(element('section', { role: 'region', name: 'side', 'data-position': 'right', 'data-skin': 'dark' }, [
        element('article', { className: 'content scrollable scrollable-y header' }, [
          element('section', { 'data-type': 'list' }, [
            element('ul', { className: 'files' })
          ])
        ])
      ]));
    }
    
    // Events
    $('#close').onclick = function (e) {
      window.activity.postResult({saved: false});
      window.activity = null;
    };
    
    $('#back').onclick = function () {
      window.files.go(-1);
    };
  }

  function load() {
    var reader = new FileReader();
    
    reader.onload = function (e) {
      worker.postMessage(e.target.result, [e.target.result]);
    };
    
    reader.readAsArrayBuffer(activityData.blob);
  }
  
  worker.onmessage = function (e) {
    window.files.set(e.data);
    window.files.show();
    window.config.refreshToolbar();
  };
  
  init();

} (window, document, undefined);
