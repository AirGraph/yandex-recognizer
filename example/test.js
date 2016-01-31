//	Yandex Speech Recognition for Node JS 4.2.4.
//		Version 0.1.
//			Copyright (c) Jungle Software, 2016.

var fs = require('fs'),	
		assert = require('assert'),
		yandex = require('yandex-recognizer'),

		commandLineArgs = require('command-line-args'), 
		options = commandLineOptions(),

		fileSize, db, service, sbLength;
		
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
					apikey: 'c189abe5-3d40-4870-bbe7-5a9a6f3dfa47',
					
				});
				
				service.connect();

			});
		});
	});
}

function onConnect(sessionId, code) {

	console.log('onConnect, sessionId: ' + sessionId);
	console.log('onConnect, code: ' + code);
	service.send(db, fileSize, sbLength);
	
}

function onResult(text, uttr, merge, words) {

	if(uttr) {
	
		for(var i = 0; i < words.length; i += 1) {
			
			console.log(words[i]);
			
		}
		
	} else { console.log('onResult, uttr: false, text: ' + text); }
	
}

function onError(errMsg) { console.log(errMsg); }

function commandLineOptions() {

	var clo = commandLineArgs([
	
		{ name: "file", alias: "f", type: String },
		{ name: "sample", alias: "s", type: Number }
		
	]), options = clo.parse();
		
	if ("file" in options) {
	
		if ("sample" in options) {
		
			sbLength = options.sample;
			return options;
			
		} else {
		
			sbLength = 65536;
			console.log('Sample length is set to 65536 by default...');
			return options;
			
		}
	}

	console.log(clo.getUsage({
			
		title: "Usage",
		description: "node ysr -f|--file value [-s|--sample value]"

	}));
	
	process.exit();

}

main();
