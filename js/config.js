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
	var localStorage = window.localStorage;
	localStorage.dateFormat = localStorage.dateFormat || 'dd/mm/yyyy hh:MM:ss TT';

	function refreshToolbar() {
		var container = (document.querySelector('.current') ? document.querySelector('.current') : document.querySelector('[data-position="current"]'));
		window.config.toolbar = [container.querySelector('ul.files').childNodes.length, 'items'];
	}

	var isSimulator = navigator.getDeviceStorages('sdcard').length === 1 && !navigator.getDeviceStorages('sdcard')[0].storageName.length;

	window.config = (function () {
		var titleText = '';
		var appName = '';

		return {
			get app() {
				return appName;
			},
			set app(newApp) {
				appName = newApp;
				this.title = newApp;
			},
			get title() {
				return titleText;
			},
			set title(newTitle) {
				titleText = newTitle;
				document.getElementById('folder').textContent = newTitle;
			},
			set toolbar(value) {
				if (typeof value === 'string') {
					document.body.dataset.loading = 'true';

					document.getElementById('footer-label').textContent = _(value);
				} else if (value.length === 2) {
					document.body.dataset.loading = 'false';

					document.getElementById('footer-label').textContent = _(value[1], {n: value[0]});
				}
			},
			get isActivity() {
				return this.activity.length > 0;
			},
			'activity': '',
			'refreshToolbar': refreshToolbar,
			'isSimulator': isSimulator,
			'baseDir': function (dir, excludePre) {
				if (isSimulator) {
					if (dir.length) {
						return dir + '/';
					}
				} else {
					return (!excludePre ? '/' : '') + dir + '/';
				}

				return '';
			}
		};
	})();
}(window, document);
