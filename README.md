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
`config` object must define at least 5 properties:
```
onConnect: function(sessionId, code),
onResult: function(data),
onError: function(e),
onClose: function(e),
apikey: 'YOUR-OWN-YANDEX-API-KEY'

// All other properties will be set by default (see source code for all available).
```
Connect service to your app:
```
service.connect();
```
`onConnect(sessionId, code)` method will launched in case of successfull connect. Here you send sound data for recognition:
```
service.send(db, cbLength);

// db (typeof Buffer) - your sound file data.
// cbLength (typeof Number) - length of chunk buffer.
```
`onResult(data)` method receive recognized text and some other data.

`onError(e)` method receive error massages.

`onClose(e)` method receive close massage.

## Limitations
Input audio file format may be now only: 

* Sample Encoding: 16-bit Signed Integer PCM, Sample Rate: 16000, 1 Channel.

## Next Steps
 * [yandex-recognizer documentation](https://github.com/AirGraph/yandex-recognizer)
 * [example](https://github.com/AirGraph/yandex-recognizer/tree/master/example)
