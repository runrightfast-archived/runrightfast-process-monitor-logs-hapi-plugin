/**
 * Copyright [2013] [runrightfast.co]
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
'use strict';

var expect = require('chai').expect;
var Hapi = require('hapi');

var events = require('runrightfast-commons').events;
var eventEmitter = new events.AsyncEventEmitter();

var fs = require('fs');
var file = require('file');
var path = require('path');

var logDir = file.path.abspath('temp/logs');

describe('LoggingService Proxy Hapi Plugin', function() {

	before(function(done) {
		file.mkdirs(logDir, parseInt('0755', 8), function(err) {
			if (err) {
				done(err);
			} else {
				done();
			}
		});
	});

	afterEach(function(done) {
		setTimeout(function() {
			fs.readdir(logDir, function(err, names) {
				names.forEach(function(name) {
					fs.unlinkSync(path.join(logDir, name));
					console.log('DELETED : ' + name);
				});
				done();
			});
		}, 50);
	});

	it('can be added as a plugin to hapi', function(done) {

		var options = {
			eventEmitter : eventEmitter,
			logLevel : 'DEBUG'
		};

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			expect(err).to.not.exist;
			eventEmitter.emit('STOPPED');
			done();
		});
	});

	it('POST /api/process-monitor-logs/logManager', function(done) {
		var options = {
			eventEmitter : eventEmitter,
			logLevel : 'DEBUG'
		};

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			if (err) {
				done(err);
			} else {
				var payload = {
					logDir : logDir
				};

				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(202);
					eventEmitter.emit('STOPPED');
					setImmediate(done);
				});
			}

		});
	});

});