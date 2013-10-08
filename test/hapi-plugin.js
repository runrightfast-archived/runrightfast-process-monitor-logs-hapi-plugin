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
var lodash = require('lodash');

var events = require('runrightfast-commons').events;
var eventEmitter = new events.AsyncEventEmitter();

var fs = require('fs');
var file = require('file');
var path = require('path');

var logDir = file.path.abspath('temp/logs');
console.log('logDir = ' + logDir);

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

	it('POST /api/process-monitor-logs/logManager/logDir', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);
					eventEmitter.emit('STOPPED');
					setImmediate(done);
				});
			}

		});
	});

	it('PUT /api/process-monitor-logs/logManager/logDir', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					payload.logLevel = 'DEBUG';

					server.inject({
						method : 'PUT',
						url : '/api/process-monitor-logs/logManager/logDir',
						payload : JSON.stringify(payload),
						headers : {
							'Content-Type' : 'application/json'
						}
					}, function(res) {
						expect(res.statusCode).to.equal(200);

						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('PUT /api/process-monitor-logs/logManager/logDir - for non-maanged log dir', function(done) {
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
					method : 'PUT',
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(404);

					eventEmitter.emit('STOPPED');
					setImmediate(done);
				});
			}

		});
	});

	it('POST /api/process-monitor-logs/logManager/logDir - multiple times is ok', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'POST',
						url : '/api/process-monitor-logs/logManager/logDir',
						payload : JSON.stringify(payload),
						headers : {
							'Content-Type' : 'application/json'
						}
					}, function(res) {
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}

		});
	});

	it('GET /api/process-monitor-logs/logManager/logDir/{logDir*}', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/logDir/' + logDir,
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('GET /api/process-monitor-logs/logManager/ls/{logDir*}', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, '\nSOME DATA');

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/ls/' + logDir,
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(200);
						var files = JSON.parse(res.payload);
						expect(lodash.isArray(files)).to.equal(true);
						var f = lodash.find(files, function(file) {
							return file.file === logFileName;
						});
						expect(f).to.exist;
						expect(f.stats).to.exist;
						expect(f.stats.size).to.exist;
						expect(f.stats.mtime).to.exist;
						expect(f.stats.ctime).to.exist;
						expect(f.stats.atime).to.exist;
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('GET /api/process-monitor-logs/logManager/ls/{logDir*} - for non managed logDir', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, '\nSOME DATA');

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/ls/' + logDir + '/ssfsdfsf',
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('GET /api/process-monitor-logs/logManager/tail/{logDir*}', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/tail/' + logFile,
					}, function(res) {
						console.log(res.headers);
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/tail/{logDir*} - for non existent file', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/tail/' + logDir + '/sdfdsf',
					}, function(res) {
						console.log(res.headers);
						console.log(res.payload);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/tail/{logDir*} - for non existent logDir', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/tail//sdfsdsg',
					}, function(res) {
						console.log(res.headers);
						console.log(res.payload);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/tail/{logDir*}?f=true', function(done) {
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
					logDir : logDir,
					logLevel : 'DEBUG'
				};

				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/tail/' + logFile + '?f=true',
					}, function(res) {
						console.log(res.headers);
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/head/{logDir*}', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/head/' + logFile,
					}, function(res) {
						console.log(res.headers);
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/head/{logDir*} - for non existing file', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/head/' + logFile + 'sfsdfsdf',
					}, function(res) {
						console.log(res.headers);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/head/{logDir*} - for non-managed logDir', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var fileData = '';
					for ( var i = 0; i < 20; i++) {
						fileData += ('#' + i + '\n');
					}
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, fileData);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/head//sdfsdfsdf',
					}, function(res) {
						console.log(res.headers);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});
				});
			}
		});
	});

	it('GET /api/process-monitor-logs/logManager/logDir/{logDir*}- returns 404 for a file that does not exist', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/logDir//sdfsdfsdf',
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(404);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('GET /api/process-monitor-logs/logManager/logDirs', function(done) {
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
					logDir : logDir,
					logLevel : 'DEBUG'
				};

				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'GET',
						url : '/api/process-monitor-logs/logManager/logDirs'
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});

	});

	it('DELETE /api/process-monitor-logs/logManager', function(done) {
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
					logDir : logDir,
					logLevel : 'DEBUG'
				};

				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'DELETE',
						url : '/api/process-monitor-logs/logManager/logDir/' + logDir
					}, function(res) {
						expect(res.statusCode).to.equal(200);
						eventEmitter.emit('STOPPED');
						setImmediate(done);
					});

				});
			}

		});
	});

	it('DELETE /api/process-monitor-logs/logManager - deleting a second time returns 404', function(done) {
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
					logDir : logDir,
					logLevel : 'DEBUG'
				};

				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					server.inject({
						method : 'DELETE',
						url : '/api/process-monitor-logs/logManager/logDir/' + logDir
					}, function(res) {
						expect(res.statusCode).to.equal(200);

						server.inject({
							method : 'DELETE',
							url : '/api/process-monitor-logs/logManager/logDir/' + logDir
						}, function(res) {
							expect(res.statusCode).to.equal(404);
							eventEmitter.emit('STOPPED');
							setImmediate(done);
						});
					});

				});
			}

		});
	});

	it('POST /api/process-monitor-logs/logManager/deleteAllNonActiveLogFiles/{logDir*}', function(done) {
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
					url : '/api/process-monitor-logs/logManager/logDir',
					payload : JSON.stringify(payload),
					headers : {
						'Content-Type' : 'application/json'
					}
				}, function(res) {
					expect(res.statusCode).to.equal(201);

					var logFileName = 'ops.' + process.pid + '.log.001';
					var logFile = path.join(logDir, logFileName);
					fs.writeFileSync(logFile, '\nSOME DATA');
					fs.writeFileSync(path.join(logDir, 'ops.' + process.pid + '999.log.001'), '\nSOME DATA');

					server.inject({
						method : 'POST',
						url : '/api/process-monitor-logs/logManager/deleteAllNonActiveLogFiles/' + logDir,
					}, function(res) {
						console.log(res.payload);
						expect(res.statusCode).to.equal(202);

						setTimeout(function() {
							server.inject({
								method : 'GET',
								url : '/api/process-monitor-logs/logManager/ls/' + logDir,
							}, function(res) {
								console.log(res.payload);
								expect(res.statusCode).to.equal(200);
								var files = JSON.parse(res.payload);
								expect(lodash.isArray(files)).to.equal(true);
								expect(files.length).to.equal(1);
								expect(files[0].file).to.equal(logFileName);
								eventEmitter.emit('STOPPED');
								setImmediate(done);
							});
						}, 50);
					});

				});
			}

		});
	});

	it('POST /api/process-monitor-logs/logManager/deleteAllNonActiveLogFiles/{logDir*} - for non-managed log dir', function(done) {
		var options = {
			eventEmitter : eventEmitter,
			logLevel : 'DEBUG'
		};

		var server = new Hapi.Server();
		server.pack.require('../', options, function(err) {
			if (err) {
				done(err);
			} else {
				server.inject({
					method : 'POST',
					url : '/api/process-monitor-logs/logManager/deleteAllNonActiveLogFiles/' + logDir,
				}, function(res) {
					console.log(res.payload);
					expect(res.statusCode).to.equal(404);

					eventEmitter.emit('STOPPED');
					setImmediate(done);
				});
			}

		});
	});

});