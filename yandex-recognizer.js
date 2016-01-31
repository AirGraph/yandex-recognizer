//	Yandex Recognizer for Node JS 4.2.4.
//		Version 0.0.1.
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
	
		PCM8: 'audio/x-pcm;bit=16;rate=8000',
		PCM16: 'audio/x-pcm;bit=16;rate=16000',
		PCM44: 'audio/x-pcm;bit=16;rate=44100',
		
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

		punctuation: true,
		allowStrongLanguage: true,
		model: 'notes',
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
	 * @param {Object} [config] Опции.
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
	 *	<li>PCM8: 'audio/x-pcm;bit=16;rate=8000';</li>
	 *	<li>PCM16: 'audio/x-pcm;bit=16;rate=16000';</li>
	 *	<li>PCM44: 'audio/x-pcm;bit=16;rate=44100';</li>
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
	 */
	var Recognizer = function(config) {
	
		if (!(this instanceof namespace.Recognizer)) {
			return new namespace.Recognizer(config);
		}

		this.config = namespace._apply({}, config, namespace._defaults);

		// Backward compatibility
		this.config.key = this.config.apikey;
		this.sessionId = null;

	};

	Recognizer.prototype = /** @lends Recognizer.prototype */{
	
		/**
		 * Send raw data to websocket.
		 * @param data Any data to send to websocket (json string, raw audio data).
		 * @private
		 */
		_sendRaw: function (data) {
			if (this.client.readyState === this.client.OPEN) { this.client.send(data); }
		},

		/**
		 * Stringify JSON and send it to websocket.
		 * @param {Object} json Object needed to be send to websocket.
		 * @private
		 */
		_sendJson: function (json) {
			this._sendRaw(JSON.stringify({type: 'message', data: json}));
		},

		/**
		 * Запускает процесс распознавания.
		 */
		connect: function () {

			this.sessionId = null;						
			
			this.client = new W3CWebSocket(this.config.url);
			this.client.binaryType = 'arraybuffer';
			
			this.client.onopen = function() {
						
				console.log('event type: onopen');
				console.log('W3C WebSocket client connected...');
				
				this._sendJson(this.config);

			}.bind(this);

			this.client.onmessage = function(e) {

				console.log('event type: onmessage');
				var message = JSON.parse(e.data);
				if (message.type == 'InitResponse'){
						
					console.log('message.type: InitResponse');
					this.sessionId = message.data.sessionId;
					this.config.onConnect(message.data.sessionId, message.data.code);
						
				} else if (message.type == 'AddDataResponse'){
						
					console.log('message.type: AddDataResponse');
					this.config.onResult(
							
						message.data.text,
						message.data.uttr,
						message.data.merge,
						message.data.words
								
					);
					
					if(message.data.uttr) { this.client.close(); }
					
					if (typeof message.data.close !== 'undefined' && message.data.close) {
							
						console.log('message.data.close: ' + message.data.close);
						this.client.close();
							
					}
						
				} else if (message.type == 'Error'){
						
					console.log('message.type: Error');
					this.config.onError('Session ' + this.sessionId + ': ' + message.data);
					this.client.close();
								
				} else {
						
					console.log('message.type: any other');
					this.config.onError('Session ' + this.sessionId + ': ' + message);
					this.client.close();
							
				}
						
			}.bind(this);
					
			this.client.onerror = function() {

				console.log('event type: onerror');
				this.config.onError('onError...');

			}.bind(this);

			this.client.onclose = function(event) {

				console.log('event type: onclose');
				this.config.onError('onClose, event.wasClean: ' + event.wasClean);
				this.config.onError('onClose, event.code: ' + event.code);
				this.config.onError('onClose, event.reason: ' + event.reason);

			}.bind(this);
		},

		/**
		 * Отсылает данные сервису для распознавания.
		 * @param {Buffer} db Буфер входного файла.
		 * @param {Number} dbLength Длина буфера файла в байтах.
		 * @param {Number} sbLength Длина буфера сэмпла в Int16.
		 */
		send: function(db, dbLength, sbLength) {

			var dbTail = dbLength, dbOffset = 0, dbFrame = sbLength*2, dbIndex, 
					ab = new ArrayBuffer(sbLength), sb = new Int16Array(ab), sbIndex;

			while(dbTail > dbFrame) {
			
				sbIndex = 0;
				for(dbIndex = dbOffset; dbIndex < dbOffset + dbFrame; dbIndex += 2) {
			
					sb[sbIndex] = db.readInt16LE(dbIndex);
					sbIndex += 1;
				
				}

				this._sendRaw(sb);
				dbOffset = dbOffset + dbFrame;
				dbTail = dbTail - dbFrame;
			}

			sb.fill(0);
			sbIndex = 0;
			for(dbIndex = dbOffset; dbIndex < dbTail; dbIndex += 2) {
			
				sb[sbIndex] = db.readInt16LE(dbIndex);
				sbIndex += 1;
				
			}

			this._sendRaw(sb);
		},
		
		/**
		 * Принудительно завершает запись звука и отсылает запрос
		 * (не закрывает сессию распознавания, пока не получит от сервера последний ответ).
		 */
		finish: function () { this._sendJson({command: 'finish'}); },
		
		/**
		 * Завершает сессию распознавания речи, закрывая соединение с сервером.
		 */
		close: function () {
		
			if (this.client.readyState === this.client.OPEN) { this.client.close(); }

		}
	};

	namespace.Recognizer = Recognizer;

}(this));
