//	Yandex Speech Recognition for Node JS 4.2.4.
//		Version 0.0.3.
//			Copyright (c) Jungle Software, 2016.

var fs = require('fs'),	
		assert = require('assert'),
		yandex = require('yandex-recognizer'),

		commandLineArgs = require('command-line-args'), 
		options = commandLineOptions(),

		fileSize, db, service, cbLength;
		
function main() {

	fs.stat(options.file, function (err, stats){

		assert.equal(null, err);
		fileSize = stats.size;

		fs.open(options.file, 'r', function (err, fd){

			assert.equal(null, err);
			db = new Buffer(fileSize);
	
			fs.read(fd, db, 0, fileSize, null, function (err, bytesRead, buffer) {

				assert.equal(null, err);
				service = yandex.Recognizer({
				
					onConnect: onConnect,
					onResult: onResult,
					onError: onError,
					apikey: 'YOUR-OWN-YANDEX-API-KEY',
					
				});
				
				service.connect();

			});
		});
	});
}

function onConnect(sessionId, code) {

	console.log('onConnect:');
	console.log('sessionId: ' + sessionId);
	console.log('code: ' + code + '\n');
	
	service.send(db, cbLength);
	
}

function onResult(data) {

	console.log('onResult:');
	console.log('text: ' + data.text);
	console.log('uttr: ' + data.uttr);
	console.log('merge: ' + data.merge);
	console.log('words: ' + data.words);
	console.log('close: ' + data.close + '\n');
	
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
