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

var eventEmitter, log;

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
		request.reply().code(202);
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

module.exports = function(config) {
	log = config.log;
	eventEmitter = config.eventEmitter;
	config.eventEmitter.on('STOPPED', shutdown);

	return {
		getLogDirs : getLogDirs,
		createLogManager : createLogManager,
		getLogManagerInfo : getLogManagerInfo,
		stopLogManager : stopLogManager,
		getLogDirListing : getLogDirListing
	};
};