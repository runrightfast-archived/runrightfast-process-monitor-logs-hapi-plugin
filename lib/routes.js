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

var monitorLogDir = function(request) {
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
		path : '/api/process-monitor-logs/logManager',
		method : 'POST',
		config : {
			handler : monitorLogDir,
			description : 'register a log directory to monitor',
			validate : {
				payload : {
					logDir : types.String().required().regex(/^\/.+/),
					logLevel : types.String(),
					maxNumberActiveFiles : types.Number().min(1),
					retentionDays : types.Number().min(1)
				}
			},
			tags : [ 'log' ]
		}
	});

	return routes;

};