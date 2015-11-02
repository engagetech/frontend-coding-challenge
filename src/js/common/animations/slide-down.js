/******************************************************************************************

Slide down/up animations

******************************************************************************************/

var app = angular.module("alchemytec.animate.slidedown", ["ngAnimate"]);

app.animation(".animate-slidedown", [function() {
	var animationSpeed = "250ms";
	var animationFunction = "ease";
	var configured = false;
	var slideId = 1;
	
	var slideDown = function(element, done) {
		var thisSlideId = slideId++;
		
		element.show();
		var eleHeight = element.height();
		element.hide();
		
		$.keyframe.define({
			name: "slide-down-in-" + thisSlideId,
			from: {
				height: "0px"
			},
			to: {
				height: eleHeight + "px"
			}
		});

		element.css({
			display: element.hasClass("animate-inline-block")? "inline-block" : "block",
			overflow: "hidden",
			transform: "translate3d(0,0,0)"
		});

		// Perform the enter animation
		element.playKeyframe({
			name: "slide-down-in-" + thisSlideId,
			duration: animationSpeed,
			timingFunction: animationFunction,
			complete: function() {
				element.css({
					height: "auto",
					overflow: element.hasClass("animate-overflow-auto")? "auto" : "visible"
				});
				// Clean up our animation
				angular.element("#slide-down-in-" + thisSlideId).remove();
				done();
			}
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				element.resetKeyframe();
		}
	};
	
	var slideUp = function(element, done) {
		var thisSlideId = slideId++;
		var eleHeight = element.height();

		$.keyframe.define({
			name: "slide-down-out-" + thisSlideId,
			from: {
				height: eleHeight + "px"
			},
			to: {
				height: "0px"
			}
		});
		
		element.css({
			overflow: "hidden",
			transform: "translate3d(0,0,0)"
		});

		// Perform the leave animation
		element.playKeyframe({
			name: "slide-down-out-" + thisSlideId,
			duration: animationSpeed,
			timingFunction: animationFunction,
			complete: function() {
				element.css({
					display: "none",
					height: "auto",
					overflow: "visible"
				});
				// Clean up our animation
				angular.element("#slide-down-out-" + thisSlideId).remove();
				done();
			}
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				element.resetKeyframe();
		}
	};
	
	return {
		addClass: function(element, className, done) {
			return slideUp(element, done);
		},
		removeClass: function(element, className, done) {
			return slideDown(element, done);
		},
		enter: function(element, done) {
			return slideDown(element, done);
		},
		leave: function(element, done) {
			return slideUp(element, done);
		}
	}
}]);
