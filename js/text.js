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
  var size, file, password;
  var _ = document.webL10n.get;

  function init() {
    setup();

    if ( !('fontSize' in window.localStorage) ) {
      window.localStorage.fontSize = '2';
      size = 2;
    } else {
      size = parseFloat(window.localStorage.fontSize);
    }

    if ( !('wrap' in window.localStorage) ) {
      window.localStorage.wrap = 'off';
    }

    setFontSize();
    setWrap();

    load();
  }

  function setup() {
    // Structure
    $('article').className = 'editor-container';

    var section = $('article > section');
    section.classList.add('editor');
    section.appendChild(element('textarea'));

    var toolbar = $('[role="toolbar"]');

    var ul = element('ul');
    var li = element('li');
    var btn = element('button', { className: 'action-icon calendar-agendaview', id: 'adjust' });

    li.appendChild(btn);
    ul.appendChild(li);

    li = element('li');
    btn = element('button', { className: 'action-icon unlock', id: 'encryption' });

    li.appendChild(btn);
    ul.appendChild(li);

    toolbar.appendChild(ul);

    ul = element('ul');
    li = element('li');
    btn = element('button', { className: 'action-icon new', id: 'more' });

    li.appendChild(btn);
    ul.appendChild(li);

    li = element('li');
    btn = element('button', { className: 'action-icon minus', id: 'less' });

    li.appendChild(btn);
    ul.appendChild(li);

    toolbar.appendChild(ul);

    $('section[data-position="back"]').id = 'password';

    var strong = element('strong');
    strong.appendChild(element('span', _('password') || 'Password'));

    var span = element('span');
    span.appendChild(element('input', { type: 'password' }));

    var p = $('#password section > p');

    p.appendChild(strong);
    p.appendChild(span);

    $('#password menu').appendChild(element('button', _('ok') || 'Ok'));

    // Events

    $('#more').onclick = function (e) {
      size = Math.min(size + 0.5, 8);
      setFontSize();
    };

    $('#less').onclick = function (e) {
      size = Math.max(size - 0.5, 0.5);
      setFontSize();
    };

    $('#adjust').onclick = function (e) {
      if (window.localStorage.wrap === 'off') {
        window.localStorage.wrap = '';
      } else {
        window.localStorage.wrap = 'off';
      }
      setWrap();
    };

    $('#password form').onsubmit = function (e) {
      e.preventDefault();

      password = $('input').value;
      setEncryptionIcon();
      textarea = $('textarea');

      if (password && textarea.needsDec === true) {
        // Decoding will throw an exception when the user entered an
        // incorrect password - thus the dialog won't be faded out.
        textarea.value = GibberishAES.dec(textarea.value, password);
      }
      textarea.needsDec = false;
      $('#password').className = 'fade-out';
    }

    $('#encryption').onclick = function (e) {
      if (password) {
        password = null;
      } else {
        $('#password').className = 'fade-in';
      }
      setEncryptionIcon();
    }

    $('#save').parentElement.className = 'shown';

    $('#save').onclick = function (e) {
      var parts = file.split('/');

      if (navigator.getDeviceStorages('sdcard').length == 1 && !navigator.getDeviceStorages('sdcard')[0].storageName.length) {
        storage.set('sdcard');
      } else if (parts.length > 1) {
        storage.set(parts[1]);
      } else {
        alert(_('storage-not-found'));
      }

      storage.delete(file, function () {
        var plainText = document.querySelector('textarea').value;

        if (password) {
          plainText = GibberishAES.enc(plainText, password);
        }
        var blob = new Blob([plainText]);

        storage.create(blob, file, function () {
          window.activity.postResult({'saved': true, 'file': file, 'blob': blob});
          window.activity = null;
        }, function () {
          window.activity.postResult({saved: false});
          window.activity = null;
        });
      }, function () {
        window.activity.postResult({saved: false});
        window.activity = null;
      });

    };
  }

  function setFontSize() {
    window.localStorage.fontSize = size.toString();
    $('textarea').style.fontSize = size.toString() + 'rem'
  }

  function setWrap() {
    $('textarea').wrap = window.localStorage.wrap;
  }

  function setEncryptionIcon() {
    if (password) {
      $('#encryption').className = 'action-icon lock';
    } else {
      $('#encryption').className = 'action-icon unlock';
    }
  }

  function load() {
    var reader = new FileReader();

    file = activityData.name;

    reader.onload = function (e) {
      $('textarea').value = e.target.result;

      // OpenSSL encrypted texts start with the base64 encoded string "Salted__"
      if (e.target.result.lastIndexOf('U2FsdGVkX1', 0) === 0) {
        $('#password').className = 'fade-in';
        $('textarea').needsDec = true;
      }
    };

    reader.readAsText(activityData.blob);
  }

  init();

} (window, document, undefined);
