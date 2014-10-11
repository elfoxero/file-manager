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
	var activity, size;
	var file;
	var password;
	var _ = window.document.webL10n.get;

	function setFontSize() {
		window.localStorage.fontSize = size.toString();
		document.querySelector('textarea').style.fontSize = size.toString() + 'rem'
	}

	function setWrap() {
		document.querySelector('textarea').wrap = window.localStorage.wrap;
	}

	if (!('fontSize' in window.localStorage)) {
		window.localStorage.fontSize = '2';
		size = 2;
	} else {
		size = parseInt(window.localStorage.fontSize);
	}

	if (!('wrap' in window.localStorage)) {
		window.localStorage.wrap = 'off';
	}

	function setEncryptionIcon() {
		if (password) {
			document.getElementById('encryption').className = 'action-icon lock';
		} else {
			document.getElementById('encryption').className = 'action-icon unlock';
		}
	}

	window.navigator.mozSetMessageHandler('activity', function(request) {
		activity = request;

		var option = activity.source;
		var data = option.data;
		var reader = new FileReader();

		file = data.name;

		document.querySelector('#name').innerHTML = '';
		document.querySelector('#name').appendChild(document.createTextNode(data.filename));

		reader.onload = function (e) {
			var plaintext = e.target.result;
			// OpenSSL encrypted texts start with the base64 encoded string "Salted__"
			if (plaintext.lastIndexOf('U2FsdGVkX1', 0) === 0) {
				password = prompt(_('password')) || null;
				if (password) {
					plaintext = GibberishAES.dec(plaintext, password);
				}
				setEncryptionIcon();
			}
			document.querySelector('textarea').value = plaintext;
		};

		reader.readAsText(data.blob);

		document.querySelector('#close').onclick = function (e) {
			activity.postResult({saved: false});
			activity = null;
		};

	});

	document.querySelector('#more').onclick = function (e) {
		size = Math.min(size + 0.5, 8);
		setFontSize();
	};

	document.querySelector('#less').onclick = function (e) {
		size = Math.max(size - 0.5, 0.5);
		setFontSize();
	};

	document.querySelector('#adjust').onclick = function (e) {
		if (window.localStorage.wrap === 'off') {
			window.localStorage.wrap = '';
		} else {
			window.localStorage.wrap = 'off';
		}
		setWrap();
	};

	document.querySelector('#encryption').onclick = function (e) {
		if (password) {
			password = null;
		} else {
			password = prompt(_('password')) || '';
		}
		setEncryptionIcon();
	}

	document.querySelector('#save').addEventListener('click', function () {
		var parts = file.split('/');

		if (navigator.getDeviceStorages('sdcard').length == 1 && !navigator.getDeviceStorages('sdcard')[0].storageName.length) {
			storage.set('sdcard');
		} else if (parts.length > 1) {
			storage.set(parts[1]);
		} else {
			alert(_('storage-not-found'));
		}

		storage.delete(file, function () {
			var plaintext = document.querySelector('textarea').value;
			if (password) {
				plaintext = GibberishAES.enc(plaintext, password);
			}
			var blob = new Blob([plaintext]);

			storage.create(blob, file, function () {
				activity.postResult({'saved': true, 'file': file, 'blob': blob});
				activity = null;
			}, function () {
				activity.postResult({saved: false});
				activity = null;
			});
		}, function () {
			activity.postResult({saved: false});
			activity = null;
		});

	});

	setFontSize();
	setWrap();

} (window, document, undefined);
