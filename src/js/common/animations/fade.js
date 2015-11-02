/******************************************************************************************

Fade in/out animation

******************************************************************************************/

var app = angular.module("alchemytec.animate.fade", ["ngAnimate"]);

app.animation(".animate-fade", ["$timeout", function($timeout) {
	var animationSpeed = "200ms";
	var animationFunction = "ease";
	var configured = false;
	
	var createKeyFrames = function() {
		if (configured)
			return;
		
		$.keyframe.define({
			name: "animate-fade-out",
			from: {
				opacity: 1
			},
			to: {
				opacity: 0
			}
		});
		
		$.keyframe.define({
			name: "animate-fade-in",
			from: {
				opacity: 0
			},
			to: {
				opacity: 1
			}
		});
		
		configured = true;
	};
	
	var fadeIn = function(element, done) {
		createKeyFrames();

		element.css({
			display: element.data("css-display") || "block",
			transform: "translate3d(0,0,0)"
		});

		// Trigger a custom event in case the element needs to alter scrollTop or size
		element.trigger("animate-fade-in-begin");
		
		// Perform the enter animation
		element.playKeyframe({
			name: "animate-fade-in",
			duration: animationSpeed,
			timingFunction: animationFunction,
			complete: function(event) {
				if (event.eventPhase == 2)
					done();
			}
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				element.resetKeyframe();
		}
	};
	
	var fadeOut = function(element, done) {
		createKeyFrames();
		
		element.data("css-display", element.css("display"));

		// Perform the leave animation
		element.playKeyframe({
			name: "animate-fade-out",
			duration: animationSpeed,
			timingFunction: animationFunction,
			complete: function(event) {
				element.css({
					display: "none",
					opacity: 0
				});
				done();
			}
		});
		
		// Trigger a custom event in case the element needs to do something
		element.trigger("animate-fade-out-begin");

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				element.resetKeyframe();
		}
	};
	
	return {
		addClass: function(element, className, done) {
			return fadeIn(element, done);
		},
		removeClass: function(element, className, done) {
			return fadeOut(element, done);
		},
		enter: function(element, done) {
			return fadeIn(element, done);
		},
		leave: function(element, done) {
			return fadeOut(element, done);
		}
	}
}]);
