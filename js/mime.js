	var MIME = [
	{
		'mime': 'image/*',
		'pattern': '^image\/.+',
		'extensions': ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
		'class': 'image'
	},
	{
		'mime': 'audio/*',
		'pattern': '^audio\/.+',
		'extensions': ['mp3', 'ogg', 'oga', 'webma', 'opus', 'flac', 'alac', 'wav', 'speex', 'm4a'],
		'class': 'audio'
	},
	{
		'mime': 'video/*',
		'pattern': '^video\/.+',
		'extensions': ['mp4', '3gp', 'ogv', 'webm', 'mkv', 'avi', 'm4v'],
		'class': 'video'
	},
	{
		'mime': 'application/pdf',
		'pattern': '.+\/pdf$',
		'extensions': ['pdf'],
		'class': 'pdf'
	},
	{
		'mime': 'application/zip',
		'pattern': '.+\/(x\-)?zip',
		'extensions': ['zip'],
		'class': 'zip'
	},
	{
		'mime': 'application/epub+zip',
		'pattern': '.+\/epub',
		'extensions': ['epub'],
		'class': 'ebook'
	},
	{
		'mime': 'application/x-tar',
		'pattern': '.+\/(x\-)?tar',
		'extensions': ['tar'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-bzip',
		'pattern': '.+\/(x\-)?gz',
		'extensions': ['bz2', 'tar.bz2', 'tbz2', 'tb2'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-xz',
		'pattern': '.+\/(x\-)?xz',
		'extensions': ['xz'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-compressed',
		'pattern': '.+\/(x\-)?gz',
		'extensions': ['gz', 'tar.gz', 'tgz'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-7z-compressed',
		'pattern': '.+\/(x\-)?7z',
		'extensions': ['7z'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-rar-compressed',
		'pattern': '.+\/(x\-)?rar',
		'extensions': ['rar'],
		'class': 'zip'
	},
	{
		'mime': 'application/x-web-app-manifest+json',
		'pattern': '^application+\/.*app.manifest.*$',
		'extensions': ['webapp'],
		'class': 'developer'
	},
	{
		'mime': 'text/plain',
		'pattern': '^text\/plain$',
	    'extensions': ['txt', 'text', 'log', 'ini'],
		'class': 'text'
	},
	{
		'mime': 'text/html',
		'pattern': '^text\/html$',
		'extensions': ['htm', 'html', 'xhtml'],
		'class': 'html'
	},
	{
		'mime': 'text/javascript',
		'pattern': 'javascript$',
		'extensions': ['js', 'json'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-python',
		'pattern': 'python$',
		'extensions': ['py'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-python',
		'pattern': 'sh$',
	 	'extensions': ['sh', 'bash', 'bashrc'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-java-source',
		'pattern': 'java$',
	 	'extensions': ['java'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-csrc',
		'pattern': '^text\/x-csrc$',
	 	'extensions': ['c'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-c++src',
		'pattern': '^text\/x-c++src',
		'extensions': ['cc', 'cpp', 'c++'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-php',
		'pattern': 'x-php',
		'extensions': ['php', 'php4', 'php5'],
		'class': 'developer'
	},
	{
		'mime': 'text/x-ruby',
		'pattern': 'x-ruby',
		'extensions': ['rb', 'ruby'],
		'class': 'developer'
	},
	{
		'mime': 'text/css',
		'pattern': '^text\/css$',
		'extensions': ['css'],
		'class': 'css'
	},
	{
		'mime': 'text/csv',
		'pattern': '^text\/csv$',
		'extensions': ['csv'],
		'class': 'csv'
	},
	{
		'mime': 'text/csv-schema',
		'pattern': '^text\/csv-schema$',
		'extensions': ['csv-schema'],
		'class': 'csv-schema'
	},
	{
		'mime': 'text/rtf',
		'pattern': '^text/rtf$',
		'extensions': ['rtf'],
		'class': 'word'
	},
	{
		'mime': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'pattern': '.*officedocument\.wordprocessingml.*',
		'extensions': ['doc', 'docx'],
		'class': 'word'
	},
	{
		'mime': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'pattern': '.*officedocument\.spreadsheetml.*',
		'extensions': ['xls', 'xlsx'],
		'class': 'excel'
	},
	{
		'mime': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'pattern': '.*officedocument\.presentationml.*',
		'extensions': ['ppt', 'pptx'],
		'class': 'powerpoint'
	},
	{
		'mime': 'application/vnd.oasis.opendocument.text',
		'pattern': '.*opendocument\.text.*',
		'extensions': ['odt'],
		'class': 'word'
	},
	{
		'mime': 'application/vnd.oasis.opendocument.spreadsheet',
		'pattern': '.*opendocument\.spreadsheet.*',
		'extensions': ['ods'],
		'class': 'excel'
	},
	{
		'mime': 'application/vnd.oasis.opendocument.presentation',
		'pattern': '.*opendocument\.presentation.*',
		'extensions': ['odp'],
		'class': 'powerpoint'
	},
];
