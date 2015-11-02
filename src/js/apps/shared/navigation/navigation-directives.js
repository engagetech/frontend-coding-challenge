/******************************************************************************************

Angular Directives for the navigation app

******************************************************************************************/

var app = angular.module("navigation.directives", []);

// The bookmarklist directive adds a clickable bookmark list to an element
// Usage: <div bookmarklist></div>
//	this will fill the list with an unordered list of clickable bookmark elements taken from any h3's directly decended from the content container
app.directive("bookmarklist", ["$compile", function($compile) {
	var link = function($scope, element, attrs, ngModel) {
		var contentList = angular.element("<ul></ul>");
		var contentSections = [];
		var searchContainer = element.parents("ng-view").children("div");
		
		// Scroll to a specific page section
		$scope.scrollToSection = function(index) {
			angular.element("body, html").animate({ scrollTop: contentSections[index].element.offset().top - angular.element(".top-navigation-bar").outerHeight() - 20 }, 500);
		};

		// Build the section list
		var buildSectionList = function() {
			contentList.empty();
			contentSections = [];

			angular.forEach(searchContainer.find("h3").not(".not-bookmark"), function(value, key) {
				var $this = angular.element(value);
				var listItem = angular.element("<li class='clickable' ng-click='scrollToSection(" + contentSections.length + ")'>" + $this.text().replace(/\([^)]*\)/g, "") + "</li>");
				
				contentList.append(listItem);
				contentSections.push({ text: $this.text(), element: $this });
			});
		};
		
		$scope.$on("navigation-updatelinks", buildSectionList);
		buildSectionList();
		
		// Add the list to the DOM
		$compile(contentList.contents())($scope);
		element.append(contentList);
	};

	return {
		restrict: "A",
		link: link
	};
}] );


// The searchbar directive shows and hides the search box
// Usage: <div class="icon clickable" searchbar="#search-bar"><i class="icon search"></i></div>
//	this would show and hide the search bar when clicking this element
app.directive("searchbar", ["$timeout", "$rootScope", "overlay", function($timeout, $rootScope, $overlay) {
	var popupType = "searchbar";
	
	var getSearchWidth = function(searchBar) {
		var heading = angular.element(".top-navigation-bar > .navigation-container h1");

		return angular.element(".top-navigation-bar > .navigation-container").outerWidth()
			/*- angular.element(".top-navigation-bar > .navigation-container .logo").outerWidth()
			- parseInt(angular.element(".top-navigation-bar > .navigation-container .logo").css("marginRight"), 10)
			- heading.outerWidth()
			- parseInt(heading.css("marginLeft"), 10)
			- parseInt(heading.css("marginRight"), 10)*/
			- parseInt(searchBar.css("right"), 10);
	};

	var link = function($scope, element, attrs) {
		var $window = angular.element(window);
		var searchBar = angular.element(attrs.searchbar || "#search-bar");
		var backButton = searchBar.find("#search-back-button");
		var searchButton = searchBar.find(".search-type");
		var searchHideButton = searchBar.find(".icon");
		var mainLogo = angular.element(".top-navigation-bar div.logo");
		var mainArea = angular.element(".top-navigation-bar > .navigation-container");
		var mainHeading = mainArea.find("h1.desktop,h1.mobile");
		var mainMobileIcon = angular.element(".top-navigation-bar .icon-bar.mobile");
		var overlay = null;
		
		backButton.hide();
		searchButton.hide();
		
		var showSearchBar = function() {
			element.hide();
			searchBar.show();
			
			// Show an overlay
			overlay = $overlay.show("search-overlay", null, "search");
			
			$timeout(function() {
				$scope.mainTitle = "Search";
				if ($scope.$parent)
					$scope.$parent.searching = true;
				
				$timeout(function() {
					var currentHeading = mainHeading.filter(":visible");
					var leftShift = -(currentHeading.outerWidth() + currentHeading.offset().left - mainArea.offset().left);
					mainLogo.animate({ left: leftShift }, 500, "linear");
					mainMobileIcon.animate({ left: leftShift }, 500, "linear");
					backButton.fadeIn();
					searchButton.fadeIn();
					currentHeading.animate({ marginLeft: leftShift }, 500, "linear");
					searchBar.animate({ width: getSearchWidth(searchBar) }, 500, "linear", function() {
						searchBar.find("input").click();
					});
				}, 0);
			}, 0);
			
			// Close any popups
			$rootScope.$broadcast("opening-popup", { type: popupType });
		};
		
		var hideSearchBar = function() {
			searchBar.find("input").blur();
			searchBar.animate({ width: 42 }, 500, "linear", function() {
				searchBar.fadeOut();
				element.show();
			});
			backButton.fadeOut();
			searchButton.fadeOut();
			mainLogo.animate({ left: 0 }, 500, "linear");
			mainMobileIcon.animate({ left: 0 }, 500, "linear");
			mainHeading.filter(":visible").animate({ marginLeft: 0 }, 500, "linear");
			
			$timeout(function() {
				delete $scope.mainTitle;
				if ($scope.$parent)
					$scope.$parent.searching = false;
			}, 0);
			
			// Hide our overlay
			if (overlay) {
				$overlay.hide(overlay);
				overlay = null;
			}
		};
		
		element.click(function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			showSearchBar();
		});
		
		searchBar.click(function(event) {
			event.preventDefault();
			event.stopPropagation();
		});
		
		backButton.click(function(event) {
			event.preventDefault();
			event.stopPropagation();
			
			// Close any popups
			$rootScope.$broadcast("opening-popup", { type: popupType });

			hideSearchBar();
		});
		
		// Hide our search bar whenever a popup is shown
		$scope.$on("opening-popup", function(event, source) {
			if ((source.type != popupType) && (source.name != "search-field") && (source.id != "#search-menu"))
				hideSearchBar();
		});
		
		var windowResize = function() {
			searchBar.css({ width: getSearchWidth(searchBar) });
		};
		$window.resize(windowResize);
		$window.click(hideSearchBar);
		
		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("resize", windowResize);
			$window.unbind("click", hideSearchBar);
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
