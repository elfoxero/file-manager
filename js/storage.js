window.storage = (function () {
	var SDCARD = 'sdcard';
	var storages = navigator.getDeviceStorages(SDCARD);
	var curStorage;
	var storage = 0;
	
	var files = window.files || false;
	
	if (storages.length === 1) {
		curStorage = storages[0];
		
		if (files) {
			files.path = curStorage.storageName;
		}
	} else if (storages.length > 1) {
		curStorage = null;
		
		if (files) {
			files.path = '';
		}		
	}
	/*
	if (curStorage) {
		var request = curStorage.usedSpace();
		
		request.onsuccess = function () {
			var loaded = document.getElementById('loading-progress');
			var loadedBar = document.getElementById('loading-bar');
			var max = this.result;
			var min = parseInt(max * 0.03);
			
			loadedBar.className = 'fade-in';
			loaded.max = min + max;
			
			var icons = new Image();
			
			icons.onload = (function (value) {
				return function () {
					loaded.value = value;
					loadFiles();
				};				
			})(min);
			
			icons.src = '../images/icons.png';
		};
		
		request.onerror = function () {
			//
		};
	}*/
	
	function loadFiles() {
		if (files) {
			files.reset();
		}
		
		if (curStorage) {
			var cursor = curStorage.enumerate('');

			cursor.onsuccess = function () {
				if (this.result) {
					if (files) {
						files.push({'name': this.result.name, 'blob': this.result, 'disabled': false});
					}
					
					//document.getElementById('loaded').value += this.result.size;
					window.utils.preload.value += this.result.size;

					this.continue();
				} else {
					if (files) {
						files.show();
						
						/*if (preloading) {
							window.setTimeout(function () {
								//document.getElementById('loading').className = 'fade-out';
								window.utils.preload.complete();
							}, 100);
							
							preloading = false;
						}*/
					}
				}
			};
		} else {
			storage = 0;
			
			readStorage();
		}
	}
	
	function readStorage() {
		if (storage < storages.length) {
			var iStorage = storages[storage++];
			var request = iStorage.freeSpace();
			
			request.onsuccess = function () {
				if (files) {
					files.card({'name': iStorage.storageName, 'space': this.result});
				}
				readStorage();
			};
			
			request.onerror = function () {
				readStorage();
			};
		} else {
			if (files) {
				files.show();
			}
		}
	}
	
	function setStorage(name) {
		for (var i = 0; i < storages.length; i++) {
			if (storages[i].storageName === name) {
				curStorage = storages[i];
				loadFiles();
				break;
			}
		}
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
		'load': loadFiles,
		'get': getFile,
		'set': setStorage,
		'used': usedSpace
	};
})();
