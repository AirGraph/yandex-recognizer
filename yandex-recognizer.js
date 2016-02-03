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
		
		partialResults: false,
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
	 * @param {Boolean} [config.partialResults=true] Получать ли промежуточные результаты.
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
		 * Send raw data to websocket.
		 * @param data Any data to send to websocket (json string, raw audio data).
		 * @private
		 */
		_sendRaw: function (data) {
		
			if (this.client.readyState === this.client.OPEN) { this.client.send(data); }
			else { console.log('Missing data!!! readyState != OPEN!!!'); }
			
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

			this.client = new W3CWebSocket(
			
				this.config.url, [], null, null, null,
				{ fragmentOutgoingMessages: false }
				
			);
			this.client.binaryType = 'arraybuffer';
			
			this.client.onopen = function() { this._sendJson(this.config); }.bind(this);
			this.client.onmessage = function(e) {

				var message = JSON.parse(e.data);
				if (message.type == 'InitResponse'){
						
					this.config.onConnect(message.data.sessionId, message.data.code);
						
				} else if (message.type == 'AddDataResponse'){
						
					this.config.onResult(message.data);
					if(message.data.uttr) { this.client.close(); }
					
				} else if (message.type == 'Error'){
						
					this.config.onError('Connection error:\n' + message.data + '\n');
								
				} else {
						
					this.config.onError('Unknown message type: ' + message.type + '\n');
							
				}
						
			}.bind(this);
					
			this.client.onerror = function() {

				this.config.onError('Client onerror event...');

			}.bind(this);

			this.client.onclose = function(event) {

				console.log('Client onclose event:');
				this.config.onError('wasClean: ' + event.wasClean);
				this.config.onError('code: ' + event.code);
				this.config.onError('reason: ' + event.reason + '\n');

			}.bind(this);
		},

		/**
		 * Отсылает данные сервису распознавания.
		 * @param {Buffer} db Буфер данных входного файла.
		 * @param {Number} dbLength Длина буфера данных в байтах.
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
				
				dbOffset += dbFrame;
				dbTail -= dbFrame;
				
				ab = new ArrayBuffer(sbLength);
				sb = new Int16Array(ab);
				sb.fill(0);

			}

			sbIndex = 0;
			for(dbIndex = dbOffset; dbIndex < dbTail; dbIndex += 2) {
			
				sb[sbIndex] = db.readInt16LE(dbIndex);
				sbIndex += 1;
				
			}

			this._sendRaw(sb);			
		},
		
		/**
		 * Завершает сессию распознавания речи, закрывая соединение с сервером.
		 */
		close: function () {
		
			if (this.client.readyState === this.client.OPEN) { this.client.close(); }

		}
	};

	namespace.Recognizer = Recognizer;

}(this));
