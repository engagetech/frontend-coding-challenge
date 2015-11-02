/******************************************************************************************

Angular Services for the navigation app

******************************************************************************************/

var app = angular.module("navigation.services", []);

// App sections are distinct areas of the website
app.factory("appsections", [ "$rootScope", function($rootScope) {
	// These will ultimately be retrieved from the server
	var appSections = [];

	var addApp = function(appInfo) {
		appSections.push(appInfo);
	};
	
	var removeApp = function(title) {
		appSections = _.filter(appSections, function(value) {
			return value.title != title;
		});
	};
	
	var getApps = function() {
		return appSections;
	};
	
	$rootScope.$watch("currentUser", function(newvalue, oldvalue) {
		// Enable apps if a user is logged in and permissions are available
		if (newvalue && newvalue.apps) {
			angular.forEach(appSections, function(app) {
				// Default permission for an app is denied
				app.disabled = true;

				angular.forEach(app.accesslist, function(property) {
					// See if this app should be enabled always
					if (property == "*")
						app.disabled = false;
					// Only enable this app if we find a matching permission for this user
					else if (_.find(newvalue.apps[property], function(value) {
						return (value == "*");
					})) {
						app.disabled = false;
					}
				});
			});
		}
		else {
			// Not logged in, hide all app icons (like we can see the app dropdown anyway!)
			angular.forEach(appSections, function(app) {
				app.disabled = true;
				
				// Okay, let's not hide them all, the styleguide won't be happy!
				angular.forEach(app.accesslist, function(property) {
					// See if this app should be enabled always
					if (property == "*")
						app.disabled = false;
				});
			});
		}
	});
	
	return {
		add: addApp,
		get: getApps,
		remove: removeApp
	};
}]);

app.factory("navigation", [ "$rootScope", "$timeout", "config", function($rootScope, $timeout, $config) {
	var navSections = {};
	var currentSection = null;
	var currentBackUrl = null;
	var currentBackTitle = null;
	
	var clearCurrentSection = function() {
		currentSection = {
			forward: [],
			backward: [],
			actions: []
		};
	};
	
	clearCurrentSection();
	
	var addSection = function(sectionData) {
		angular.extend(navSections, angular.copy(sectionData));
	};
	
	var setTitle = function() {
		if (currentSection.apptitle)
			docTitle = currentSection.apptitle;
		else if ($rootScope.currentUser && $rootScope.currentUser.appTitle)
			var docTitle = $rootScope.currentUser.appTitle;
		else
			var docTitle = $config.titles.unauthed;
		
		if (currentSection.mainheading)
			docTitle += " - " + currentSection.mainheading;
		
		document.title = docTitle;
	};
	
	var substituteVars = function(tabs, properties) {
		if (properties) {
			angular.forEach(tabs, function(value, key) {
				if (value.app)
					value.app = value.app.replace(/\{([a-z0-9-]+)\}/g, function($0, $1) {
						return properties[$1];
					});
			});
		}
	};
	
	// Accepts an object with optional forward, selected, backward and actions tab names, plus a heading
	var selectSection = function(tablist) {
		clearCurrentSection();
		
		if (tablist.apptitle)
			currentSection.apptitle = tablist.apptitle;

		if (navSections[tablist.forward]) {
			currentSection.forward = angular.copy(_.filter(navSections[tablist.forward], function(value, key) {
				if (_.isString(value) || value.action || value.back)
					return false;
				
				value.selected = (key == tablist.selected);
				
				return true;
			}));
			
			substituteVars(currentSection.forward, tablist.properties);
			
			currentSection.pagetitle = navSections[tablist.forward].pagetitle;
			currentSection.mainheading = tablist.heading || navSections[tablist.forward].mainheading;
		}
		setTitle();
		
		if (navSections[tablist.backward]) {
			currentSection.backward = angular.copy(_.filter(navSections[tablist.backward], function(value, key) {
				if (_.isString(value) || !value.back)
					return false;
				else
					return true;
			}));
			
			substituteVars(currentSection.backward, tablist.properties);
		}
		
		if (navSections[tablist.actions]) {
			currentSection.actions = angular.copy(_.filter(navSections[tablist.actions], function(value, key) {
				if (_.isString(value) || !value.action)
					return false;
				else
					return true;
			}));
			
			substituteVars(currentSection.actions, tablist.properties);
		}
	};
	
	var getCurrentSection = function() {
		return currentSection;
	};
	
	var setBackButton = function(backUrl, backTitle) {
		if (_.isObject(backUrl)) {
			backTitle = backUrl.title;
			backUrl = backUrl.url;
		}

		backUrl = backUrl || window.location.hash.substr(1);

		// Make sure we set this outside of the current digest so the url doesn't get wiped after an immediate route change
		$timeout(function() {
			currentBackUrl = backUrl;
			currentBackTitle = backTitle;
		}, 0);
	};
	
	var getBackButton = function() {
		return { url: currentBackUrl , title: currentBackTitle };
	};
	
	var setHeading = function(mainheading) {
		$timeout(function() {
			currentSection.mainheading = mainheading;
			setTitle();
		});
	};
	
	return {
		add: addSection,
		select: selectSection,
		get: getCurrentSection,
		setBack: setBackButton,
		getBack: getBackButton,
		setHeading: setHeading
	};
}]);
