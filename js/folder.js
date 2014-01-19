;+function (win, doc, undefined) {
	var _ = win.navigator.mozL10n.get;
	
	function init(data) {
		win.files.path = data.storage;
		win.files.set(data.files);
		win.files.show();
		
		win.setTimeout(function () {
			win.config.app = _(data.action + '-to');
			win.utils.preload.complete();
		}, 1);		
	}
	
	win.config.activity = 'folder';
		
	win.navigator.mozSetMessageHandler('activity', function(request) {
		var activity = request;
		
		var option = activity.source;
		var data = option.data;
		var doneBtns = doc.getElementsByName('done');
		
		if ('files' in data) {
			init(data);
		} // Missing implementation for DeviceStorage API
		
		doc.querySelector('#close').onclick = function (e) {
			activity.postError('Activity cancelled');
			activity = null;
		};
		
		for (var i = 0; i < doneBtns.length; i++) {
			doneBtns[i].addEventListener('click', function () {
				win.files.call(function (curFile, curDir) {
					activity.postResult({path: curDir});
					activity = null;
				});
			});			
		}
	});
	
	win.config.app = '';
	win.utils.preload.show(false);
}(window, document);