/******************************************************************************************

Angular clicktoggle Directive

This directive makes another element visible when the element is clicked

Usage: <a at-clicktoggle="#showme" at-hide-on="scroll,click" at-onshow="doSomething()" at-onhide="doSomethingElse()">Click me</a> <div id="showme">Thanks for the click!</div>
	this will show or hide the div when the A element is clicked, and also hide the div when the window element is clicked or scrolled.
	target element can also begin with a chain of commands that include $parent, $next, $prev to find a relative element

Optional attribute at-target-position="center/left/right" will position the element it is showing based on the clicked element
Optional attribute at-show-method="slidedown/fade" will show the element with that animation type
Optional attribute at-parent-touchable="true" will react when the parent element is clicked

******************************************************************************************/

var app = angular.module("alchemytec.clicktoggle", []);

app.directive("atClicktoggle", ["$timeout", "$animate", "$rootScope", function($timeout, $animate, $rootScope) {
	var popupType = "clicktoggle";

	var setShowPos = function(clickedElement, showHideElement, position) {
		var currentPos = showHideElement.offset();

		if (!position)
			return;

		// Set the show position based on the parent element
		switch (position) {
			case "right":
				currentPos.left = clickedElement.offset().left + clickedElement.outerWidth() - showHideElement.outerWidth();
				break;
			case "left":
				currentPos.left = clickedElement.offset().left;
				break;
			case "center":
				currentPos.left = clickedElement.offset().left + Math.floor((clickedElement.outerWidth() - showHideElement.outerWidth()) / 2);
				break;
		}
		
		showHideElement.css({ left: currentPos.left + "px" });
	};
	
	var toggleElement = function(clickedElement, showHideElement, method, position, forcehide) {
		if (forcehide || showHideElement.is(":visible")) {
			switch (method) {
				case "slidedown":
					showHideElement.slideUp();
					break;
				case "fade":
				default:
					// Make sure the element has the animate class or removing it with the animate service won't hide it
					if (!showHideElement.hasClass("animate-fade"))
						showHideElement.addClass("animate-fade");

					$timeout(function() {
						$animate.removeClass(showHideElement, "animate-fade");
					}, 0);
			}
			
			clickedElement.removeClass("toggle-show");
			clickedElement.addClass("toggle-hide");
		}
		else {
			showHideElement.show();
			setShowPos(clickedElement, showHideElement, position);
			showHideElement.hide();

			switch (method) {
				case "slidedown":
					showHideElement.slideDown();
					break;
				case "fade":
				default:
					showHideElement.removeClass("animate-fade");
					$timeout(function() {
						$animate.addClass(showHideElement, "animate-fade");
					}, 0);
			}
			
			clickedElement.removeClass("toggle-hide");
			clickedElement.addClass("toggle-show");
		}
	};
	
	var link = function($scope, element, attrs, ngModel) {
		var $window = angular.element(window);
		var clickToggle = attrs.atClicktoggle || "$this";
		var showMethod = attrs.atShowMethod || "fade";
		var parentTouchable = attrs.atParentTouchable || false;
		var position = attrs.atTargetPosition;
		var targetElement = [];

		// Get a list of events to filter on
		if (attrs.atHideOn)
			var events = attrs.atHideOn.split(",");
		else
			var events = [];
		
		var getTargets = function() {
			if (targetElement.length)
				targetElement.unbind("click", stopClickPropagation);

			// If we have no special $ operators we can just get the target element
			if (clickToggle.search(/\$/) == -1)
				targetElement = angular.element(clickToggle);
			else {
				// Make special operators
				var evalToggle = "element." + clickToggle.replace(/\$([a-z]+)/ig, "$1()");
				evalToggle = evalToggle.replace(/\)([.#]+[a-z0-9]+)$/ig, "'$1')");
	
				targetElement = eval(evalToggle);
			}
			
			// Make sure any clicks to the target element we are showing don't propagate up to window
			targetElement.click(stopClickPropagation);
			if (_.find(events, function(value) { return value == "click"; }))
				targetElement.click(eventHideElement);
		};
		
		var clickFunc = function(event) {
			event.preventDefault();
			event.stopPropagation();

			// Get our list of targets at click time as they may not be there when we are instantiated
			getTargets();
			
			// Tell the world if we are showing a popup
			if (!targetElement.is(":visible")) {
				$rootScope.$broadcast("opening-popup", { type: popupType, id: attrs.atClicktoggle });
				
				// Run any on show code
				if (attrs.atOnshow)
					$scope.$eval(attrs.atOnshow);
			}
			else {
				// Run any on hide code
				if (attrs.atOnhide)
					$scope.$eval(attrs.atOnhide);
			}
			
			toggleElement(element, targetElement, showMethod, position);
		};
		
		// Toggle our target element whenever this element (and parent) is clicked
		element.click(clickFunc);
		if (parentTouchable)
			element.parent().click(clickFunc);
		
		var stopClickPropagation = function(event) {
			event.stopPropagation();
		};
		
		var eventHideElement = function(event) {
			if (targetElement.length && targetElement.is(":visible")) {
				// Run any on hide code
				if (attrs.atOnhide)
					$scope.$eval(attrs.atOnhide);
				
				toggleElement(element, targetElement, showMethod, position, true);
			}
		};

		// Hide our target element whenever specified events are triggered
		angular.forEach(events, function(eventname) {
			if (eventname == "popup") {
				// Hide our target element whenever another is shown
				$scope.$on("opening-popup", function(event, source) {
					if ((source.type != popupType) || (source.id != attrs.atClicktoggle))
						eventHideElement();
				});
			}
			else
				$window.on(eventname, eventHideElement);
		});
		
		// Tidy up our window listeners
		element.on("$destroy", function() {
			angular.forEach(events, function(eventname) {
				if (eventname != "popup")
					$window.unbind(eventname, eventHideElement);
			});
			
			if (targetElement.length)
				targetElement.unbind("click", stopClickPropagation);
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
