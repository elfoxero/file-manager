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

window.storage = (function () {
	var SDCARD = 'sdcard';
	var storages = navigator.getDeviceStorages(SDCARD);
	var curStorage;
	var isSimulator = navigator.getDeviceStorages('sdcard').length === 1 && !navigator.getDeviceStorages('sdcard')[0].storageName.length;

	var files = window.files || false;

	[].forEach.call(storages, function (storage) {
		if ('addEventListener' in storage) {
			storage.addEventListener('change', function (e) {
				if (e.reason === 'unavailable' || e.reason === 'shared') {
					if (e.reason === 'unavailable') {
						alert(_('insert-card'));
					} else if (e.reason === 'shared') {
						alert(_('disconnect-usb'));
					}

					if (document.body.dataset.devices === 'true') {
						if (files) {
							files.go(0);

							if (document.getElementById('refresh')) {
								document.getElementById('refresh').click();
							}
						}
					} else {
						window.close();
					}
				}
			});
		}
	});

	if (isSimulator) {
		curStorage = storages[0];

		if (files) {
			files.path = '';
		}
	} else if (storages.length === 1) {
		curStorage = storages[0];

		if (files) {
			files.path = curStorage.storageName;
		}
	} else if (storages.length > 1) {
		curStorage = null;

		if (files) {
			files.path = '';
		}

		document.querySelector('#index section[data-type="list"]').classList.add('devices');
		document.body.dataset.devices = 'true';
	}

	function loadFiles(inDevice) {
		if (curStorage) {
			if (!inDevice && config) {
				config.toolbar = 'loading-files';
			}

			var request = curStorage.available();

			request.onsuccess = function () {
				if (request.result === 'available') {
					refreshFiles(inDevice);
				} else {
					if (request.result === 'shared') {
						alert(_('disconnect-usb'));
					} else {
						alert(_('insert-card'));
					}

					window.close();
				}
			};

			request.onerror = function () {
				errorHandler(request.error);
			};

		} else {
			readStorage(0);
		}
	}

	function refreshFiles(callback) {
		if (files.path.length > 0 || isSimulator) {
			var cursor = curStorage.enumerate('');

			cursor.onsuccess = function () {
				if (this.result) {
					if (files) {
						files.push({'name': this.result.name, 'blob': this.result, 'disabled': false});
					}

					this.continue();
				} else {
					if (files) {
						files.cacheCard(curStorage.storageName);
						files.show();

						if (callback) {
							window.utils.preload.complete();
						}

						var container = (document.querySelector('.current') ? document.querySelector('.current') : document.querySelector('[data-position="current"]'));

						config && (config.toolbar = [container.querySelector('ul.files').childNodes.length, 'items']);
					}
				}
			};
		} else {
			refreshStorage(0, callback);
		}
	}

	function readStorage(iStorage) {
		if (iStorage < storages.length) {
			var storage = storages[iStorage++];
			var request = storage.available();

			request.onsuccess = function () {
				if (files) {
					files.card({'name': storage.storageName, 'space': 0, 'status': this.result});
				}
				readStorage(iStorage);
			};

			request.onerror = function () {
				errorHandler(request.error);
			};
		} else {
			if (files) {
				files.show();

				[].forEach.call(storages, function (storage, index) {
					var request = storage.freeSpace();

					request.onsuccess = function () {
						files.updateCard(index, {space: request.result});
					};

					request.onerror = function () {
						errorHandler(request.error);
					};
				});
			}
		}
	}

	function refreshStorage(iStorage, callback) {
		if (iStorage < storages.length) {
			var storage = storages[iStorage];
			var request = storage.available();

			request.onsuccess = function () {
				if (this.result === 'available') {
					storage.freeSpace().onsuccess = function (e) {
						if (typeof callback === 'function') {
							callback.call(storage, iStorage, e.target.result);
						} else {
							console.log('callback', callback);
						}

						refreshStorage(iStorage + 1, callback);
					};
				} else {
					if (typeof callback === 'function') {
						callback.call(storage, iStorage, this.result);
					}
					
					refreshStorage(iStorage + 1, callback);
				}

			};

			request.onerror = function () {
				errorHandler(request.error);
			};
		}
	}

	function setStorage(name) {
		for (var i = 0; i < storages.length; i++) {
			if (storages[i].storageName === name) {
				curStorage = storages[i];
				break;
			}
		}
        
		!curStorage && (curStorage = navigator.getDeviceStorage(name));
	}

	function isStorageLoaded(name) {
		return (loaded.indexOf(name) > -1);
	}

	function usedSpace(onsuccess, onerror) {
		var request = curStorage.usedSpace();

		if (typeof onsuccess === 'boolean') {
			return request;
		} else {
			if (typeof onsuccess === 'function') request.onsuccess = onsuccess;
			if (typeof onerror === 'function') request.onerror = onerror;
		}
	}

	function deleteFile(filename, onsuccess, onerror) {
		var request = curStorage.delete(filename);

		if (typeof onsuccess === 'boolean') {
			return request;
		} else {
			request.onsuccess = onsuccess;
			request.onerror = onerror;
		}
	}

	function addNamedFile(blob, filename, onsuccess, onerror) {
		var request = curStorage.addNamed(blob, filename);

		if (typeof onsuccess === 'boolean') {
			return request;
		} else {
			request.onsuccess = onsuccess;
			request.onerror = onerror;
		}
	}

	function getFile(filename, onsuccess, onerror) {
		var request = curStorage.get(filename);

		if (typeof onsuccess === 'boolean') {
			return request;
		} else {
			request.onsuccess = onsuccess;
			request.onerror = onerror;
		}
	}

	return {
		get name () {
			return curStorage.storageName;
		},
		'create': addNamedFile,
		'delete': deleteFile,
		'isLoaded': isStorageLoaded,
		'load': loadFiles,
		'refresh': refreshFiles,
		'get': getFile,
		'set': setStorage,
		'used': usedSpace
	};
})();
