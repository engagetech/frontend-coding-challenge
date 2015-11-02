"use strict";

/******************************************************************************************

Angular restalchemy Service

This service handles REST API calls, with auto-retries when networks are down or re-auth required

Usage:
	$restalchemy.at("vacancies", 23).get().then(callback).error(callback);

Makes a get request on the /vacancies/23 endpoint, calling one of two callbacks depending on success or failure


Usage:
	var rest = $restalchemy.init({ root: "/api" });
	rest.at("vacancies", 23, "lines").get().then(callback);

Makes a get request on /api/vacancies/23/lines endpoint, does nothing on an error

	rest.at("workers").get({ name: "pauline"}).then(callback);

Makes a get request on /api/workers?name=pauline endpoint, does nothing on an error

	rest.at("tasktypes").get({}, 60000).then(callback);

Makes a get request on /api/tasktypes endpoint, caching results for 60 seconds, does nothing on an error

	rest.at("tasktypes").get({}, 60000, "tasks").then(callback).error(badcallback);

Makes a get request on /api/tasktypes endpoint, caching results for 60 seconds as part of the cache group "tasks",
on error call badcallback.

	rest.invalidate("tasks");

Wipe all cached calls in the tasks cache group.

	rest.invalidate();

Wipe all cached calls.

******************************************************************************************/

var app = angular.module("alchemytec.restalchemy", []);

