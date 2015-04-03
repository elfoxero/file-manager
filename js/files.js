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

window.utils.files = (function() {
	var types = {
		'video/*': ['video/mp4']
	};

	function getSize(size) {
		if (size === 0) {
			return '0 bytes';
		} else {
			var labels = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
			var index = Math.floor(Math.log(size) / Math.log(1024));

			if (index in labels) {
				return (size / Math.pow(1024, Math.floor(index))).toFixed(2) + ' ' + labels[index];
			} else {
				return '??? bytes';
			}
		}
	}

	function getMIME(ext, def) {
		def = def || '';
		var returned = {mime: def};

		for (var i = 0; i < MIME.length; i++) {
			if (MIME[i].extensions.indexOf(ext) > -1) {
				returned = MIME[i];
				break;
			}
		}

		return returned;
	}

	function getType(file) {
		var filename = file.split('/').pop();
		var parts = filename.split('.');

		if (parts.length > 1) {
			var MIME = getMIME(parts.pop());

			return MIME.mime;
		}

		return '';
	}

	function getIcon(type, ext) {
		var name = 'unknown';

		if (type.length > 0) {
			for (var i = 0; i < MIME.length; i++) {
				if (new RegExp(MIME[i].pattern) .test(type)) {
					name = MIME[i].class;
					break;
				}
			}
		} else {
			for (var j = 0; j < MIME.length; j++) {
				if (MIME[j].extensions.indexOf(ext) > -1) {
					name = MIME[j].class;
					break;
				}
			}
		}

		return name;
	}

	function getStatus(status) {
		if (status === 'shared') {
			return _('shared-via-usb');
		} else {
			return _('unavailable');
		}
	}

	return {
		'size': getSize,
		'mime': getMIME,
		'icon': getIcon,
		'type': getType,
		'status': getStatus
	};
})();

