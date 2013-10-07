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

module.exports = function(config) {
	var types = require('hapi').types;
	var routes = [];

	var path = function(path) {
		return config.baseUri + path;
	};

	var handlers = require('./handlers')(config);

	routes.push({
		path : path('/logManager/logDir'),
		method : 'POST',
		config : {
			handler : handlers.createLogManager,
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
		path : path('/logManager/logDir/{logDir*}'),
		method : 'GET',
		config : {
			handler : handlers.getLogManagerInfo,
			description : 'Returns information for the monitored log dir',
			validate : {
				path : {
					logDir : types.String().required().regex(/^\/.+/)
				}
			}
		}
	});

	routes.push({
		path : path('/logManager/logDirs'),
		method : 'GET',
		config : {
			handler : handlers.getLogDirs,
			description : 'Returns the log directories that are being monitored as an array'
		}
	});

	routes.push({
		path : path('/logManager/logDir/{logDir*}'),
		method : 'DELETE',
		config : {
			handler : handlers.stopLogManager,
			description : 'Unregister a log dir to monitor',
			validate : {
				path : {
					logDir : types.String().required().regex(/^\/.+/)
				}
			}
		}
	});

	routes.push({
		path : path('/logManager/ls/{logDir*}'),
		method : 'GET',
		config : {
			handler : handlers.getLogDirListing,
			description : 'Returns the list of files within the log dir',
			validate : {
				path : {
					logDir : types.String().required().regex(/^\/.+/)
				}
			}
		}
	});

	routes.push({
		path : path('/logManager/tail/{logFilePath*}'),
		method : 'GET',
		config : {
			handler : handlers.getLogFileTail,
			description : 'Returns the last n files for the specified log file',
			validate : {
				path : {
					logFilePath : types.String().required().regex(/^\/.+/)
				},
				query : {
					n : types.Number().min(1),
					f : types.Boolean()
				}
			}
		}
	});

	routes.push({
		path : path('/logManager/head/{logFilePath*}'),
		method : 'GET',
		config : {
			handler : handlers.getLogFileHead,
			description : 'Returns the first n files for the specified log file',
			validate : {
				path : {
					logFilePath : types.String().required().regex(/^\/.+/)
				},
				query : {
					n : types.Number().min(1)
				}
			}
		}
	});

	return routes;

};