# File Manager

File Manager is an app for Firefox OS to explore and manage files from SD card.

**Requirements**

This app requires permissions to access to SD card.

**Features**

- Allows to copy, move, rename and delete files.
- Allows to create, rename and delete folders.
- Opens any file as music, video, text or image.
- Opens PDF files (requires Firefox OS 1.4 or greater).
- Allows to set as wallpaper any image.
- Allows to share any file via bluetooth, email and more.
- Allows to create and edit text plain files.
- Allows to manage any folder making long press on it.

**For developers: integrate your app with File Manager** (requires File Manager 1.0-beta2)

If you have created an app that interacts with some files in SD card, File Manager can use your app to open these files directly.

You just need to add an activity to your manifest file, specifying the file type that your app supports. For example if you want to create a simple SVG image viewer:


```
{
	"activities": {
		"open": {
			"filters": {
				"type": ["image/svg+xml"]
			},
			"disposition": "inline",
			"returnValue": true,
			"href": "/index.html"
		}
	}
}
```

File Manager will send to your app the following data:

```
{
	"type": "image/svg+xml",
	"filename": "/sdcard/image.svg", // For example
	"blob": [object Blob],
	"allowSave": false
}
```


Here is the complete example: [https://gist.github.com/elfoxero/cca6e8496de7412a0b37](https://gist.github.com/elfoxero/cca6e8496de7412a0b37)

Currently, the app supports the following file types:

Description | Extension        | File type
----------- | ---------------- | ------------------
Image       | jpg, jpeg        | image/jpeg
Image       | png              | image/png
Image       | gif              | image/gif
Image       | bmp              | image/bmp
Image       | svg              | image/svg+xml
Audio       | mp3              | audio/mpeg
Audio       | ogg              | audio/ogg
Audio       | wav              | audio/x-wav
Audio       | flac             | audio/x-flac
Video       | webm             | video/webm
Video       | mp4              | video/mp4
Video       | 3gp              | video/3gpp
Video       | ogv              | video/ogg
Video       | mkv              | video/x-matroska
Video       | avi              | video/x-msvideo
Video       | m4v              | video/x-m4v
Archiver    | zip              | application/zip
Archiver    | 7z               | application/x-7z-compressed
Archiver    | rar              | application/x-rar-compressed
Archiver    | tar              | application/x-tar
Archiver    | bz2, tbz2, tb2   | application/x-bzip
Archiver    | xz               | application/x-xz
Archiver    | gz, tgz          | application/x-gzip
Ebook       | epub             | application/epub+zip
Manifest    | webapp           | application/x-web-app-manifest+json
Text        | txt, text, log   | text/plain
Text        | htm, html, xhtml | text/html
Text        | js, json         | text/javascript
Text        | css              | text/css
Text        | py               | text/x-python
Text        | sh, bash, bashrc | text/x-sh
Text        | java             | text/x-java-source
Text        | c                | text/x-csrc
Text        | cc, cpp, c++     | text/x-c++src
Text        | php, phps, phtml | text/x-php
Text        | rb               | text/x-ruby
Text        | csv              | text/csv
Text        | rtf              | text/rtf
Document    | pdf              | application/pdf
Document    | doc, docx        | application/vnd.openxmlformats-officedocument.wordprocessingml.document
Document    | xls, xlsx        | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Document    | ppt, pptx        | application/vnd.openxmlformats-officedocument.presentationml.presentation
Document    | odt              | application/vnd.oasis.opendocument.text
Document    | ods              | application/vnd.oasis.opendocument.spreadsheet
Document    | odp              | application/vnd.oasis.opendocument.presentation

For more information about Web Activities, please visit [https://developer.mozilla.org/en-US/docs/Web/API/Web_Activities](https://developer.mozilla.org/en-US/docs/Web/API/Web_Activities).

**Resources**

This project is open source under GPL license.
Uses a variant of [Building Blocks](http://buildingfirefoxos.com/) library and icon theme from [Numix Circle](https://github.com/numixproject/numix-icon-theme-circle).

[Available in Firefox Marketplace](https://marketplace.firefox.com/app/file-manager)