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

;-function(window, document, undefined) {
  var _ = window.document.webL10n.get;
  var selectedFolder = '';

  window.utils = window.utils || {};
  window.Activity = window.Activity || window.MozActivity;

  document.querySelector('#file-action menu:first-of-type').addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
      if (event.target.dataset.notClose === undefined) {
        document.getElementById('file-action').className = 'fade-out';
      }
    }
  });

  document.querySelector('#folder-action menu').addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
      document.getElementById('folder-action').className = 'fade-out';
    }
  });

  document.querySelector('#file-action menu:last-of-type').addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
      var formatFile = event.target.dataset.fileformat;
      var mimeFile = formatFile.split('/').shift() + '/*';

      files.call(function (curFile, curDir) {
        openFile(mimeFile, curFile, curDir, formatFile);

        document.getElementById('file-action').className = 'fade-out';
      });
    }
  });

  document.querySelector('#file-action button[data-action="O"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir) {
      openFile(curFile.mime, curFile, curDir);
    });
  });

  document.querySelector('#file-action button[data-action="A"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir) {
      openFileAs(curFile, curDir);
    });
  });

  document.querySelector('#file-action button[data-action="W"]').addEventListener('click', function () {
    files.call(function (curFile, curDir) {
      var data = {
        type: 'image/*',
        'number': 1,
        'blobs': [curFile.blob],
        'filenames': [curFile.name],
        'filepaths': [curFile.blob.name]
      };

      new Activity({
        name: 'setwallpaper',
        data: data
      }) .onerror = function() {
        if (this.error.name === 'NO_PROVIDER') {
          new Activity({
            name: 'share',
            data: data
          }) .onerror = function() {
            console.warn('View activity error: ' + this.error.name);
          };
        } else {
          console.warn('View activity error: ' + this.error.name);
        }
      };
    });
  });

  document.querySelector('button[data-filetype="T"]').addEventListener('click', function () {
    files.call(function (curFile, curDir) {
      openFile('text/plain', curFile, curDir);
    });
  });

  document.querySelector('button[data-filetype="V"]').addEventListener('click', function () {
    utils.actions.formats(this.dataset.filetype);
  });

  document.querySelector('button[data-filetype="I"]').addEventListener('click', function () {
    utils.actions.formats(this.dataset.filetype);
  });

  document.querySelector('button[data-filetype="A"]').addEventListener('click', function () {
    utils.actions.formats(this.dataset.filetype);
  });

  document.querySelector('#file-action button[data-action="X"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir, curItem) {
      if (confirm(_('sure-delete', {file: curFile.name}))) {
        files.task('delete', {}, {}, function () {
          utils.status.show('{{' + curFile.name + '}} ' + _('deleted'));
          window.config.refreshToolbar();
        }, function () {
          utils.status.show(_('unable-delete') + ' {{' + curFile.name + '}}');
        });
      }
    });
  });

  document.querySelector('#file-action button[data-action="R"]').addEventListener('click', function (event) {
    files.call(function (curFile, current) {
      var newName = prompt(_('new-filename'), curFile.name) || '';
      newName = newName.trim();

      if (newName.length > 0 && newName.toLowerCase() !== curFile.name.toLowerCase()) {
        var oldName = curFile.blob.name;

        files.task('rename', {}, {'name': newName}, function () {
          utils.status.show(_('filename-changed'));
        }, function () {
          utils.status.show(_('unable-rename'));
        });
      }
    });
  });

  document.querySelector('#file-action button[data-action="D"]').addEventListener('click', function (event) {
    files.call(function (curFile, current) {
      var lastModified = curFile.blob.lastModifiedDate;

      document.querySelector('#file-name').textContent = curFile.name;
      document.querySelector('#file-size').textContent = utils.files.size(curFile.blob.size);
      document.querySelector('#file-modified').textContent = lastModified.format(window.localStorage.dateFormat);
      document.querySelector('#file-type').textContent = (curFile.blob.type || utils.files.mime(curFile.name.split('.').pop(), _('unknown')).mime);
      document.querySelector('#absolute-path').textContent = curFile.blob.name;
      document.querySelector('#details').className = 'fade-in';
    });
  });

  document.querySelector('#details button').onclick = function () {
    document.querySelector('#details').className = 'fade-out';
  };

  document.querySelector('#file-action button[data-action="C"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir) {
      var onsuccess = function(e) {
        var path = e.target.result.path;
        var filename;

        if (path === curDir) {
          var name = prompt(_('name-to-copy')) || '';
          name = name.trim();

          if (name.length === 0) return;

          filename = window.config.baseDir(path) + name;
        } else {
          filename = window.config.baseDir(path) + curFile.name;
        }

        if (files.isFile(filename)) {
          if (confirm(_('replace-file'))) {
            files.task('copy', {}, {'replace': true, 'name': filename, 'dir': path}, function () {
              window.config.refreshToolbar();
              utils.status.show(_('file-copied'));
            }, function () {
              utils.status.show(_('unable-copy'));
            });
          }
        } else {
          files.task('copy', {}, {'replace': false, 'name': filename, 'dir': path}, function () {
            window.config.refreshToolbar();
            utils.status.show(_('file-copied'));
          }, function () {
            utils.status.show(_('unable-copy'));
          });
        }
      };

      var activity = new Activity({
        name: 'filemanager@elfoxero:pick-folder',
        data: {
          'action': 'copy',
          'storage': storage.name,
          'files': files.all
        }
      });

      activity.onerror = function(e) {
        if (activity.error.name === 'NO_PROVIDER') {
          new Activity({
            name: 'pick-folder',
            data: {
              'action': 'copy',
              'storage': storage.name,
              'files': files.all
            }
          }) .onsuccess = onsuccess;
        }
      };

      activity.onsuccess = onsuccess;
    });
  });

  document.querySelector('#file-action button[data-action="M"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir) {
      var onsuccess = function(e) {
        var path = e.target.result.path;
        var newName = window.config.baseDir(path) + curFile.name;
        var oldName = curFile.blob.name;

        if (path === curDir) {
          utils.status.show(_('source-target-same'));
        } else {
          if (files.isFile(newName)) {
            if (confirm(_('replace-file'))) {
              files.task('move', {}, {'replace': true, 'name': newName, 'dir': path}, function () {
                window.config.refreshToolbar();
                utils.status.show(_('file-moved'));
              }, function () {
                utils.status.show(_('unable-move'));
              });
            }
          } else {
            files.task('move', {}, {'replace': false, 'name': newName, 'dir': path}, function () {
              window.config.refreshToolbar();
              utils.status.show(_('file-moved'));
            }, function () {
              utils.status.show(_('unable-move'));
            });
          }
        }
      };

      var activity = new Activity({
        name: 'filemanager@elfoxero:pick-folder',
        data: {
          'action': 'move',
          'storage': storage.name,
          'files': files.all
        }
      });

      activity.onerror = function(e) {
        if (activity.error.name === 'NO_PROVIDER') {
          new Activity({
            name: 'pick-folder',
            data: {
              'action': 'move',
              'storage': storage.name,
              'files': files.all
            }
          }) .onsuccess = onsuccess;
        }
      };

      activity.onsuccess = onsuccess;
    });
  });

  document.querySelector('#file-action button[data-action="S"]').addEventListener('click', function (event) {
    files.call(function (curFile, curDir) {
      var activity = new Activity({
        name: 'share',
        data: {
          'type': 'image/*',
          'number': 1,
          'blobs': [curFile.blob],
          'filenames': [curFile.name],
          'filepaths': [curFile.blob.name]
        }
      });

      activity.onerror = function(e) {
        console.warn('Activity error: ', activity.error.name);
      };
    });
  });

  if (document.querySelector('#refresh')) {
    document.querySelector('#refresh').addEventListener('click', function (e) {
      window.config.toolbar = 'loading';
      files.reset();

      if (document.body.dataset.devices === 'true') {
        if (!document.getElementById('index').classList.contains('left')) {
          var stateLabels = document.querySelectorAll("#index ul.files > li > a > p:nth-child(2)");

          [].forEach.call(stateLabels, function (label) {
            label.textContent = '';
          });

          storage.refresh(function (index, value) {
            if (typeof value === 'number') {
              files.updateCard(index, {space: value});
            } else {
              files.updateCard(index, {status: value});
            }

            if (index === stateLabels.length - 1) {
              window.config.toolbar = [stateLabels.length, 'devices'];
            }
          });
        } else {
          storage.refresh();
        }
      } else {
        storage.refresh();
      }
    });
  }

  document.querySelector('#new-folder').addEventListener('click', function (e) {
    files.call(function (curFile, curDir) {
      var folderName = prompt(_('name-new-folder')) || '';

      if (folderName.length > 0) {
        var blob = new Blob(['']);
        var filename = config.baseDir(curDir) + folderName + '/.empty';

        storage.create(blob, filename, function (e) {
          files.push({'name': filename, 'blob': blob, 'disabled': false});
          files.show();

          window.config.refreshToolbar();
          utils.status.show(_('folder-created'));
        }, function (e) {
          utils.status.show(_('unable-create-folder'));
        });
      }
    });
  });

  document.querySelector('#new-file').addEventListener('click', function (e) {
    files.call(function (curFile, curDir) {
      var filename = prompt(_('name-new-file')) || '';

      if (filename.length > 0) {
        var blob = new Blob(['']);
        var name = config.baseDir(curDir) + filename;

        storage.create(blob, name, function (e) {
          files.push({'name': filename, 'blob': blob, 'disabled': false});

          var activity = new Activity({
            name: 'open',
            data: {
              'type': 'text/plain',
              'name': name,
              'filename': filename,
              'blob': blob
            }
          });

          activity.onerror = function(e) {
            console.warn('Activity error: ' + activity.error.name);
          };

          activity.onsuccess = function(e) {
            if (activity.result.saved) {
              storage.get(name, function () {
                utils.status.show(_('file-saved'));
                files.push({'name': name, 'blob': this.result});
                files.show();
                window.config.refreshToolbar();
              }, function () {
                utils.status.show(_('unable-create-file'));
              });
            } else {
              utils.status.show(_('unable-create-file'));
            }
          };
        }, function (e) {
          utils.status.show(_('unable-create-file'));
        });
      }
    });
  });

  var renameFolder = function (folderName) {
    if (typeof folderName !== 'string') {
      folderName = null;
    }

    files.call(function (curFile, curDir) {
      var source = {type: 'folder'};
      var curName = folderName || document.getElementById('folder').textContent;
      var newName = prompt(_('new-name'), curName) || '';

      newName = newName.trim();

      if (folderName) {
        source.dir = config.baseDir(curDir, true) + folderName;
      }

      if (newName.length > 0 && newName.toLowerCase() !== curName.toLowerCase()) {
        files.task('rename', source, {'name': newName}, function () {
          utils.status.show(_('name-changed'));
        }, function () {
          utils.status.show(_('unable-rename'));
        });
      }
    });
  };

  var deleteFolder = function (folderName) {
    if (typeof folderName !== 'string') {
      folderName = null;
    }

    files.call(function (curFile, curDir) {
      var source = {type: 'folder'};

      if (folderName) {
        source.dir = config.baseDir(curDir, true) + folderName;
      }

      if (confirm(_('sure-delete-folder'))) {
        files.task('delete', source, {}, function () {
          if (folderName) {
            files.show();
          }

          window.config.refreshToolbar();
          utils.status.show(_('folder-deleted'));
        }, function () {
          utils.status.show(_('unable-delete'));
        });
      }
    });
  };

  document.getElementById('rename-folder').addEventListener('click', renameFolder);
  document.getElementById('delete-folder').addEventListener('click', deleteFolder);

  document.querySelector('#folder-action button[data-action="R"]').addEventListener('click', function () {
    renameFolder(selectedFolder);
    selectedFolder = '';
  });

  document.querySelector('#folder-action button[data-action="D"]').addEventListener('click', function () {
    deleteFolder(selectedFolder);
    selectedFolder = '';
  });

  document.querySelector('#folder-action menu > button:last-of-type').addEventListener('click', function () {
    selectedFolder = '';
  });

  document.getElementById('about-us-btn').addEventListener('click', function (e) {
    document.getElementById('about-us').classList.add('show-from-bottom');
  });

  document.getElementById('about-us').addEventListener('animationend', function (e) {
    var me = this;

    if (me.classList.contains('show-from-bottom') && me.dataset.loaded === 'false') {
      var req = window.navigator.mozApps.getSelf();

      req.onsuccess = function () {
        if (req.result) {
          document.getElementById('about-version-label').textContent = req.result.manifest.version;
        } else {
          document.getElementById('about-version-label').textContent = '1.0-beta2';
        }
      };

      req.onerror = function () {
        document.getElementById('about-version-label').textContent = _('failed-to-load');
      };

      var xhr = new XMLHttpRequest();

      var onXhrFailure = function () {
        document.querySelector('#about-contributors-list > li > a > p').textContent = _('failed-to-load');
        me.dataset.loaded = 'true';
      };

      var onXhrSuccess = function (response) {
        var list = document.getElementById('about-contributors-list');
        var data = response.split("\n");

        list.innerHTML = '';

        data.forEach(function (contrib) {
          var contribData = contrib.split(',');

          if (contribData.length === 3) {
            var liElem = document.createElement('LI');
            var asideElem = document.createElement('ASIDE');
            var imgElem = document.createElement('IMG');
            var aElem = document.createElement('A');
            var p1Elem = document.createElement('P');
            var p2Elem = document.createElement('P');

            asideElem.className = 'pack-start';
            imgElem.alt = '';

            if (contribData[2].length > 0) {
              imgElem.onload = function () {
                console.error(this.parentElement);
                this.parentElement.style.background = 'none';
                this.style.transform = 'scale(1)';
              };
              imgElem.src = contribData[2];
            } else {
              imgElem.src = '#';
            }

            asideElem.appendChild(imgElem);
            liElem.appendChild(asideElem);

            aElem.target = '_blank';
            aElem.href = contribData[1];
            p1Elem.textContent = contribData[0];
            p2Elem.textContent = contribData[1];

            aElem.appendChild(p1Elem);

            if (contribData[1] !== '#') {
              aElem.appendChild(p2Elem);
            }

            liElem.appendChild(aElem);

            list.appendChild(liElem);
          }
        });
      };

      xhr.open('GET', 'CONTRIBUTORS');

      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain; charset=utf-8');
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200 || xhr.status === 0) {
            onXhrSuccess(xhr.responseText);
            me.dataset.loaded = 'true';
          } else {
            onXhrFailure();
          }
        }
      };
      xhr.onerror = onXhrFailure;
      xhr.ontimeout = onXhrFailure;

      xhr.send();
    }
  });

  document.getElementById('about-us-close').addEventListener('click', function (e) {
    document.getElementById('about-us').classList.remove('show-from-bottom');
    document.getElementById('about-us').classList.add('hide-to-bottom');
  });

  function init() {
    if (window.files.path.length > 0) {
      window.storage.load(true);
    } else {
      window.utils.preload.complete();
      window.storage.load(false);
    }
  }

  function openFile(mimeType, curFile, curDir, format) {
    switch (mimeType) {
      case 'video/*':
        document.getElementById('file-action').className = 'fade-out';

        var activity = new Activity({
          name: 'view',
          data: {
            type: (curFile.blob.type || format),
            allowSave: false,
            blob: curFile.blob,
            title: curFile.name
          }
        });

        activity.onerror = function() {
          console.warn('Activity error: ' + activity.error.name);
        };

        break;


      case 'audio/*':
        document.getElementById('file-action').className = 'fade-out';
        
        var activity = new Activity({
          name: 'open',
          data: {
            type: (curFile.blob.type || format),
            allowSave: false,
            blob: curFile.blob
          }
        });

        activity.onerror = function() {
          console.warn('Activity error: ' + activity.error.name);
        };

        break;

      case 'image/*':
        document.getElementById('file-action').className = 'fade-out';

        var activity = new Activity({
          name: 'open',
          data: {
            type: (curFile.blob.type || format),
            filename: curFile.name,
            blob: curFile.blob
          }
        });

        activity.onerror = function(e) {
          console.warn('Activity error: ' + activity.error.name);
        };

        break;

      case 'text/plain':
      case 'text/javascript':
      case 'text/html':
      case 'text/css':
      case 'application/x-web-app-manifest+json':
        document.getElementById('file-action').className = 'fade-out';

        var activity = new Activity({
          name: 'open',
          data: {
            'type': (curFile.blob.type || 'text/plain'),
            'name': curFile.blob.name,
            'filename': curFile.name,
            'blob': curFile.blob
          }
        });

        activity.onerror = function () {
          console.warnt('Activity error: ' + activity.error.name);
        };

        activity.onsuccess = function () {
          if (activity.result.saved) {
            utils.status.show(_('file-saved'));
            files.replace(activity.result.file, activity.result.blob);
          }
        };

        break;

      default:
        if (mimeType.length > 0) {
          var activity = new Activity({
            name: 'open',
            data: {
              type: mimeType,
              filename: curFile.name,
              blob: curFile.blob,
              allowSave: false
            }
          });

          activity.onsuccess = function () {
            document.getElementById('file-action').className = 'fade-out';
          };

          activity.onerror = function () {
            if (activity.error.name === 'NO_PROVIDER') {
              utils.actions.types();
            } else {
              document.getElementById('file-action').className = 'fade-out';
            }
          };
        } else {
          utils.actions.types();
        }
    }
  }

  function openFileAs(curFile, curDir) {
    utils.actions.types();
  }

  window.utils.actions = (function () {
    function showList(filename, mime) {
      document.querySelector('#file-action header').textContent = filename;
      document.querySelector('#file-action button[data-action="W"]').style.display = (mime.class === 'image' ? 'block' : 'none');

      var firstMenu = document.querySelector('#file-action menu:first-of-type');

      firstMenu.scrollTop = 0;

      if (firstMenu.className !== 'center-menu') {
        firstMenu.addEventListener('transitionend', function _transitionend() {
          document.getElementById('file-action').className = 'fade-in';
          this.removeEventListener('transitionend', _transitionend);
        });
        firstMenu.className = 'center-menu';
      } else {
        document.getElementById('file-action').className = 'fade-in';
      }

      document.querySelector('#file-action menu:nth-of-type(even)').className = 'right-menu';
      document.querySelector('#file-action menu:last-of-type').className = 'right-menu';
    }

    function showTypes() {
      document.querySelector('#file-action header').textContent = _('open-as');
      document.querySelector('#file-action menu:first-of-type').className = 'left-menu';
      document.querySelector('#file-action menu:nth-of-type(even)').className = 'center-menu';
    }

    function showFormats(term) {
      var type, types = {
        'V': ['video/mp4', 'video/webm', 'video/3gpp', 'video/ogg'],
        'A': ['audio/mpeg', 'audio/ogg', 'audio/mp4', 'audio/amr'],
        'I': ['image/png', 'image/jpeg', 'image/gif', 'image/bmp']
      };

      switch (term) {
        case 'V':
          type = 'video';
          break;
        case 'A':
          type = 'audio';
          break;
        case 'I':
          type = 'image';
          break;
      }

      if (!type) {
        document.getElementById('file-action').className = 'fade-out';
      } else {
        var lastMenu = document.querySelector('#file-action menu:last-of-type');
        var buttons = lastMenu.querySelectorAll('button');

        [].forEach.call(buttons, function (btn, index) {
          btn.dataset.fileformat = types[term][index];
          btn.textContent = btn.dataset.fileformat.split('/').pop();
        });

        document.querySelector('#file-action header').textContent = _('select-' + type + '-format');
        document.querySelector('#file-action menu:nth-of-type(even)').className = 'left-menu';
        lastMenu.className = 'center-menu';
      }

    }

    function showFolderList(foldername) {
      selectedFolder = foldername;

      document.querySelector('#folder-action header').textContent = foldername;
      document.getElementById('folder-action').className = 'fade-in';
    }

    return {
      'show': showList,
      'types': showTypes,
      'formats': showFormats,
      'folder': showFolderList
    };
  })();


  window.addEventListener('localized', function() {
    window.config.app = _('file-manager');

    document.documentElement.lang = document.webL10n.getLanguage();
    document.documentElement.dir = document.webL10n.getDirection();

    init();
  }, false);
}(window, document);
