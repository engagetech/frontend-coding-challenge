/******************************************************************************************

View transition animations

******************************************************************************************/

var app = angular.module("alchemytec.animate.slideview", ["ngAnimate"]);

app.animation(".animate-slide-view", [ "$rootScope", "$timeout", "overlay", "overlayspinner", "config", "notifications", function($rootScope, $timeout, $overlay, $overlayspinner, $config, $notifications) {
	var $body = angular.element("body");
	var animationSpeed = "750ms";
	var animationFunction = "ease-in-out";
	var elementCSS = {
		position: "absolute",
		overflow: "auto",
		display: "block",
		transform: "translate3d(0,0,0)"
	};
	var arriving = null;
	var leaving = null;
	var watchForDelay = null;
	
	var animateContent = function() {
		if (leaving && arriving && !watchForDelay) {
			$body.animate({ scrollTop: "0px" }, function() {
				var $content = angular.element("#content");
				
				// Check which direction we are going in and reset it to the default
				var modifier = $rootScope.reverseViewAnimation? -1 : 1;
				$rootScope.reverseViewAnimation = false;

				// Just in case this has been hidden
				arriving.element.show();
				
				// Fix the element widths to avoid reflows and set their starting positions
				leaving.element.css(angular.extend(elementCSS, {
					width: leaving.element.find("div").first().outerWidth() + "px"
				}));
				arriving.element.css(angular.extend(elementCSS, {
					width: arriving.element.find("div").first().outerWidth() + "px"
				}));
				
				// Make the content width fixed so we can position the new view hidden nicely
				$content.css({
					position: "relative",
					overflow: "hidden",
					width: $content.width() + "px"
				});
				
				// Remove and re-create our keyframe styles for view-leave
				angular.element("#slide-out").remove();
				$.keyframe.define({
					name: "slide-out",
					from: {
						transform: "translate(0, 0)"
					},
					to: {
						transform: "translate(" + ($content.outerWidth() * -1 * modifier) + "px, 0)"
					}
				});
				
				// Remove and re-create our keyframe styles for view-enter
				angular.element("#slide-in").remove();
				$.keyframe.define({
					name: "slide-in",
					from: {
						transform: "translate(" + ($content.outerWidth() * modifier) + "px, 0)"
					},
					to: {
						transform: "translate(0, 0)"
					}
				});
	
				// Perform the view-leave animation
				leaving.element.playKeyframe({
					name: "slide-out",
					duration: animationSpeed,
					timingFunction: animationFunction,
					complete: leaving.callback
				});
				
				// Perform the view-enter animation
				var callback = arriving.callback;
				arriving.element.playKeyframe({
					name: "slide-in",
					duration: animationSpeed,
					timingFunction: animationFunction,
					complete: function() {
						$content.css({
							height: "auto",
							overflow: "visible",
							display: "block"
						});
						if (callback)
							callback();
					}
				});
				
				$content.height(Math.max(arriving.element.outerHeight(), leaving.element.outerHeight()));
				
				// Clear the vars so another view must be loaded before this is all triggered
				arriving = null;
				leaving = null;
			});
		}
	};

	return {
		enter: function(element, done) {
			var $scope = element.find("div").scope();
			
			// Hide our entering element initially
			element.css({
				display: "none"
			});

			// Trigger arriving animation if possible
			arriving = {
				element: element,
				callback: done
			};
			
			if ($scope.delayAnimation) {
				element.hide();

				$overlay.show("slide-view");
				$overlayspinner.show("slide-view");

				var triggerAnimation = function() {
					watchForDelay();
					watchForDelay = null;
					animateContent();
					$overlay.hide("slide-view");
					$overlayspinner.hide("slide-view");
				};

				watchForDelay = $scope.$watch("delayAnimation", function(newValue, oldValue) {
					if (!newValue && watchForDelay)
						triggerAnimation();
				});
				$timeout(function() {
					if (watchForDelay)  {
						$notifications.show("Connection issue", "A problem occured reading data from the server for this page", "error", 5000);
						triggerAnimation();
					}
				}, $config.api.timeout);
			}
			else
				animateContent();

			// Handle any animation cleanup operations
			return function(cancelled) {
				if (cancelled)
					angular.element("#content").attr("style", "").resetKeyframe();
				
				// Reset the element styles
				element.attr("style", "");
			}
		},
		leave: function(element, done) {
			// Trigger leaving animation if possible
			leaving = {
				element: element,
				callback: done
			};
			
			animateContent();
			
			// Handle any animation cleanup operations
			return function(cancelled) {
				// Reset the element styles
				element.attr("style", "");
			}
		}
	}
}]);
