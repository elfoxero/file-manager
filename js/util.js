window.utils = window.utils || {};

document.byId = function (query) {
	return document.getElementById(query);
};

window.utils.preload = (function(win, doc, undefined) {
	var isBarMode;
	
	function completePreload() {
		var loadingProgress = doc.byId('loading-progress');
		var loading = doc.byId('loading');
		var self = win.utils.preload;
		
		if (isBarMode) {
			loadingProgress.value = loadingProgress.max;
		}
		
		loading.className = 'fadeOut';
		
		loading.addEventListener('animationend', function _animationend() {
			loading.className = '';
			loading.removeEventListener('animationend', _animationend);
		});
		
		if (typeof self.oncomplete === 'function') {
			self.oncomplete.call(self);
		}
	}
	
	function showPreload(iconMode) { // Sólo muestra el cuadro, mas no la barra (si es que está en modeicon)
		isBarMode = iconMode;
		
		var loading = doc.byId('loading');
		var loadingProgress = doc.byId('loading-progress');
		
		if (iconMode) {
			loading.dataset.mode = 'bar';
			loadingProgress.value = 0;
			loadingProgress.max = 1;
			
		} else {
			loading.dataset.mode = 'ring';
			loadingProgress.removeAttribute('value');
			
		}
		
		loading.className = 'shown';
	}
	
	function startPreload() {
		var self = win.utils.preload;
		
		doc.byId('loading-bar').className = 'fade-in';
		
		if (typeof self.onstart === 'function') {
			self.onstart.call(self);
		}
	}
	
	return {
		get max() {
			return doc.byId('loading-progress').max;
		},
		set max(val) {
			var loadingProgress = doc.byId('loading-progress');
			var defaultMax = loadingProgress.max;
			
			loadingProgress.max = val;
			
			if (defaultMax === 1) {
				startPreload();
			}
		},
		get value() {
			return doc.byId('loading-progress').value;
		},
		set value(val) {
			var loadingProgress = doc.byId('loading-progress');
			
			loadingProgress.value = val;
			
			if (loadingProgress.value === loadingProgress.max) {
				completePreload();
			}
		},
		'complete': completePreload,
		'show': showPreload,
		'start': startPreload,
		'oncomplete': null,
		'onstart': null
	};
})(window, document);