;+function (window, document, undefined) {
	var localStorage = window.localStorage;
	localStorage.dateFormat = localStorage.dateFormat || 'dd/mm/yyyy hh:MM:ss TT';
	localStorage.openUnknown = localStorage.openUnknown || 'true';
		
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
			get isActivity() {
				return this.activity.length > 0;
			},
			'activity': ''
		};
	})();
}(window, document);