var files = (function () {
	var _ = window.document.webL10n.get;
	var microtime = 0;
	var curDir = '';
	var allFiles = [];
	var allCards = [];
	var cachedCards = [];
	var curFile = null;
	var curItem = null;
	var fileList = document.querySelector('#index .files');
	var tasks = [];
	var touchTimer = -1;
	var touchClientX = 0;
	var touchClientY = 0;

	function addTask(action, source, target, onsuccess, onerror) {
		source.type = source.type || 'file';
		source.dir = source.dir || curDir;
		source.file = source.file || curFile;
		source.item = source.item || curItem;

		switch (action) {
			case 'delete':
				if (source.type === 'file') {
					deleteFile(source.file.blob.name, source.item, source.dir);
				} else if (source.type === 'folder') {
					source.type = 'files';
					source.files = deleteFolder(source.dir);
				}
				break;
            case 'rename':
                if (source.type === 'file') {
                    var filename = window.config.baseDir(source.dir) + target.name;

                    replaceFile(source.file.blob.name, {
                        'name': filename,
                        'type': utils.files.type(filename),
                        'size': source.file.blob.size
                    }, filename, true);

                    showFileList();
                } else if (source.type === 'folder') {
                    var response = replaceFolder(source.dir, target.name, true);

                    source.type = 'files';
                    source.files = response[0];
                    target.names = response[1];
                }
                break;
            case 'copy':
                if (target.replace) {
                    replaceFile(source.file.blob.name, source.file.blob, false, true);
                } else {
                    pushFile({'name': target.name, 'blob': {
                        'name': target.name,
                        'type': source.file.blob.type,
                        'size': source.file.blob.size
                    }, 'disabled': true});
                }

                if (target.dir === curDir) {
                    showFileList();
                }
                break;
            case 'move':
                deleteFile(source.file.blob.name, source.item, source.dir);

                if (target.replace) {
                    replaceFile(target.name, source.file.blob, false, true);
                } else {
                    pushFile({'name': target.name, 'blob': {
                        'name': target.name,
                        'type': source.file.blob.type,
                        'size': source.file.blob.size
                    }, 'disabled': true});
                }
                break;
        }

        tasks.push({'action': action, 'source': source, 'target': target, 'onsuccess': onsuccess, 'onerror': onerror});

        this.isExecuting = true;
    }

    function executeTasks() {
        if (tasks.length > 0) {
            var task = tasks.shift();
            var action = task.action;
            var source = task.source;
            var target = task.target;
            var onsuccess = task.onsuccess || false;
            var onerror = task.onerror || false;

            source.type = source.type || 'file';
            source.dir = source.dir || curDir;

            if (source.type === 'file') {
                source.file = source.file || curFile;

                switch (action) {
                    case 'delete':
                        storage.delete(source.file.blob.name, function () {
                            source.file.blob = null;
                            source.file = null;
                            if (onsuccess) onsuccess();
                            executeTasks();
                        }, function () {
                            if (onerror) onerror();
                            executeTasks();
                        });
                        break;
                    case 'rename':
                        var filename;

                        if (target.name.indexOf('/') >= 0) {
                            filename = target.name;
                        } else {
                            filename = window.config.baseDir(source.dir) + target.name;
                        }

                        storage.create(source.file.blob, filename, function () {
                            storage.delete(source.file.blob.name, function () {
                                storage.get(filename, function (e) {
                                    source.file.blob = null;
                                    source.file = null;

                                    replaceFile(filename, e.target.result);

                                    if (source.dir === curDir) {
                                        showFileList();
                                    }

                                    if (onsuccess) onsuccess();
                                    executeTasks();
                                }, function () {
                                    if (onerror) onerror();
                                    executeTasks();
                                });
                            }, function () {
                                if (onerror) onerror();
                                executeTasks();
                            });
                        }, function () {
                            if (onerror) onerror();
                            executeTasks();
                        });
                        break;
                    case 'copy':
                        var filename = target.name;

                        if (target.replace) {
                            storage.delete(filename, function () {
                                storage.create(source.file.blob, filename, function () {
                                    storage.get(filename, function (e) {
                                        replaceFile(filename, e.target.result);

                                        if (target.dir === curDir) {
                                            showFileList();
                                        }

                                        if (onsuccess) onsuccess();
                                        executeTasks();
                                    }, function () {
                                        if (onerror) onerror();
                                        executeTasks();
                                    });
                                }, function () {
                                    if (onerror) onerror();
                                    executeTasks();
                                });
                            }, function () {
                                if (onerror) onerror();
                                executeTasks();
                            });
                        } else {
                            storage.create(source.file.blob, filename, function () {
                                storage.get(filename, function (e) {
                                    replaceFile(filename, e.target.result);

                                    if (target.dir === curDir) {
                                        showFileList();
                                    }

                                    if (onsuccess) onsuccess();
                                    executeTasks();
                                }, function () {
                                    if (onerror) onerror();
                                    executeTasks();
                                });
                            }, function () {
                                if (onerror) onerror();
                                executeTasks();
                            });
                        }
                        break;
                    case 'move':
                        var filename = target.name;

                        if (target.replace) {
                            storage.delete(filename, function () {
                                storage.create(source.file.blob, filename, function () {
                                    storage.get(filename, function (e) {
                                        var result = e.target.result;

                                        storage.delete(source.file.blob.name, function () {
                                            replaceFile(filename, result);

                                            if (target.dir === curDir) {
                                                showFileList();
                                            }

                                            if (onsuccess) onsuccess();
                                            executeTasks();
                                        }, function () {
                                            if (onerror) onerror();
                                            executeTasks();
                                        });
                                    }, function () {
                                        if (onerror) onerror();
                                        executeTasks();
                                    });
                                }, function () {
                                    if (onerror) onerror();
                                    executeTasks();
                                });
                            }, function () {
                                if (onerror) onerror();
                                executeTasks();
                            });
                        } else {
                            storage.create(source.file.blob, filename, function () {
                                storage.get(filename, function (e) {
                                    var result = this.result;

                                    storage.delete(source.file.blob.name, function () {
                                        replaceFile(filename, result);

                                        if (target.dir === curDir) {
                                            showFileList();
                                        }

                                        if (onsuccess) onsuccess();
                                        executeTasks();
                                    }, function () {
                                        if (onerror) onerror();
                                        executeTasks();
                                    });
                                }, function () {
                                    if (onerror) onerror();
                                    executeTasks();
                                });
                            }, function () {
                                if (onerror) onerror();
                                executeTasks();
                            });
                        }
                        break;
                }
            } else if (source.type === 'files') {
                for (var j = source.files.length - 1; j > -1; j--) {
                    var fileSource = {
                        'type': 'file',
                        'file': source.files[j],
                        'dir': source.dir
                    }, targetFile;

                    if (action === 'rename' && 'names' in target) {
                        targetFile = {'name': target.names[j]};
                    } else {
                        targetFile = target;
                    }

                    if (j === source.files.length - 1) {
                        tasks.unshift({'action': action, 'source': fileSource, 'target': targetFile, 'onsuccess': onsuccess, 'onerror': onerror});
                    } else {
                        tasks.unshift({'action': action, 'source': fileSource, 'target': targetFile});
                    }
                }

                executeTasks();
            }
        } else {
            files.isExecuting = false;
        }
    }

    function pushFile(objFile) {
        allFiles.push(objFile);
    }

    function pushCard(objCard) {
        allCards.push(objCard);
    }

    function cacheCard(stgName) {
        cachedCards.push(stgName);
    }

    function setCard(iCard, objCard) {
        if (typeof iCard === 'string') {
            for (var i = 0; i < allCards.length; i++) {
                if (allCards[i].name === iCard) {
                    iCard = i;
                    break;
                }
            };
        }

        if ('space' in objCard) {
            allCards[iCard].space = objCard.space;

            if (allCards[iCard].status === 'available') {
                fileList.querySelectorAll('li')[iCard].querySelector('p:last-child').textContent = utils.files.size(objCard.space) + ' ' + _('of-free-space');
            }
        }

        if ('status' in objCard) {
            allCards[iCard].status = objCard.status;

            fileList.querySelectorAll('li')[iCard].querySelector('a').dataset.status = objCard.status;
            fileList.querySelectorAll('li')[iCard].querySelector('p:last-child').textContent = utils.files.status(objCard.status);
        }
    }

    function setFileList(arrList) {
        allFiles.length = 0;

        allFiles = arrList;
    }

    function clearFileList() {
        allFiles.length = 0;
        cachedCards.length = 0;
    }

    function getFolderName(dir) {
        dir = dir || curDir;

        return dir.split('/').pop();
    }

    function showFileList() {
		fileList = fileList || document.querySelector('#index .files');
        fileList.innerHTML = '';

        if (curDir.length > 0 || window.config.isSimulator) {
            var filesFound = [];
            var foldersFound = [];

            if (!window.config.isActivity) {
                document.querySelector('#drawer menu[type="toolbar"]').style.display = 'block';
            }

            for (var i = 0; i < allFiles.length; i++) {
                var file = allFiles[i];
                var baseCurDir = window.config.baseDir(curDir);

                if (file.name.indexOf(baseCurDir) === 0) {
                    var parts = file.name.replace(baseCurDir, '').split('/');

                    if (parts.length > 1) {
                        if (foldersFound.indexOf(parts[0]) < 0) {
                            foldersFound.push(parts[0]);
                        }
                    } else {
                        var extParts = parts[0].split('/').pop().split('.'), empty = false;

                        if (extParts.length > 1) {
                            if (extParts[0].length === 0 && extParts[1].toLowerCase() === 'empty') {
                                empty = true;
                            }
                        }

                        if (!empty) {
                            filesFound.push({'name': parts[0], 'blob': file.blob, 'ext': (extParts.length > 1 ? extParts.pop().toLowerCase() : ''), 'disabled': file.disabled});
                        }
                    }
                }
            }

            foldersFound.sort(function (a, b) {
                if (a.toLowerCase() < b.toLowerCase())
                    return -1;

                if (a.toLowerCase() > b.toLowerCase())
                    return 1;

                return 0;
            });
            filesFound.sort(function (a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase())
                    return -1;

                if (a.name.toLowerCase() > b.name.toLowerCase())
                    return 1;

                return 0;
            });

            var liElem, asideElem, divElem, aElem, p1Elem, p2Elem;

            for (var j = 0; j < foldersFound.length; j++) {
                liElem = document.createElement('li');
                liElem.className = 'folder';
                asideElem = document.createElement('aside');
                divElem = document.createElement('div');
                aElem = document.createElement('a');
                p1Elem = document.createElement('p');

                asideElem.className = 'pack-start';
                divElem.className = 'file-icon folder';
                asideElem.appendChild(divElem);

                aElem.href = '#';
                aElem.onclick = function (folderName) {
                    return function (event) {
                        if (new Date() - microtime > 500) {
                            microtime = new Date();

                            var selector = '[name="side"]:not(.current):not(.left-to-current)';
                            var section = document.querySelector(selector);
                            var folder = document.querySelector('#folder');
                            fileList = document.querySelector(selector + ' .files');

                            if (window.config.isSimulator && !curDir.length) {
                                curDir = folderName;
                            } else {
                                curDir += '/' + folderName;
                            }

                            window.config.title = folderName;

                            showFileList();

                            document.querySelector('.current, .left-to-current').className = 'left';
                            section.className = 'current';
                            window.config.toolbar = [fileList.childNodes.length, 'items'];

                            if (document.querySelector('#back')) {
                                if (!document.querySelector('#back').classList.contains('folder') && !window.isActivity) {
                                    document.querySelector('#back').style.visibility = 'visible';
                                } else {
                                    document.querySelector('#back').style.display = 'block';
                                    document.querySelector('#close').style.display = 'none';
                                }
                            }
                        }
                    };
                } (foldersFound[j]);

                aElem.addEventListener('touchstart', (function (folderName) {
                    return function (event) {
                        touchClientX = event.touches[0].clientX;
                        touchClientY = event.touches[0].clientY;

                        touchTimer = window.setTimeout(function () {
                            touchTimer = -1;
                            utils.actions.folder(folderName);
                        }, 800);
                    };
                })(foldersFound[j]));

                p1Elem.appendChild(document.createTextNode(foldersFound[j]));
                aElem.appendChild(p1Elem);

                liElem.appendChild(asideElem);
                liElem.appendChild(aElem);

                fileList.appendChild(liElem);
            }

            for (var k = 0; k < filesFound.length; k++) {
                liElem = document.createElement('li');
                liElem.className = 'file';
                asideElem = document.createElement('aside');
                divElem = document.createElement('div');
                aElem = document.createElement('a');
                p1Elem = document.createElement('p');

                asideElem.className = 'pack-start';
                divElem.className = 'file-icon ' + utils.files.icon(filesFound[k].blob.type, filesFound[k].ext);
                asideElem.appendChild(divElem);

                aElem.href = '#';
                aElem.onclick = function (fileName, fileBlob, fileExt) {
                    return function () {
                        if (!window.config.isActivity) {
                            var fileMime = utils.files.mime(fileExt);

                            curFile = {'name': fileName, 'blob': fileBlob, 'ext': fileExt, 'mime': (fileMime.mime || fileBlob.type)};
                            curItem = this.offsetParent;

                            utils.actions.show(fileName, fileMime);
                        } else if (window.config.activity === 'file') {
                            window.activity.postResult({
                                'type': fileBlob.type,
                                'blob': fileBlob
                            });
                        }
                    };
                } (filesFound[k].name, filesFound[k].blob, filesFound[k].ext);

                p1Elem.appendChild(document.createTextNode(filesFound[k].name));
                aElem.appendChild(p1Elem);
				
				if (filesFound[k].blob.size >= 0) {
                	p2Elem = document.createElement('p');
					p2Elem.appendChild(document.createTextNode(utils.files.size(filesFound[k].blob.size)));
                	aElem.appendChild(p2Elem);
				}

                liElem.appendChild(asideElem);
                liElem.appendChild(aElem);

                if (filesFound[k].disabled) {
                    liElem.dataset.disabled = 'true';
                }

                fileList.appendChild(liElem);
            }

            var folderHeader = document.querySelector('[data-type="sidebar"] > header > h1');
            var valueHeader = curDir.split('/').pop();

            if (folderHeader) {
                folderHeader.textContent = valueHeader;
            }

            if (!window.config.isActivity) {
                if ((!window.config.isSimulator && curDir.indexOf('/') < 0) || (window.config.isSimulator && !curDir.length)) {
                    document.querySelector('#folder-operations-header').style.display = 'none';
                    document.querySelector('#folder-operations').style.display = 'none';
                } else {
                    document.querySelector('#folder-operations-header').style.display = '';
                    document.querySelector('#folder-operations').style.display = '';
                }
            }
        } else {
            var liElem, asideElem, divElem, aElem, p1Elem, p2Elem;

            if (!window.config.isActivity) {
                document.querySelector('#drawer menu[type="toolbar"]').style.display = 'none';
            }

            window.config.toolbar = [allCards.length, 'devices'];

            for (var j = 0; j < allCards.length; j++) {
                liElem = document.createElement('li');
                liElem.className = 'folder';
                asideElem = document.createElement('aside');
                divElem = document.createElement('div');
                aElem = document.createElement('a');
                p1Elem = document.createElement('p');
                p2Elem = document.createElement('p');

                asideElem.className = 'pack-start';
                divElem.className = 'file-icon card';
                asideElem.appendChild(divElem);

                aElem.href = '#';
                aElem.dataset.status = allCards[j].status;
                aElem.onclick = function (cardName) {
                    return function (event) {
                        if (this.dataset.status === 'available') {
                            if (new Date() - microtime > 500) {
                                microtime = new Date();

                                var selector = '[name="side"]:not(.current):not(.left-to-current)';
                                var section = document.querySelector(selector);
                                var folder = document.querySelector('#folder');
                                fileList = document.querySelector(selector + ' .files');

                                curDir = cardName;

                                window.config.title = cardName;

                                if (!window.config.isActivity) {
                                    document.querySelector('#drawer menu[type="toolbar"]').style.display = 'block';
                                }

                                storage.set(cardName);

                                document.querySelector('.current, .left-to-current').className = 'left';
                                section.className = 'current';

                                if (cachedCards.indexOf(cardName) < 0) {
                                    storage.load(false);
                                } else {
                                    showFileList();
                                    window.setTimeout(window.config.refreshToolbar, 0);
                                }

                                if (document.querySelector('#back')) {
                                    if (!document.querySelector('#back').classList.contains('folder') && !window.config.isActivity) {
                                        document.querySelector('#back').style.visibility = 'visible';
                                    } else {
                                        document.querySelector('#back').style.display = 'block';
                                        document.querySelector('#close').style.display = 'none';
                                    }
                                }
                            }
                        } else {
                            if (this.dataset.status === 'shared') {
                                alert(_('disconnect-usb'));
                            } else {
                                alert(_('insert-card'));
                            }
                        }
                    };
                } (allCards[j].name);

                p1Elem.appendChild(document.createTextNode(allCards[j].name));

                switch (allCards[j].status) {
                    case 'available':
                        if (allCards[j].space > 0) {
                            p2Elem.textContent = utils.files.size(allCards[j].space) + ' ' + _('of-free-space');
                        } else {
                            p2Elem.textContent = '';
                        }
                        break;
                    default:
                        p2Elem.textContent = utils.files.status(allCards[j].status);
                }

                aElem.appendChild(p1Elem);
                aElem.appendChild(p2Elem);

                liElem.appendChild(asideElem);
                liElem.appendChild(aElem);

                fileList.appendChild(liElem);
            }
        }
    }

    function deleteFile(strName, htmlItem, strDir) {
        for (var i = 0; i < allFiles.length; i++) {
            if (allFiles[i].name === strName) {
                allFiles.splice(i, 1);
                break;
            }
        }

        htmlItem.parentNode.removeChild(htmlItem);

        if (strDir !== undefined) {
            if (!hasFiles(strDir)) {
                var fileName = window.config.baseDir(strDir) + '.empty';
                var fileBlob = new Blob(['']);
                storage.create(fileBlob, fileName, function () {
                    pushFile({'name': fileName, 'blob': fileBlob, 'disabled': false});
                });
            }
        }
    }

    function changeFileName(strOld, strNew, objFile) {
        for (var i = 0; i < allFiles.length; i++) {
            if (allFiles[i].name === strOld) {
                allFiles[i]['name'] = strNew;
                allFiles[i]['blob'] = objFile;
                break;
            }
        }
    }

    function replaceFile(oldFile, blobFile, newFile, disabled) {
        newFile = newFile || oldFile;
        disabled = disabled || false;

        for (var i = 0; i < allFiles.length; i++) {
            if (allFiles[i].name === oldFile) {
                allFiles[i].name = newFile;
                allFiles[i].blob = null;
                allFiles[i].blob = blobFile;
                allFiles[i].disabled = disabled;
                break;
            }
        }
    }

    function preloadFileList() {
        fileList.parentElement.dataset.loading = 'true';
    }

    function loadedFileList() {
        fileList.parentElement.dataset.loading = 'false';
    }

    function callBack(funCallback) {
        funCallback(curFile, curDir, curItem);
    }

    function deleteFolder(strDir, htmlItem) {
        var deletedFiles = [];

        for (var i = allFiles.length - 1; i > -1; i--) {
            if (allFiles[i].name.indexOf(window.config.baseDir(strDir)) === 0) {
                deletedFiles.push(allFiles.splice(i, 1)[0]);
            }
        }

        if (htmlItem === undefined) {
            if (strDir === curDir) {
                location.href = '#';
                goTo(-1);
            }
        } else {
            htmlItem.parentNode.removeChild(htmlItem);
        }

        return deletedFiles;
    }

    function replaceFolder(strDir, strName, disabled) {
        var replacedFiles = [];
        var addedFiles = [];
        var parts = strDir.split('/');

        if (parts.length > 0) {
            var strOldName = parts.pop();

            if (typeof strName === 'boolean') {
                disabled = strName;
                strName = strOldName;
            }

            parts.push(strName);
            disabled = disabled || false;

            for (var i = 0; i < allFiles.length; i++) {
                if (allFiles[i].name.indexOf(window.config.baseDir(strDir)) === 0) {
                    replacedFiles.push({
                        'name': allFiles[i].name,
                        'blob': allFiles[i].blob,
                        'disabled': allFiles[i].disabled
                    });

                    var newFilename = window.config.baseDir(parts.join('/')) + allFiles[i].name.split('/').pop();

                    addedFiles.push(newFilename);
                    allFiles[i].name = newFilename;
                    allFiles[i].disabled = disabled;
                }
            }

            if (strDir === curDir) {
                location.href = '#';
                goTo(-1);
            } else {
                showFileList();
            }
        }

        return [replacedFiles, addedFiles];
    }

    function goTo(path, callback) {
        var parts, folderName, section;

        if (typeof path === 'number') {
            if (path === -1) {
                parts = curDir.split('/');
                parts.splice(parts.length - 1, 1);

                folderName = parts.length > 0 ? parts[parts.length - 1] : '';
                curDir = parts.join('/');
            } else if (path === 0) {
                parts = [];
                folderName = '';
                curDir = '';

                if (document.body.dataset.devices === undefined) {
                    window.close();
                }
            }
        } else {
            curDir = path;

            parts = curDir.split('/');
            folderName = parts.length > 0 ? parts[parts.length - 1] : '';
        }

        if ((window.config.isSimulator && parts.length) || (allCards.length === 0 && parts.length > 1) || (allCards.length > 0 && parts.length > 0)) {
            var selector = '[name="side"]:not(.current):not(.left-to-current)';

            section = document.querySelector(selector);
            fileList = document.querySelector(selector + ' .files');

            window.config.title = folderName;

            files.show();

            document.querySelector('.current, .left-to-current').className = 'right';
            section.className = 'left-to-current current';

            if (callback !== undefined) {
                callback();
            }

        } else if((window.config.isSimulator && !parts.length) || (allCards.length === 0 && parts.length === 1) || (allCards.length > 0 && parts.length === 0)) {
            section = document.querySelector('section[data-position="current"]');

            document.querySelector('.current, .left-to-current').className = 'right';
            section.className = 'current';

            if (callback !== undefined) {
                callback();
            }

            if (!document.querySelector('#back').classList.contains('folder') && !window.config.isActivity) {
                document.querySelector('#back').style.visibility = 'hidden';
            } else {
                document.querySelector('#back').style.display = 'none';
                document.querySelector('#close').style.display = 'block';
            }

            fileList = document.querySelector('section[data-position="current"] .files');

            window.config.title = window.config.app;

            files.show();
        }

        if (curDir.length > 0 || window.config.isSimulator) {
            window.config.toolbar = [section.querySelector('ul.files').childNodes.length, 'items'];
        } else {
            window.config.toolbar = [section.querySelector('ul.files').childNodes.length, 'devices'];
        }
    }

    function isFile(strName) {
        for (var i = 0; i < allFiles.length; i++) {
            if (allFiles[i].name === strName) {
                return true;
            }
        }

        return false;
    }

    function hasFiles(strPath) {
        for (var i = 0; i < allFiles.length; i++) {
            if (allFiles[i].name.indexOf(window.config.baseDir(strPath)) === 0) {
                return true;
            }
        }

        return false;
    }

    if (document.querySelector('#back')) {
        document.querySelector('#back').addEventListener('click', function () {
            goTo(-1);
        });
    }

    if (window.config.isActivity) {
        document.querySelector('#close').onclick = function (e) {
            if (window.activity) {
                window.activity.postError('Activity cancelled');
                window.activity = null;
            }
        };
    }

    document.body.addEventListener('touchmove', function (e) {
        var difX = Math.abs(e.touches[0].clientX - touchClientX);
        var difY = Math.abs(e.touches[0].clientY - touchClientY);

        if (touchTimer > -1 && (difX > 10 || difY > 10)) {
            window.clearTimeout(touchTimer);
            touchTimer = -1;

            e.stopPropagation();
        }
    });

    document.body.addEventListener('touchend', function (e) {
        if (touchTimer > -1) {
            window.clearTimeout(touchTimer);
            touchTimer = -1;

            e.preventDefault();
        }
    });

    return {
        get all() {
            return allFiles;
        },
        get devices() {
            return allCards;
        },
        get path() {
            return curDir;
        },
        set path(strPath) {
            curDir = strPath;
        },
        get isExecuting() {
            if ('state' in document.querySelector('#refresh').dataset) {
                return document.querySelector('#refresh').dataset.state === 'executing';
            }

            return false;
        },
        set isExecuting(state) {
            if (state) {
                var exec = !this.isExecuting;

                document.querySelector('#refresh').dataset.state = 'executing';

                if (exec) {
                    executeTasks();
                }

            } else {
                document.querySelector('#refresh').dataset.state = '';
            }

            return state;
        },
        'call': callBack,
        'card': pushCard,
        'cacheCard': cacheCard,
        'updateCard': setCard,
        'change': changeFileName,
        'delete': deleteFile,
        'isFile': isFile,
        'hasFiles': hasFiles,
        'go': goTo,
        'folder': getFolderName,
        'preload': preloadFileList,
        'loaded': loadedFileList,
        'push': pushFile,
        'replace': replaceFile,
        'reset': clearFileList,
        'set': setFileList,
        'show': showFileList,
        'task': addTask
    };
})();

var errorHandler = function (error) {
    switch (error.name) {
        case 'SecurityError':
            alert(_('app-needs-permissions'));
            window.close();
            break;
    }
};
