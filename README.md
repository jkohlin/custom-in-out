# custom-in-out
This is an extension for [Spicetify-cli](https://github.com/khanhas/spicetify-cli). It lets you set your own custom in- and out-points for songs in your playlist. 
This way you can skip long boring intros and jump to next track before the song is over to skip boring outros. 
![image](https://user-images.githubusercontent.com/4112881/114616068-b92a6680-9ca6-11eb-851f-fd80acee29d3.png)

## Installation
1. Follow the [installation instructions for Spicetify-cli](https://github.com/khanhas/spicetify-cli/wiki/Installation)
2. Download skip.mjs from this repo to the [extensions folder](https://github.com/khanhas/spicetify-cli/wiki/Extensions) of Spicetify 
3. Open a terminal and initialize the extension `spicetify config extensions skip.mjs`
4. Apply the extension to restart Spotify `spicetify apply`

## Usage
### Scrub 5 seconds
To scrub backwards or forwards in Spotify Press Alt + Arrow keys (left/right)
### Set custom in-point or out-point
While playing, press __Shift + I__ to set the in-point or right-click on the progressbar and select __Set in__
While playing, press __Shift + O__ to set the out-point or right-click on the progressbar and select __Set out__
To reset in and out points, right-click on the progressbar and select __Reset__

## Known issues
This is a first draft and is not tested thoroughly. 
One issue that I have found is that sometimes multiple tracks are skipped when using custom out-points.

## Uninstallation
Simply remove the file _skip.mjs_ from the extensions folder and run `spicetify apply`
