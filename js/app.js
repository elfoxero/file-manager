;-function(window, document, undefined) {
	var _ = window.navigator.mozL10n.get;
	window.utils = window.utils || {};
	
	document.querySelector('#file-action').addEventListener('click', function (event) {
		if (event.target.tagName === 'BUTTON') {
			this.className = 'fade-out';
		}
	});
	
	document.querySelector('button[data-action="O"]').addEventListener('click', function (event) {
		files.call(function (curFile, curDir) {
			switch (curFile.mime) {
				case 'application/pdf':
					var reader = new FileReader();
                                        
					reader.onload = function (event) {
						var activity = new MozActivity({
							name: 'view',
							data: {
								type: 'application/pdf',
								url: reader.result
							}
						});
						
						activity.onerror = function() {
							console.warn('View activity error: ' + activity.error.name);
						};

						activity.onsuccess = function(e) {
							//
						};
					};
					
					reader.onerror = function () {
						console.warn('Reader error');
					};
					
					reader.readAsDataURL(curFile.blob);
					
					break;
					
				case 'video/*':
					var activity = new MozActivity({
						name: 'view',
						data: {
							type: curFile.blob.type,
							allowSave: false,
							blob: curFile.blob,
							title: curFile.name
						}
					});
					
					activity.onerror = function() {
						console.warn('Activity error: ' + activity.error.name);
					};

					activity.onsuccess = function(e) {
						//
					};
					
					break;
				
					
				case 'audio/*':
					var activity = new MozActivity({
						name: 'open',
						data: {
							type: curFile.blob.type,
							allowSave: false,
							blob: curFile.blob
						}
					});
					
					activity.onerror = function() {
						console.warn('Activity error: ' + activity.error.name);
					};

					activity.onsuccess = function(e) {
						//
					};
					
					break;
				
				case 'image/*':
					var activity = new MozActivity({
						name: 'open',
						data: {
							type: curFile.blob.type,
							filename: curFile.name,
							blob: curFile.blob
						}
					});
					
					activity.onerror = function(e) {
						console.warn('Activity error: ' + activity.error.name);
					};

					activity.onsuccess = function(e) {
						//
					};
					
					break;
				
				case 'text/plain':
				case 'text/javascript':
				case 'text/html':
				case 'text/css':
				case 'application/x-web-app-manifest+json':
					var type = 'text/plain';
					
					if (curFile.blob.type) {
						type = curFile.blob.type;
					}
					
					var activity = new MozActivity({
						name: 'open',
						data: {
							'type': type,
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
					//
			}
		});
	});
	
	document.querySelector('button[data-action="X"]').addEventListener('click', function (event) {
		files.call(function (curFile, curDir, curItem) {
			if (confirm(_('sure-delete') + curFile.name + '?')) {
				files.task('delete', {}, {}, function () {
					utils.status.show('{{' + curFile.name + '}} ' + _('deleted'));
				}, function () {
					utils.status.show(_('unable-delete') + ' {{' + curFile.name + '}}');
				});
			}
		});
	});
	
	document.querySelector('button[data-action="R"]').addEventListener('click', function (event) {
		files.call(function (curFile, current) {
			var newName = prompt(_('new-filename'), curFile.name) || '';
			newName = newName.trim();
		
			if (newName.length > 0 && newName.toLowerCase() !== curFile.name.toLowerCase()) {
				var oldName = curFile.blob.name;
				
				files.task('rename', {}, {'name': newName}, function () {
					utils.status.show(_('filename-changed'));
				}, function () {
					utils.status.show(_('unable-filename'));
				});
			}
		});
	});
	
	document.querySelector('button[data-action="D"]').addEventListener('click', function (event) {
		files.call(function (curFile, current) {
			var lastModified = curFile.blob.lastModifiedDate;
			var day = lastModified.getDate();
			var month = lastModified.getMonth() + 1;
			var year = lastModified.getFullYear();
			
			document.querySelector('#file-name').innerHTML = '';
			document.querySelector('#file-name').appendChild(document.createTextNode(curFile.name));
			document.querySelector('#file-size').innerHTML = utils.files.size(curFile.blob.size);
			document.querySelector('#file-modified').innerHTML = day + '/' + month + '/' + year;
			document.querySelector('#file-type').innerHTML = curFile.blob.type;
			document.querySelector('#details').className = 'fade-in';			
		});
	});
	
	document.querySelector('#details button').onclick = function () {
		document.querySelector('#details').className = 'fade-out';
	};
	
	document.querySelector('button[data-action="C"]').addEventListener('click', function (event) {
		files.call(function (curFile, curDir) {
			var activity = new MozActivity({
				name: 'pick-folder',
				data: {
					action: 'copy'
				}
			});
			
			activity.onerror = function(e) {
				console.warn('Activity error: ' + activity.error.name);
			};

			activity.onsuccess = function(e) {
				var path = e.target.result.path;
				var filename;
				
				if (path === curDir) {
					var name = prompt('name-to-copy') || '';
					name = name.trim();
					
					if (name.length === 0) return;
					
					filename = '/' + path + '/' + name;
				} else {
					filename = '/' + path + '/' + curFile.name;
				}
				
				if (files.isFile(filename)) {
					if (confirm(_('replace-file'))) {
						files.task('copy', {}, {'replace': true, 'name': filename, 'dir': path}, function () {
							utils.status.show(_('file-copied'));
						}, function () {
							utils.status.show(_('unable-copy'));
						});
					}
				} else {
					files.task('copy', {}, {'replace': false, 'name': filename, 'dir': path}, function () {
						utils.status.show(_('file-copied'));
					}, function () {
						utils.status.show(_('unable-copy'));
					});
				}
			};
		});
	});
	
	document.querySelector('button[data-action="M"]').addEventListener('click', function (event) {
		files.call(function (curFile, curDir) {
			var activity = new MozActivity({
				name: 'pick-folder',
				data: {
					action: 'move'
				}
			});
			
			activity.onerror = function(e) {
				console.warn('Activity error: ' + activity.error.name);
			};

			activity.onsuccess = function(e) {
				var path = e.target.result.path;
				var newName = '/' + path + '/' + curFile.name;
				var oldName = curFile.blob.name;
				
				if (path === curDir) {
					utils.status.show(_('source-target-same'));
				} else {
					if (files.isFile(newName)) {
						if (confirm(_('replace-file'))) {
							files.task('move', {}, {'replace': true, 'name': newName, 'dir': path}, function () {
								utils.status.show(_('file-moved'));
							}, function () {
								utils.status.show(_('unable-move'));
							});
						}
					} else {
						files.task('move', {}, {'replace': false, 'name': newName, 'dir': path}, function () {
							utils.status.show(_('file-moved'));
						}, function () {
							utils.status.show(_('unable-move'));
						});
					}
				}
			};
		});
	});
	
	document.querySelector('button[data-action="S"]').addEventListener('click', function (event) {
		files.call(function (curFile, curDir) {
			var activity = new MozActivity({
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

			activity.onsuccess = function(e) {
				//
			};
		});
	});
	
	document.querySelector('#refresh').addEventListener('click', function (e) {
		storage.load();
	});
	
	document.querySelector('#new-folder').addEventListener('click', function (e) {
		files.call(function (curFile, curDir) {
			var folderName = prompt(_('name-new-folder')) || '';
			
			if (folderName.length > 0) {
				var blob = new Blob(['']);
				var filename = '/' + curDir + '/' + folderName + '/.empty';
				
				storage.create(blob, filename, function (e) {
					files.push({'name': '.empty', 'blob': blob});
					files.show();
					
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
				var name = '/' + curDir + '/' + filename;
				
				storage.create(blob, name, function (e) {
					files.push({'name': filename, 'blob': blob, 'preview': false});
					
					var activity = new MozActivity({
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
	
	document.querySelector('#delete-folder').addEventListener('click', function (e) {
		files.call(function (curFile, curDir) {
			if (confirm(_('sure-delete-folder'))) {
				files.task('delete', {type: 'folder'}, {}, function () {
					utils.status.show(_('folder-deleted'));
				}, function () {
					utils.status.show(_('unable-delete'));
				});
			}
		});
	});
	
	window.utils.actions = (function () {
		var available = ['V', 'O'];
		
		function showList(filename, actions) {
			document.querySelector('#file-action header').innerHTML = '';
			document.querySelector('#file-action header').appendChild(document.createTextNode(filename));
			
			for (var i = 0; i < available.length; i++) {
				var expected = available[i];
				
				if (actions.allowed.indexOf(expected) > -1) {
					document.querySelector('#file-action button[data-action="' + expected + '"]').style.display = 'inline-block';

				} else {
					document.querySelector('#file-action button[data-action="' + expected + '"]').style.display = 'none';
				}
			}
			
			document.querySelector('#file-action').className = 'fade-in';
		}
		
		return {
			'show': showList
		};
	})();
}(window, document);
