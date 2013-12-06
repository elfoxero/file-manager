;+function (window, document, undefined) {
	var _ = window.navigator.mozL10n.get;
	window.isActivity = 'folder';
		
	window.navigator.mozSetMessageHandler('activity', function(request) {
		activity = request;
		
		var option = activity.source;
		var data = option.data;
		var doneBtns = document.getElementsByName('done');
					
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
}(window, document);