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
var types = require('hapi').types;
var LogManager = require('runrightfast-process-monitor-logs').LogManager;

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
		request.reply().code(404);
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
		request.reply().code(404);
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

module.exports = function(config) {
	var routes = [];

	log = config.log;
	eventEmitter = config.eventEmitter;

	config.eventEmitter.on('STOPPED', shutdown);

	routes.push({
		path : '/api/process-monitor-logs/logManager/logDir',
		method : 'POST',
		config : {
			handler : createLogManager,
			description : 'Register a log directory to monitor',
			validate : {
				payload : {
					logDir : types.String().required().regex(/^\/.+/),
					logLevel : types.String(),
					maxNumberActiveFiles : types.Number().min(1),
					retentionDays : types.Number().min(1)
				}
			}
		}
	});

	routes.push({
		path : '/api/process-monitor-logs/logManager/logDir/{logDir*}',
		method : 'GET',
		config : {
			handler : getLogManagerInfo,
			description : 'Returns information for the monitored log dir',
			validate : {
				path : {
					logDir : types.String().required().regex(/^\/.+/)
				}
			}
		}
	});

	routes.push({
		path : '/api/process-monitor-logs/logManager/logDirs',
		method : 'GET',
		config : {
			handler : getLogDirs,
			description : 'Returns the log directories that are being monitored as an array'
		}
	});

	routes.push({
		path : '/api/process-monitor-logs/logManager/logDir/{logDir*}',
		method : 'DELETE',
		config : {
			handler : stopLogManager,
			description : 'Unregister a log dir to monitor',
			validate : {
				path : {
					logDir : types.String().required().regex(/^\/.+/)
				}
			}
		}
	});

	return routes;

};