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

var lodash = require('lodash');
var LogManager = require('runrightfast-process-monitor-logs').LogManager;
var when = require('when');
var fs = require('fs');
var ResponseReadableStream = require('./response-readable-stream');

var eventEmitter, log, baseUri;

// logDir -> LogManager
var logManagers = {};

var createLogManager = function(request) {
	var logManagerOptions = request.payload;
	if (logManagers[logManagerOptions.logDir]) {
		request.reply();
	} else {
		var logManager = new LogManager(logManagerOptions);
		logManager.start();
		logManagers[logManagerOptions.logDir] = logManager;
		request.reply().created(baseUri + '/logManager/logDir/' + logManagerOptions.logDir);
	}
};

var updateLogManagerSettings = function(request) {
	var logManagerOptions = request.payload;
	if (log.isDebugEnabled()) {
		log.debug(logManagerOptions);
	}

	var logManager = logManagers[logManagerOptions.logDir];
	if (logManager) {
		try {
			var newLogManager = new LogManager(logManagerOptions);
			logManager.stop();
			newLogManager.start();
			logManagers[logManagerOptions.logDir] = newLogManager;
			request.reply();
		} catch (error) {
			logManager.start();
			request.reply(error);
		}
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logManagerOptions.logDir
		}).code(404);
	}
};

var toLogManagerInfo = function(logManager) {
	return {
		logDir : logManager.logDir,
		watchEventCount : logManager.watchEventCount,
		maxNumberActiveFiles : logManager.maxNumberActiveFiles,
		retentionDays : logManager.retentionDays,
		logFilesTailed : lodash.keys(logManager.tailProcesses)
	};
};

var getLogManagerInfo = function(request) {
	var logDir = request.params.logDir;
	if (log.isDebugEnabled()) {
		log.debug('getLogManagerInfo() : logDir = ' + logDir);
	}
	var logManager = logManagers[logDir];
	if (logManager) {
		request.reply(toLogManagerInfo(logManager));
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

var getLogDirs = function(request) {
	request.reply(lodash.keys(logManagers));
};

var stopLogManager = function(request) {
	var logDir = request.params.logDir;
	if (log.isDebugEnabled()) {
		log.debug('stopLogManager() : logDir = ' + logDir);
	}
	var logManager = logManagers[logDir];
	if (logManager) {
		logManager.stop();
		delete logManagers[logDir];
		request.reply();
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

var shutdown = function() {
	if (log.isDebugEnabled()) {
		log.debug('shutting down ...');
	}
	lodash.keys(logManagers).forEach(function(key) {
		logManagers[key].stop();
	});
	logManagers = {};
	eventEmitter.removeAllListeners();

	if (log.isDebugEnabled()) {
		log.debug('shutdown is complete');
	}
};

var getLogDirListing = function(request) {
	var logDir = request.params.logDir;
	var logManager = logManagers[logDir];
	if (logManager) {
		when(logManager.logDirectoryFilesWithStatsPromise(), function(listing) {
			request.reply(listing);
		}, function(error) {
			request.reply(error);
		});
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

var getLogFileTail = function(request) {
	var logFilePath = request.params.logFilePath;
	var logDir = logFilePath.substring(0, logFilePath.lastIndexOf('/'));
	var logManager = logManagers[logDir];
	if (logManager) {
		fs.exists(logFilePath, function(exists) {
			if (exists) {
				var n = parseInt(request.query.n, 10);
				var lines = lodash.isNaN(n) ? 10 : n;
				if (log.isDebugEnabled()) {
					log.debug('n = ' + n);
					log.debug('lines = ' + lines);
				}
				var tailStream = new ResponseReadableStream();

				var onDataCallback = function(data) {
					tailStream.push(data);
				};

				var onCloseCallback = function() {
					tailStream.push(null);
					if (log.isDebugEnabled()) {
						log.debug('Done tailing ' + logFilePath);
					}
				};

				logManager.tail({
					file : logFilePath,
					lines : lines,
					onDataCallback : onDataCallback,
					onCloseCallback : onCloseCallback
				});

				request.reply(tailStream).type('text/plain');

				if (log.isDebugEnabled()) {
					setImmediate(function() {
						log.debug('logManager.tailProcesses : ' + lodash.keys(logManager.tailProcesses));
					});
				}

			} else {
				request.reply({
					message : 'log file does not exist : ' + logFilePath
				}).code(404);
			}
		});
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

var getLogFileHead = function(request) {
	var logFilePath = request.params.logFilePath;
	var logDir = logFilePath.substring(0, logFilePath.lastIndexOf('/'));
	var logManager = logManagers[logDir];
	if (logManager) {
		fs.exists(logFilePath, function(exists) {
			if (exists) {
				var n = parseInt(request.query.n, 10);
				var lines = lodash.isNaN(n) ? 10 : n;
				if (log.isDebugEnabled()) {
					log.debug('n = ' + n);
					log.debug('lines = ' + lines);
				}
				var tailStream = new ResponseReadableStream();
				logManager.head({
					file : logFilePath,
					lines : lines,
					onDataCallback : function(data) {
						tailStream.push(data);
					},
					onCloseCallback : function() {
						tailStream.push(null);
						if (log.isDebugEnabled()) {
							log.debug('DONE: head -n ' + lines + ' ' + logFilePath);
						}
					}
				});
				request.reply(tailStream).type('text/plain');
			} else {
				request.reply({
					message : 'log file does not exist : ' + logFilePath
				}).code(404);
			}
		});
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

var deleteAllNonActiveLogFiles = function(request) {
	var logDir = request.params.logDir;
	if (log.isDebugEnabled()) {
		log.debug('getLogManagerInfo() : logDir = ' + logDir);
	}
	var logManager = logManagers[logDir];
	if (logManager) {
		logManager.deleteAllNonActiveLogFiles();
		request.reply().code(202);
	} else {
		request.reply({
			message : 'log dir is not managed : ' + logDir
		}).code(404);
	}
};

module.exports = function(config) {
	baseUri = config.baseUri;
	log = config.log;
	eventEmitter = config.eventEmitter;
	config.eventEmitter.on('STOPPED', shutdown);

	return {
		getLogDirs : getLogDirs,
		createLogManager : createLogManager,
		updateLogManagerSettings : updateLogManagerSettings,
		getLogManagerInfo : getLogManagerInfo,
		stopLogManager : stopLogManager,
		getLogDirListing : getLogDirListing,
		getLogFileTail : getLogFileTail,
		getLogFileHead : getLogFileHead,
		deleteAllNonActiveLogFiles : deleteAllNonActiveLogFiles
	};
};