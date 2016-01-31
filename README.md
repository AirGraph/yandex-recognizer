# yandex-recognizer
Node JS interface to yandex speech recognition service

## Questions and Bug Reports

* mailing list: Victor.Vazin@gmail.com

## Installation

The recommended way to get started using the yandex-recognizer is
by using the `NPM` (Node Package Manager) to install the dependency in your project.

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
The quick start guide will show you how to setup a simple application
using node.js and yandex-recognizer. Its scope is only how to set up
the yandex-recognizer.

Install yandex-recognizer:
```
npm install yandex-recognizer --save
```
Add require to your app:
```
var yandex = require('yandex-recognizer');
```
Create service:
```
var service = yandex.Recognizer({config});
```
Connect service to your app:
```
service.connect();
```
In onConnect(sessionId, code) method you will send sound data:
```
service.send(db, fileSize, sbLength);

// db (typeof Buffer) - your sound file data;
// fileSile (typeof Number) - length of your db.
// sbLength (typeof Number) - length of sample buffer.
```
In onResult(text, uttr, merge, words) method you will receive recognized text and any other data.
In onError(errMsg) method you will receive error massages.
Your {config} object must define at least 4 properties:
```
onConnect: function(sessionId, code);
onResult: function(text, uttr, merge, words);
onError: function(errMsg);
apikey: 'YOUR-OWN-API-KEY'
```
All other properties will be set by default. See source code.

## Next Steps

 * [yandex-recognizer documentation](https://github.com/AirGraph/yandex-recognizer)
 * [Star us on GitHub](https://github.com/AirGraph/yandex-recognizer)
