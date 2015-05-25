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

  window.activity = null;
  window.activityData = null;

  navigator.setMessageHandler = navigator.setMessageHandler || navigator.mozSetMessageHandler;

  // Helpers

  var addJs = function (src, callback) {
    var el = element('script', { src: src });
    callback && (el.onload = callback);
    document.body.appendChild(el);
  };

  var addCss = function (href) {
    var el = element('link', { rel: 'stylesheet', href: href });
    document.querySelector('head').appendChild(el);
  };

  window.$ = function (selector) {
    return document.querySelector(selector);
  };

  window.element = function (tag, attrs, nodes) {
    var elem = document.createElement(tag);

    if (attrs) {
      if (typeof attrs === 'string') {
        elem.textContent = attrs;
      } else if (typeof attrs === 'object') {
        Object.keys(attrs).forEach(function (attr) {
          if (attr.indexOf('data-') === 0) {
            var attrParts = attr.split('-');
            attrParts.splice(0, 1);
            elem.dataset[attrParts.map(function (current, index) {
              return (index === 0 ? current : current.charAt(0).toUpperCase() + current.slice(1));
            }).join('')] = attrs[attr];
          } else if (attr === 'text') {
            elem.textContent = attrs[attr];
          } else if (attr === 'className') {
            elem.className = attrs[attr];
          } else {
            elem.setAttribute(attr, attrs[attr]);
          }
        });
      }
    }

    if (nodes) {
      if (nodes.constructor.name === 'Array') {
        nodes.forEach(function (node) {
          elem.appendChild(node);
        });
      } else {
        elem.appendChild(nodes);
      }
    }

    return elem;
  };

  navigator.setMessageHandler('activity', function(request) {
    activity = request;

    window.activityData = activity.source.data;

    $('#name').textContent = activityData.filename;

    if (/text/ .test(activityData.type) || /javascript/ .test(activityData.type)) {
      addCss('../style/text.css');

      addJs('../js/lib/gibberish-aes.js', function () {
        addJs('../js/storage.js', function () {
          addJs('../js/text.js');
        });
      });
    } else if (/zip/ .test(activityData.type)) {
      addCss('../shared/style/lists.css');
      addCss('../shared/style/scrolling.css');
      addCss('../style/icons.css');
      addCss('../style/util.css');
      addCss('../style/app.css');

      addJs('../js/config.js', function () {
        addJs('../js/mime.js', function () {
          addJs('../js/util.js', function () {
            addJs('../js/files.js', function () {
              addJs('../js/zip.js', function () {

              });
            });
          });
        });
      });
    }
  });

  $('#close').onclick = function (e) {
    if (window.activity) {
      activity.postResult({saved: false});
      activity = null;
    }
  };
} (window, document, undefined);
