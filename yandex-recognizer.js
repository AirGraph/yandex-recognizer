//	Yandex Recognizer for Node JS 4.3.
//		Version 0.2.0.
//			Copyright (c) Yandex & Jungle Software, 2016.

var W3CWebSocket = require('websocket').w3cwebsocket,
		uuid = require('node-uuid');

(function (namespace) {
	'use strict';

  /** Набор поддерживаемых форматов аудио.
	 * @readonly
	 * @enum
	 */
	namespace.FORMAT = {
	
		PCM16: 'audio/x-pcm;bit=16;rate=16000',
		
	};

	/** Recognizer default config
	 * @readonly
	 * @enum
	 */
	namespace._defaults = {

		uuid: uuid.v1(),
		format: namespace.FORMAT.PCM16,
		url: 'wss://webasr.yandex.net/asrsocket.ws',
		applicationName: 'jsapi',
		
		partialResults: true,
		punctuation: false,
		allowStrongLanguage: true,
		model: 'freeform',
		lang: 'ru-RU'

	};
	
	/**
	 * Copies all the properties of `config` to the specified `object`.
	 * There are two levels of defaulting supported:
	 * 
	 *	_apply(obj, { a: 1 }, { a: 2 });
	 *	//obj.a === 1
	 * 
	 *	_apply(obj, {	 }, { a: 2 });
	 *	//obj.a === 2
	 * 
	 * @param {Object} object The receiver of the properties.
	 * @param {Object} config The primary source of the properties.
	 * @param {Object} [defaults] The properties default value.
	 * @return {Object} returns `object`.
	 */
	namespace._enumerables = [//'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
                       'valueOf', 'toLocaleString', 'toString', 'constructor'];
                       
	for (var i in { toString: 1 }) { namespace._enumerables = null; }

	namespace._apply = function(object, config, defaults) {
		if(defaults) { namespace._apply(object, defaults); }
		if (object && config && typeof config === 'object') {
			var i, j, k;
			for (i in config) { object[i] = config[i]; }
			if (namespace._enumerables) {		 
				for (j = namespace._enumerables.length; j--;) {
					k = namespace._enumerables[j];
					if (config.hasOwnProperty(k)) { object[k] = config[k]; }
				}
			}
		}
		return object;
	};

	/**
	 * Создает новый объект типа Recognizer.
	 * @class Создает сессию и отправляет запрос на сервер для распознавания речи.
	 * @name Recognizer
	 * @param {Object} [config] Конфигурация.
	 * @param {callback:initCallback} [config.onConnect] Функция-обработчик,
	 * которая будет вызвана после успешной инициализации сессии. Умолчания нет.
	 * @param {callback:dataCallback} [config.onResult] Функция-обработчик,
	 * которая будет вызвана после завершения распознавания речи. Умолчания нет.
	 * @param {callback:errorCallback} [config.onError] Умолчания нет.
	 * @param {String} [config.uuid] UUID сессии. По умолчанию: uuid.v1().
	 * @param {String} [config.apikey] API-ключ. Умолчания нет.
	 * @param {config.format} Формат аудиопотока. По умолчанию: PCM16.
	 * Возможные значения:
	 * <ul>
	 *	<li>PCM16: 'audio/x-pcm;bit=16;rate=16000';</li>
	 * </ul>
	 * @param {String} [config.url] URL сервера, на котором будет производиться
	 * распознавание. По умолчанию: 'wss://webasr.yandex.net/asrsocket.ws'
	 * @param {Boolean} [config.punctuation] Использовать ли пунктуацию.
	 * По умолчанию: true
	 * @param {Boolean} [config.allowStrongLanguage] Распознавать обсценную лексику.
	 * По умолчанию: true
	 * @param {String} [config.model] Языковая модель, которая должна быть
	 * использована при распознавании. По умолчанию: 'notes'. Возможные значения:
	 * <ul>
	 *	<li>'notes' — общая лексика;</li>
	 *	<li>'queries' — короткие запросы;</li>
	 *	<li>'names' — имена; </li>
	 *	<li>'dates' — даты; </li>
	 *	<li>'maps' — топонимы;</li>
	 *	<li>'notes' — тексты;</li>
	 *	<li>'numbers' — числа.</li>
	 * </ul>
	 * @param {String} [config.lang] Язык распознавания. По умолчанию: 'ru-RU'.
	 * Возможные значения: 'ru-RU'; 'en-US'; 'tr-TR'; 'uk-UA'.
	 * @param {String} [config.applicationName] Название приложения.
	 * По умолчанию: 'jsapi'
	 * @param {Boolean} [config.partialResults=true] Отправлять ли на сервер
	 * промежуточные результаты.
	 */
	var Recognizer = function(config) {
	
		if (!(this instanceof namespace.Recognizer)) {
			return new namespace.Recognizer(config);
		}

		this.config = namespace._apply({}, config, namespace._defaults);

		// Backward compatibility
		this.config.key = this.config.apikey;

	};

	Recognizer.prototype = /** @lends Recognizer.prototype */{
	
		/**
	 	* Write string `str` to object `view` at the specified offset.
	 	*/
		_writeStr: function(view, offset, str) {
		
			for (var i = 0; i < str.length; i += 1) {
			
				view.setUint8(offset + i, str.charCodeAt(i));
				
			}
		},

		/**
		* Return Int16Array with 44 bytes RIFF header.
		*/
		_getChunkBuff: function(cbLength) {

			var ab = new ArrayBuffer(44 + cbLength),
					dv = new DataView(ab), cb = new Int16Array(ab);

			this._writeStr(dv, 0, 'RIFF');				// RIFF identifier
			dv.setUint32(4, 44 + cbLength, true);	// File length
			this._writeStr(dv, 8, 'WAVE');				// RIFF type
			this._writeStr(dv, 12, 'fmt ');				// Format chunk identifier
			dv.setUint32(16, 16, true);						// Format chunk length
			dv.setUint16(20, 1, true);						// Sample format (1 is PCM)
			dv.setUint16(22, 1, true);						// Channel count
			dv.setUint32(24, 16000, true);			 	// Sample Rate = Number of Samples per second
			dv.setUint32(28, 32000, true); 				// SampleRate*BitsPerSample*Channels/8
			dv.setUint16(32, 2, true);						// BitsPerSample*Channels/8
			dv.setUint16(34, 16, true);						// Bits per sample
			this._writeStr(dv, 36, 'data');				// Data chunk identifier
			dv.setUint32(40, cbLength, true);			// Data chunk length

			return cb;
		},

		/**
		* Return RIFF header of the specified data buffer (WAV file loaded into Buffer).
		*/
		_getRiff: function(db) {

			return {
			
				identifier: db.toString('utf8', 0, 4),
				fileLength: db.readUInt32LE(4),
				type: db.toString('utf8', 8, 4),
				formatChunkIdentifier: db.toString('utf8', 12, 4),
				formatChunkLength: db.readUInt32LE(16),
				sampleFormat: db.readUInt16LE(20),
				channelCount: db.readUInt16LE(22),
				sampleRate: db.readUInt32LE(24),
				sampleRate_BPS_Channels_8: db.readUInt32LE(28),
				bitsPerSample_Channels_8: db.readUInt16LE(32),
				bitsPerSample: db.readUInt16LE(34),
				dataChunkIdentifier: db.toString('utf8', 36, 4),
				dataChunkLength: db.readUInt32LE(40)

			};
		},

		/**
		 * Запускает процесс распознавания.
		 */
		connect: function () {

			this.client = new W3CWebSocket(
			
				this.config.url, [], null, null, null,
				{ fragmentOutgoingMessages: false }
				
			);
			this.client.binaryType = 'arraybuffer';
			
			this.client.onopen = function(e) {
			
				this.client.send(JSON.stringify({type: 'message', data: this.config}));
				
			}.bind(this);
			
			this.client.onmessage = function(e) {

				var message = JSON.parse(e.data);
				if (message.type == 'InitResponse'){
						
					this.config.onConnect(message.data.sessionId, message.data.code);
						
				} else if (message.type == 'AddDataResponse'){
						
					this.config.onResult(message.data);
					if(message.data.close) { this.client.close(); }
					if(message.data.text === '') {

						this.client.send(JSON.stringify({type: 'message', data: {command: 'finish'}}));

					}

				} else if (message.type == 'Error'){
						
					console.log('Error message:\n' + message.data + '\n');
								
				} else { console.log('Unknown message type: ' + message.type + '\n'); }
						
			}.bind(this);
					
			this.client.onerror = function(e) { this.config.onError(e); }.bind(this);

			this.client.onclose = function(e) {

				console.log('onclose event:');
				console.log('wasClean: ' + e.wasClean);
				console.log('code: ' + e.code);
				console.log('reason: ' + e.reason + '\n');

			};
		},

		/**
		 * Отсылает данные сервису распознавания.
		 * @param {Buffer} db Буфер данных входного файла.
		 * @param {Number} cbLength Длина буфера chunk в байтах.
		 */
		send: function(db, cbLength) {

			var	riff = this._getRiff(db), dbTail = riff.fileLength - 44,
					dbOffset = 44, dbIndex, cbIndex, cb;

			while(dbTail > cbLength) {
			
				cb = this._getChunkBuff(cbLength);
				cbIndex = 22;

				for(dbIndex = dbOffset; dbIndex < dbOffset + cbLength; dbIndex += 2) {
			
					cb[cbIndex] = db.readInt16LE(dbIndex);
					cbIndex += 1;
				
				}

				this.client.send(cb);
				
				dbOffset += cbLength;
				dbTail -= cbLength;
				
			}

			cb = this._getChunkBuff(cbLength);
			cbIndex = 22;
			
			for(dbIndex = dbOffset; dbIndex < dbOffset + dbTail; dbIndex += 2) {
			
				cb[cbIndex] = db.readInt16LE(dbIndex);
				cbIndex += 1;
				
			}

			this.client.send(cb);			

			cb = this._getChunkBuff(cbLength);		// ... silence ...
			this.client.send(cb);			
		}
	};

	namespace.Recognizer = Recognizer;

}(this));
