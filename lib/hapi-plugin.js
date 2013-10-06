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

/**
 * @param options
 * 
 * <code>
 * {
 * eventEmitter: eventEmitter			// REQUIRED - used by the plugin to register for the 'STOPPED' event in order perform any resource cleanup 
 * 										//			  when the app is stopped, such as stopping all the LogManagers
 * logLevel : 'WARN'					// OPTIONAL -default is 'WARN'
 * }   
 * </code>
 */
module.exports.register = function(plugin, options, next) {
	'use strict';

	var lodash = require('lodash');
	var Hoek = require('hoek');
	var assert = Hoek.assert;
	var extend = require('extend');

	var logging = require('runrightfast-commons').logging;
	var pkgInfo = require('./pkgInfo');
	var logger = logging.getLogger(pkgInfo.name);

	var config = {
		logLevel : 'WARN'
	};

	var validateConfig = function(config) {
		assert(lodash.isObject(config.eventEmitter), 'eventEmitter is required');
	};

	/**
	 * Used to select servers to configure based on server labels. By default,
	 * it returns back the plugin
	 */
	var selection = function(config) {
		if (lodash.isArray(config.serverLabels) || lodash.isString(config.serverLabels)) {
			return plugin.select(config.serverLabels);
		}
		return plugin;
	};

	var registerPlugin = function(config) {
		var servers = selection(config);
		servers.route(require('./routes')(config));
	};

	extend(true, config, options);
	logging.setLogLevel(logger, config.logLevel);
	if (logger.isDebugEnabled()) {
		logger.debug(config);
	}
	validateConfig(config);
	config.log = logger;
	registerPlugin(config);

	next();

};