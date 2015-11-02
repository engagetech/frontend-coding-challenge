"use strict";

/******************************************************************************************

Navigation controllers

******************************************************************************************/

var app = angular.module("navigation.controllers", ["ngRoute"]);

// The main navigation menu appears at the top of the page and generally carries non-page specific links
app.controller("ctrlNavigation", ["$rootScope", "$scope", "$location", "$route", "$http", "$timeout", "$filter", "appsections", "restalchemy", "navigation", function($rootScope, $scope, $location, $route, $http, $timeout, $filter, $appsections, $restalchemy, $navigation) {
	// Give the view access to the navigation service
	$scope.$navigation = $navigation;

	$scope.searching = false;
	$scope.search = {};
	$scope.notifications = [];
	$scope.notificationsOverflow = false;
	$scope.showMenu = 1;
	$scope.homeapp = "tasks";
	
	$scope.clickLogo = function() {
		// Horrible hack to make sure we never enable the logo click when on the login page
		if ($route.current.loadedTemplateUrl != "unauthedhome-content.html")
			$location.url("/" + $scope.homeapp);
	};

	$scope.selectMenu = function(id) {
		$scope.showMenu = id;
	};
	
	$scope.classMenu = function() {
		switch ($scope.showMenu) {
			case 1:
				return "one";
			case 2:
				return "two";
			case 3:
				return "three";
		}
	};	

	$scope.switchApp = function(newapp) {
		$rootScope.$broadcast("opening-popup", { type: null, id: null });
		$location.url("/" + newapp);
	};
	
	$scope.getApps = function() {
		return $appsections.get();
	};
	
	$scope.clickSignout = function() {
		// Clear current user from storage
		localStorage.removeItem("currentUser");

		// Delete current user info
		$rootScope.currentUser = null;

		// Tell the server to unauth us
		$http.delete($rootScope.config.api.auth.root + "/" + $rootScope.config.api.auth.authorise, { responseType: "json", timeout: $rootScope.config.api.timeout }).success(function(data, status, headers, config) {
			$rootScope.$broadcast("opening-popup", { type: null, id: null });
			$location.url("/");
		});
	};
	
	// Search options
	var getWorkers = function(search, callback) {
		callback([]);
	};
	
	var selectWorker = function(newvalue, callback) {
		callback(newvalue);
		$timeout(function() {
			$location.url("/worker-profile/" + newvalue.person.id);
		}, 0);
		$rootScope.$broadcast("opening-popup", { type: null, id: null });
	};
	
	$scope.search.category = "Worker";
	$scope.search.getMatches = getWorkers;
	$scope.search.clickAction = selectWorker;
	
	$scope.changeSearch = function(searchType) {
		$rootScope.$broadcast("opening-popup", { name: "search-field" });
	};
	
	$scope.clickNotification = function(notification) {
		$rootScope.$broadcast("opening-popup", { type: null, id: null });
		$location.url("/task-details/" + notification.taskid);
	};
	
	$scope.getUnreadNotifications = function() {
		var unreadNotifications = 0;
		angular.forEach($scope.notifications, function(value, key) {
			if (value.alertstatus == 1){
				unreadNotifications++;
			}
		});
		return unreadNotifications;
	};

	$scope.markNotificationsRead = function() {
	};
}]);


// The sub navigation menu appears when a page has scrolled down beyond the main menu
app.controller("ctrlSubNavigation", ["$rootScope", "$scope", "$timeout", "navigation", function($rootScope, $scope, $timeout, $navigation) {
	// Give the view access to the navigation service
	$scope.$navigation = $navigation;

	// Rebuild the bookmark section links
	var updateBookmarks = function() {
		// Shift this to the next digest so we know the DOM is loaded
		$timeout(function() {
			$rootScope.contentSections = [];
			
			angular.forEach(angular.element("#content > ng-view").last().children("div").find("h3").not(".not-bookmark"), function(value, key) {
				var $this = angular.element(value);
				
				$rootScope.contentSections.push({ text: $this.text().replace(/\([^)]*\)/g, ""), element: $this });
			});
		}, 0);
	};

	$rootScope.$on("$viewContentLoaded", updateBookmarks);
	$scope.$on("navigation-updatelinks", updateBookmarks);

	// Scroll to the top of the page
	$scope.scrollToTop = function(index) {
		angular.element("body, html").animate({ scrollTop: 0 }, 500);
	};
	
	// Scroll to a specific page section
	$scope.scrollToSection = function(index) {
		angular.element("body, html").animate({ scrollTop: $rootScope.contentSections[index].element.offset().top - angular.element(".top-navigation-bar").outerHeight() - 20 }, 500);
	};
	
	// Return the bottom of the section list bookmarks
	$scope.minShowOffset = function() {
		var bookmarkElement = angular.element("#bookmarks");
		
		if (!bookmarkElement.length)
			return angular.element("#content").offset().top + 42;
		else
			return bookmarkElement.height() + bookmarkElement.offset().top;
	};
}]);

// The tab navigation menu appears near the top of the page and generally carries page specific links
app.controller("ctrlViewNavigation", ["$rootScope", "$scope", "$location", "navigation", function($rootScope, $scope, $location, $navigation) {
	// Give the view access to the navigation service
	$scope.$navigation = $navigation;
	
	$scope.clickTab = function(tab) {
		// Back tabs always reverse the view animation
		if (tab.back)
			$rootScope.reverseViewAnimation = true;
		
		if (tab.command)
			$rootScope.$broadcast(tab.command);
		else if (tab.back && $navigation.getBack().url)
			$location.url($navigation.getBack().url);
		else
			$location.url("/" + tab.app);
	};
	
	$scope.getLinksClass = function() {
		var allTabs = $navigation.get();

		if (allTabs.forward.length && !allTabs.forward[0].title)
			return "hide";

		if ((allTabs.forward.length && allTabs.forward[0].title) && (allTabs.actions.length || ($rootScope.backButton && $rootScope.backButton.title)))
			return "ruled";
	};
	
	$scope.getBackTitle = function() {
		var backUrl = $navigation.getBack();

		return (backUrl.title || $rootScope.backButton.title);
	};
}]);
