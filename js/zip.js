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
	var worker = new Worker();
		
	function init() {
		setup();
		
		load();
	}
	
	function setup() {
		var section = $('article > section');
		
		var ul = element('ul');
		ul.id = 'files';
		
		section.appendChild(ul);
	}

	function load() {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			worker.postMessage(e.target.result, [e.target.result]);
		};
		
		reader.readAsArrayBuffer(activityData.blob);
	}
	
	worker.onmessage = function (e) {
		var files = e.data;
		
		files.forEach(function (file) {
			var li = element('li');
			li.textContent = file;
			$('#files').appendChild(li);
		});
	};
	
	init();

} (window, document, undefined);
