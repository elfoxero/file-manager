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

importScripts('../js/lib/jszip.min.js');

onmessage = function (e) {
  var data = e.data;

  if (data.constructor.name === 'ArrayBuffer') {
    var zip = new JSZip(data);
    var entries = [];

    Object.keys(zip.files).forEach(function (name) {
      if (!zip.files[name].dir) {
        entries.push({
          name: '/sdcard/' + name,
          disabled: false,
          blob: {
            name: '/sdcard/' + name,
            lastModifiedDate: zip.files[name].date,
            size: -1,
            type: ''
          }
        });
      }
    });

    postMessage(entries);
  }

  close();
};
