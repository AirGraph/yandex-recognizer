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

1. Install yandex-recognizer: npm install yandex-recognizer --save
2. Add require to your app like this: var yandex = require('yandex-recognizer');
3. Create a service: var service = yandex.Recognizer({config});
4. To connect service to your app: service.connect();
5. In onConnect(sessionId, code) method you will receive session Id and
session code values and here you will send suond data: service.send(db, fileSize, sbLength);
* db (typeof Buffer) - your sound file data;
* fileSile (typeof Number) - length of your db.
* sbLength (typeof Number) - length of sample buffer.
6. In onResult(text, uttr, merge, words) method you will receive
recognized text and any other data.
7. In onError(errMsg) method you will receive error massages.
8. Your {config} object must define 4 properties:
* onConnect: function(sessionId, code);
* onResult: function(text, uttr, merge, words);
* onError: function(errMsg);
* apikey: 'YOUR-OWN-API-KEY'
* All other properties will be set by default. See source code.

## Next Steps

 * [yandex-recognizer documentation](https://github.com/AirGraph/yandex-recognizer)
 * [Star us on GitHub](https://github.com/AirGraph/yandex-recognizer)
