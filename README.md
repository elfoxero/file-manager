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

[View the complete list](blob/master/FILETYPES.md)

For more information about Web Activities, please visit [https://developer.mozilla.org/en-US/docs/Web/API/Web_Activities](https://developer.mozilla.org/en-US/docs/Web/API/Web_Activities).

**Resources**

This project is open source under GPL license.
Uses a variant of [Building Blocks](http://buildingfirefoxos.com/) library and icon theme from [Numix Circle](https://github.com/numixproject/numix-icon-theme-circle).

[Available in Firefox Marketplace](https://marketplace.firefox.com/app/file-manager)
