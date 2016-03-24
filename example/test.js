//	Yandex Speech Recognition for Node JS 4.3.
//		Version 0.0.3.
//			Copyright (c) Jungle Software, 2016.

var	commandLineArgs = require('command-line-args'),
	assert = require('assert'),
	fs = require('fs'),

	yandex = require('yandex-recognizer'),

	options = commandLineOptions(),
	outSize, db, service, cbLength,
	resText = '', curText = '';

function main() {
	fs.stat(options.file, function (err, stats){

		assert.equal(null, err);
		outSize = stats.size;

		fs.open(options.file, 'r', function (err, fd){

			assert.equal(null, err);
			db = new Buffer(outSize);

			fs.read(fd, db, 0, outSize, null, function (err, bytesRead, buffer) {

				assert.equal(null, err);
				service = yandex.Recognizer({

					onConnect: onConnect,
					onResult: onResult,
					onClose: onClose,
					onError: onError,
					apikey: 'YOUR-OWN-API-KEY',

				});

				service.connect();

			});
		});
	});
}

function onConnect(sessionId, code) {

	console.log('sessionId: ' + sessionId);
	console.log('code: ' + code + '\n');
	service.send(db, cbLength);

}

function onResult(data) {

	if(data.uttr) resText += data.text;
	else curText = data.text;

}

function onClose(e) {

	console.log('wasClean: ' + e.wasClean);
	console.log('code: ' + e.code);
	console.log('reason: ' + e.reason + '\n');
	console.log('Final recognition: ' + resText + curText);

}

function onError(e) {

	console.log('onError:');
	for(var i in e) { console.log(i + ': ' + e[i]); }

}

function commandLineOptions() {

	var clo = commandLineArgs([

		{ name: "file", alias: "f", type: String },
		{ name: "chunk", alias: "c", type: Number }

	]), options = clo.parse();

	if ("file" in options) {

		if ("chunk" in options) {

			cbLength = options.chunk;
			return options;

		} else {

			cbLength = 32000;
			console.log('Chunk length is set to 32000 by default...\n');
			return options;

		}
	}

	console.log(clo.getUsage({

		title: "Usage",
		description: "node ysr -f|--file name.ext [-c|--chunk value]"

	}));

	process.exit();

}

main();
