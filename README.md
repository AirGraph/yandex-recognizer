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
the yandex-recognizer. For more in depth coverage we encourage reading the tutorials.

1. Install yandex-recognizer: npm install yandex-recognizer --save
2. Add require to your app like this: var yandex = require('yandex-recognizer');
3. Create a service: var service = yandex.Recognizer({config});
4. To connect service to your app: service.connect();
5. In onConnect(sessionId, code) method (see config) you will receive session Id and
session code values and here you will send suond data: service.send(db, fileSize);
* db (typeof Buffer) - your sound file data;
* fileSile (typeof Number) - length of your db.
6. In onResult(text, uttr, merge, words) method (see config) you will receive
recognized text and any other data.
7. In onError(errMsg) method (see config) you will receive error massages.
8. In config object you must define 4 proprties:
* onConnect: function(sessionId, code);
* onResult: function(text, uttr, merge, words);
* onError: function(errMsg);
* apikey: 'YOUR-OWN-API-KEY'
All other properties will be set by default. If you need to set additioanl available
properties of config for your app, please, read the tutorial.

## Next Steps

 * [yandex-recognizer documentation](https://github.com/AirGraph/yandex-recognizer)
 * [Star us on GitHub](https://github.com/AirGraph/yandex-recognizer)
