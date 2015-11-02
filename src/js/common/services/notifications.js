"use strict";

/******************************************************************************************

Angular notifications Service

This service handles notification popups, which appear at the top of the screen

******************************************************************************************/

var app = angular.module("alchemytec.notifications", []);

app.factory("notifications", [ "$rootScope", "$http", "$q", "$timeout", "$animate", function($rootScope, $http, $q, $timeout, $animate) {
	var uniqueId = 1;
	var notifyList = [];
	var $window = angular.element(window);
	var htHeading = angular.element("<div class='heading'></div>");
	var htText = angular.element("<div class='text'></div>");
	var htHeadText = angular.element("<div class='headingtext'></div>");
	var htIcon = angular.element("<div class='icon crop-circle'></div>");
	var htNotifyBox = angular.element("<div class='dialog-notification'><div class='backdrop'></div></div>");
	
	htHeadText.append(htHeading, htText);
	htNotifyBox.append(htIcon, htHeadText);
	angular.element("body").append(htNotifyBox);
	htNotifyBox.hide();
	
	// Adds a notification to the list and shows it if no others are being displayed
	var addNotification = function(heading, text, icon, duration) {
		var notification = {
			id: uniqueId++,
			icon: icon || "warning",
			heading: heading,
			text: text,
			duration: duration
		};
		
		notifyList.push(notification);

		// If this is the only notification we should trigger a showing immediately
		if (notifyList.length == 1)
			showNotification();

		return notification.id;
	};
	
	var removeNotification = function(id) {
		// Remove notification from the list
		for (var u = 0; u < notifyList.length; u++) {
			if (notifyList[u].id == id) {
				// Fade out notification if visible
				if (!u)
					hideNotification(u);
				
				break;
			}
		}
	};
	
	var clearAllNotifications = function() {
		// Clear the notification list
		notifyList = [];
		// Trigger the hiding of any current notification
		hideNotification();
	};
	
	// Shows the first notification in the list
	var showNotification = function() {
		if (notifyList.length) {
			// Set the content of the notification up
			htHeading.html(notifyList[0].heading);
			htText.html(notifyList[0].text);
			htIcon.removeClass().addClass("icon crop-circle").addClass(notifyList[0].icon);

			// Center dialog
			htNotifyBox.show();
			var position = htNotifyBox.offset();
			position.left = Math.floor(($window.outerWidth() - htNotifyBox.outerWidth()) / 2);
			htNotifyBox.css({ left: position.left + "px" });
			htNotifyBox.hide();

			// Kick off the animation
			var promise = $animate.addClass(htNotifyBox, "animate-fade");
			
			// Hide this notification after a time if required
			if (notifyList[0].duration) {
				promise.then(function() {
					$timeout(function() {
						hideNotification();
					}, notifyList[0].duration);
				});
			}
		}
	};
	
	// Hides the first or indexed notification in the list
	var hideNotification = function(index) {
		if (htNotifyBox.is(":visible")) {
			var promise = $animate.removeClass(htNotifyBox, "animate-fade");
			
			promise.then(function() {
				// Remove this notification
				if (index)
					notifyList.splice(index, 1);
				else
					notifyList.shift();
				
				// Show the next one if it exists
				$timeout(function() {
					showNotification();
				}, 0);
			});
		}
	};

	return {
		show: addNotification,
		hide: removeNotification,
		clear: clearAllNotifications
	};
}]);
