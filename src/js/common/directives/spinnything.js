/******************************************************************************************

Angular spinny thing Directive


This directive creates a spinny thing icon which animates whilst ng-model is true

Usage: <at-spinny-thing at-size="giant" at-animate="isLoading">
	this will display a very big spinny icon and animate it whilst isLoading evaluates to true

******************************************************************************************/

var app = angular.module("alchemytec.spinnything", []);

app.directive("atSpinnyThing", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var uniqueId = 1;

	var preLink = function($scope, element, attrs, controller) {
		var thisId = uniqueId++;
		
		if (attrs.atAnimate) {
			$scope.$watch(attrs.atAnimate, function(newvalue, oldvalue) {
				if (newvalue)
					element.addClass("animating");
				else
					element.removeClass("animating");
			});
		}
	};

	return {
		restrict: "E",
		compile: function(element, attrs) {
			var spinnyClass = "spinny-thing";
			
			if (attrs.atSize)
				spinnyClass += " " + attrs.atSize;
			if (!attrs.atAnimate)
				spinnyClass += " animating";

			element.replaceWith("<div class='" + spinnyClass + "'><i class='surround'></i><div class='throbbers'><i class='circle'></i><i class='circle'></i><i class='circle'></i></div></div>");

			return {
				pre: preLink,
				//post: postLink
			};
		}
	};
}]);
