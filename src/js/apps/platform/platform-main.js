"use strict";

/******************************************************************************************

Alchemytec Angular Agency Extranet

******************************************************************************************/

// App files
require("../shared/app-partials.js");
require("../shared/navigation/navigation-controllers.js");
require("../shared/navigation/navigation-directives.js");
require("../shared/navigation/navigation-services.js");
require("./app-partials.js");
require("./reports/main.js");

// Declare app level module which depends on filters, and services
var app = angular.module("alcPlatform", [
	"ngRoute",
	"ngAnimate",
	"ngSanitize",
	"alchemytec.directives",
	"alchemytec.services",
	"alchemytec.filters",
	"alchemytec.animations",
	"shared.partials",
	"platform.partials",
	"navigation.directives",
	"navigation.controllers",
	"navigation.services",
	"reports.controllers"
]);

app.config(["$routeProvider", function($routeProvider) {
	// Default redirect to generic home-page
	$routeProvider.otherwise({redirectTo: "/report-labour-cost"});
}]);

app.run(["$rootScope", "$document", "$location", "$http", "$timeout", "config", "restalchemy", "appsections", function($rootScope, $document, $location, $http, $timeout, $config, $restalchemy, $appsections) {
	// Basic config options
	var gulpBuildVersion = {};
	$rootScope.config = angular.extend({ angular: angular.version.full, jquery: $.fn.jquery }, gulpBuildVersion);
	
	// Headings used by the menu bars
	$rootScope.mainTitle = "";
	$rootScope.mainHeading = "";
	
	// Sections of content are used for bookmark navigation
	$rootScope.contentSections = [];
	
	// Make the config available to all controllers
	$rootScope.config = angular.extend($rootScope.config, $config);
	
	// Info about the current logged in user
	$rootScope.currentUser = {
		person: {
			id: 12345, personDetails: [
				{ 
					firstname: "Test",
					surname: "User"
				}
			]
		},
		legalEntity: {
			id: 1,
			name: "Super Effective Coder"
		},
		appTitle: "AlchemyTec - Front end coding test",
		payrollSupplier: false,
		apps: {
			reports: ["*"]
		}
	};
	
	// Set the page title
	$document[0].title = $config.titles.unauthed;

	// Set the view animation transition class
	$rootScope.reverseViewAnimation = false;
}]);

// Bootstrap the app
$(document).ready(function() {
	angular.bootstrap("body", ["alcPlatform"]);
});