app.factory("restalchemy", [ "$rootScope", "$http", "$q", "$timeout", function($rootScope, $http, $q, $timeout) {
	var cache = {};
	var defaultcachetime = 1000 * 60 * 60;
	
	var sanitiseRestData = function(data) {
		var newdata = angular.copy(data);
		var items = newdata._items || newdata;
		
		if (newdata._info) {
			for (var key in newdata._info)
				items[key] = newdata._info[key];
		}
		
		return items;
	};
	
	// Get request with built in retry and error handling
	var httpGet = function($this, params, cachename, cachegroup, expires) {
		$http.get($this.endpoint, { params: params, cache: false, responseType: "json", timeout: $this.config.timeout }).success(function(data, status, headers, config) {
			if (cachename) {
				cache[cachename] = {
					group: cachegroup,
					data: data,
					status: status,
					expires: expires
				}
			}

			if ($this.config.success) {
				$this.config.success(sanitiseRestData(data), status);
			}
		}).error(function(data, status, headers, config) {
			// If status could be temporary, try again the right number of times
			if ((status >= 500) && ($this.attempt < $this.config.retries)) {
				$this.attempt++;
				
				$timeout(function() {
					httpGet($this, params, cachename, cachegroup, expires);
				}, $this.config.delay);
			}
			else if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpGet($this, params, cachename, cachegroup, expires);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error)
				if ($this.config.error)
					$this.config.error(data, status);
		});
	};
	
	// Post request with built in retry and error handling
	var httpPost = function($this, postdata, params) {
		$http.post($this.endpoint, postdata, { params: params, responseType: "json", timeout: $this.config.timeout }).success(function(data, status, headers, config) {
			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// If status could be temporary, try again the right number of times
			if ((status >= 500) && ($this.attempt < $this.config.retries)) {
				$this.attempt++;
				
				$timeout(function() {
					httpPost($this, postdata, params);
				}, $this.config.delay);
			}
			else if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpPost($this, postdata, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error)
				if ($this.config.error)				
					$this.config.error(data, status);
		});
	};
	
	// Put request with built in retry and error handling
	var httpPut = function($this, putdata, params) {
		$http.put($this.endpoint, putdata, { params: params, responseType: "json", timeout: $this.config.timeout }).success(function(data, status, headers, config) {
			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// Not modified isn't an error
			if (status == 304)
				$this.config.success(data, status);
			// If status could be temporary, try again the right number of times
			else if ((status >= 500) && ($this.attempt < $this.config.retries)) {
				$this.attempt++;
				
				$timeout(function() {
					httpPut($this, putdata, params);
				}, $this.config.delay);
			}
			else if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpPut($this, putdata, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error)
				if ($this.config.error)
					$this.config.error(data, status);
		});
	};
	
	// Delete request with built in retry and error handling
	var httpDelete = function($this, params) {
		$http.delete($this.endpoint, { params: params, responseType: "json", timeout: $this.config.timeout }).success(function(data, status, headers, config) {
			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// If status could be temporary, try again the right number of times
			if ((status >= 500) && ($this.attempt < $this.config.retries)) {
				$this.attempt++;
				
				$timeout(function() {
					httpDelete($this, params);
				}, $this.config.delay);
			}
			else if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpDelete($this, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error)
				if ($this.config.error)
					$this.config.error(data, status);
		});
	};
	
	return {
		// Configuration settings
		config: {
			root: "/",
			retries: 2,
			delay: 3000,
			success: null,
			error: null,
			authenticate: null,
			timeout: null
		},
		
		// Current endpoint
		endpoint: null,
		attempt: 0,
		
		// Create a unique copy of this service's settings
		init: function(config) {
			var $this = angular.copy(this);
			
			for (var key in config)
				$this.config[key] = config[key];

			return $this;
		},

		// Add paths to the endpoint
		at: function() {
			// See if this the start of a new call
			if (this.endpoint == null) {
				var $this = angular.copy(this);
				$this.endpoint = this.config.root;
			}
			else
				$this = this;
			
			for (var u = 0; u < arguments.length; u++)
				$this.endpoint = $this.endpoint.replace(/\/?$/, "/") + arguments[u];
			
			return $this;
		},

		getCall: function() {
			var deferred = null;
			var $this = this;
			return function(params) {
				if (deferred) {
					deferred.resolve();
				}
				deferred = $q.defer();
				return $this.timeout(deferred.promise).get(params);
			};
		},

		// Get from the current endpoint
		get: function(params, cachetime, cachegroup) {
			var $this = this;

			$timeout(function() {
				// See if we can retrieve a cached version of this call
				if (cachetime) {
					cachetime = _.isNumber(cachetime)? cachetime : defaultcachetime;
					cachegroup = cachegroup || "global";
					
					// Make our cache string for lookups
					var cachename = $this.endpoint + (params? JSON.stringify(params) : "");
					
					// Check to see if this request is cached
					var cachedRequest = cache[cachename];
					if (cachedRequest && (Date.now() < cachedRequest.expires)) {
						$this.config.success(sanitiseRestData(cachedRequest.data), cachedRequest.status);
					}
					else
						httpGet($this, params, cachename, cachegroup, new Date(Date.now() + cachetime));
				}
				else
					httpGet($this, params);
			}, 0);
			
			return this;
		},
		
		// Post data to the current endpoint
		post: function(data, params) {
			var $this = this;

			$timeout(function() {
				httpPost($this, data, params);
			}, 0);
			
			return this;
		},
		
		put: function(data, params) {
			var $this = this;

			$timeout(function() {
				httpPut($this, data, params);
			}, 0);
			
			return this;
		},
		
		delete: function(params) {
			var $this = this;

			$timeout(function() {
				httpDelete($this, params);
			}, 0);
			
			return this;
		},
		
		// Set the success callback, which receives (data, status) params
		then: function(callback) {
			this.config.success = callback;
			
			return this;
		},
		
		// Set the error callback, which receives (data, status) params
		error: function(callback) {
			this.config.error = callback;
			
			return this;
		},
		
		// Set the authentication callback, which receives (authenticated, error) and should call one of them as a callback
		authenticate: function(callback) {
			this.config.authenticate = callback;
			
			return this;
		},
		
		// Set a promise for rest calls so it can be cancelled
		timeout: function(promise) {
			var $this = angular.copy(this);
			$this.config.timeout = promise;
			
			return $this;
		},
		
		// Invalidate a group of cached calls
		invalidate: function(cachegroup) {
			if (cachegroup) {
				cache = _.filter(cache, function(value) {
					return (value.group != cachegroup);
				});
			}
			else
				cache = {};
		}
	};
}]);
