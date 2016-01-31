# yandex-recognizer
Node JS interface to yandex speech recognition service

## Questions and Bug Reports
* mailing list: Victor.Vazin@gmail.com

## Installation
Install the yandex-recognizer and it's dependencies by executing
the following `NPM` command.
```
npm install yandex-recognizer --save
```
## Troubleshooting
The yandex-recognizer depends on several other packages. These are.

* node-uuid
* websocket

Ensure, that your user has write permission to wherever the node modules
are being installed.

QuickStart
==========
Add require to your app:
```
var yandex = require('yandex-recognizer');
```
Create service:
```
var service = yandex.Recognizer({config});
```
`config` object must define at least 4 properties:
```
onConnect: function(sessionId, code),
onResult: function(text, uttr, merge, words),
onError: function(errMsg),
apikey: 'YOUR-OWN-YANDEX-API-KEY'

// All other properties will be set by default (see source code for all available).
```
Connect service to your app:
```
service.connect();
```
`onConnect(sessionId, code)` method will launched in case of successfull connect. Here you send sound data for recognition:
```
service.send(db, fileSize, sbLength);

// db (typeof Buffer) - your sound file data.
// fileSile (typeof Number) - length of your db.
// sbLength (typeof Number) - length of sample buffer.
```
`onResult(text, uttr, merge, words)` method receive recognized text and some other data.

`onError(errMsg)` method receive error massages.

## Limitation
Input sound file format may be: 

* Sample Encoding: 16-bit Signed Integer PCM, Sample Rate: 16000 (`namespace.FORMAT.PCM16` (default))
* Sample Encoding: 16-bit Signed Integer PCM, Sample Rate: 44100 (`namespace.FORMAT.PCM44`)

## Next Steps
 * [yandex-recognizer documentation](https://github.com/AirGraph/yandex-recognizer)
 * [example](https://github.com/AirGraph/yandex-recognizer/tree/master/example)
