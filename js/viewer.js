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
	var _ = window.document.webL10n.get;

	window.activity = null;
	window.activityData = null;

	navigator.setMessageHandler = navigator.setMessageHandler || navigator.mozSetMessageHandler;
	
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
	
	window.element = function (tag, attrs) {
		var elem = document.createElement(tag);

		if (attrs) {
			if (typeof attrs === 'string') {
				elem.textContent = attrs;
			} else if (typeof attrs === 'object') {
				Object.keys(attrs).forEach(function (attr) {
					if (attr === 'text') {
						elem.textContent = attrs[attr];
					} else {
						elem[attr] = attrs[attr];
					}
				});
			}
		}

		return elem;
	};

	navigator.setMessageHandler('activity', function(request) {
		activity = request;
		
		window.activityData = activity.source.data;

		$('#name').textContent = activityData.filename;
		
		if (/text/ .test(activityData.type) || /javascript/ .test(activityData.type)) {
			addCss('../css/text.css');
			
			addJs('../libraries/gibberish-aes.js', function () {
				addJs('../js/storage.js', function () {
					addJs('../js/text.js');
				});
			});
		} else if (/zip/ .test(activityData.type)) {
			// Include scripts for ZIP Viewer
		}
	});
	
	$('#close').onclick = function (e) {
		if (window.activity) {
			activity.postResult({saved: false});
			activity = null;
		}
	};
} (window, document, undefined);
