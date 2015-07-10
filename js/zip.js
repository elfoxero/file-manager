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
