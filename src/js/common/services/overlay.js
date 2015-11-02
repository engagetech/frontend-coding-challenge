"use strict";

/******************************************************************************************

Angular overlay Service

This service handles a global busy overlay

******************************************************************************************/

var app = angular.module("alchemytec.overlay", [ "alchemytec.spinnything" ]);

app.factory("overlay", [ "$rootScope", "$timeout", "$animate", function($rootScope, $timeout, $animate) {
	var uniqueId = 1;
	var showList = [];
	var overlay = angular.element("<div class='overlay global'><div class='backdrop'></div></div>");
	
	angular.element("body").append(overlay);
	overlay.hide();
	
	overlay.click(function() {
		$rootScope.$broadcast("overlay-clicked");
	});
	
	var addOverlay = function(name, timeout, classname) {
		var event = {
			id: uniqueId++,
			name: name,
			classname: classname,
			timeout: timeout,
			started: new Date()
		};
		
		showList.push(event);
		
		if (timeout) {
			$timeout(function() {
				removeOverlay(event.id);
			}, timeout);
		}

		showHideOverlay();

		return event.id;
	};
	
	var removeOverlay = function(event) {
		// Remove overlay from the list
		if (_.isString(event)) {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].name == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		else {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].id == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		
		showHideOverlay();
	};
	
	var clearAllOverlays = function() {
		// Clear the overlay list
		showList = [];
		// Trigger the hiding of any current overlays
		showHideOverlay();
	};
	
	// Shows the first overlay in the list
	var showHideOverlay = function() {
		// See if we need to show the array
		if (showList.length) {
			var isVisible = overlay.is(":visible");
			
			// Make sure only the required classes exist
			overlay.attr("class", "overlay global" + (isVisible? " animate-fade" : ""));
			if (showList[0].classname)
				overlay.addClass(showList[0].classname);

			// Only show if not visible
			if (!isVisible)
				$animate.addClass(overlay, "animate-fade");
		}
		else {
			// Only hide if visible
			if (overlay.is(":visible"))
				$animate.removeClass(overlay, "animate-fade");
		}
	};
	
	return {
		show: addOverlay,
		hide: removeOverlay,
		clear: clearAllOverlays
	};
}]);

app.factory("overlayspinner", [ "$rootScope", "$timeout", "$animate", "$compile", function($rootScope, $timeout, $animate, $compile) {
	var uniqueId = 1;
	var showList = [];
	var overlaySpinner = angular.element("<div class='spinner global'><at-spinny-thing at-size='large'></div>");
	
	angular.element("body").append(overlaySpinner);
	$compile(overlaySpinner.contents())($rootScope);
	overlaySpinner.hide();
	
	var addOverlaySpinner = function(name, timeout) {
		var event = {
			id: uniqueId++,
			name: name,
			timeout: timeout,
			started: new Date()
		};
		
		showList.push(event);
		
		if (timeout) {
			$timeout(function() {
				removeOverlaySpinner(event.id);
			}, timeout);
		}

		showHideOverlaySpinner();

		return event.id;
	};
	
	var removeOverlaySpinner = function(event) {
		// Remove overlay spinner from the list
		if (_.isString(event)) {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].name == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		else {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].id == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		
		showHideOverlaySpinner();
	};
	
	var clearAllOverlaySpinners = function() {
		// Clear the overlay spinner list
		showList = [];
		// Trigger the hiding of any current overlay spinners
		showHideOverlaySpinner();
	};
	
	// Shows the first overlay spinner in the list
	var showHideOverlaySpinner = function() {
		// See if we need to show the array
		if (showList.length) {
			var isVisible = overlaySpinner.is(":visible");
			
			// Only show if not visible
			if (!isVisible)
				$animate.addClass(overlaySpinner, "animate-fade");
		}
		else {
			// Only hide if visible
			if (overlaySpinner.is(":visible"))
				$animate.removeClass(overlaySpinner, "animate-fade");
		}
	};
	
	return {
		show: addOverlaySpinner,
		hide: removeOverlaySpinner,
		clear: clearAllOverlaySpinners
	};
}]);
