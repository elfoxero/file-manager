;+function (window, document, undefined) {
	var _ = window.navigator.mozL10n.get;
	window.config.activity = 'folder';
		
	window.navigator.mozSetMessageHandler('activity', function(request) {
		var activity = request;
		
		var option = activity.source;
		var data = option.data;
		var doneBtns = document.getElementsByName('done');
		
		window.setTimeout(function () {
			window.config.app = _(data.action + '-to');
		}, 1);
					
		document.querySelector('#close').onclick = function (e) {
			activity.postError('Activity cancelled');
			activity = null;
		};
		
		for (var i = 0; i < doneBtns.length; i++) {
			doneBtns[i].addEventListener('click', function () {
				files.call(function (curFile, curDir) {
					activity.postResult({path: curDir});
					activity = null;
				});
			});			
		}
	});
		
	window.config.app = '';
}(window, document);