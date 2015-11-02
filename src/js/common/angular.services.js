"use strict";

/******************************************************************************************

Angular Services for use in common apps

******************************************************************************************/

require("./services/config.js");
require("./services/restalchemy.js");
require("./services/notifications.js");
require("./services/overlay.js");

var app = angular.module("alchemytec.services", [
	"alchemytec.config",
	"alchemytec.restalchemy",
	"alchemytec.notifications",
	"alchemytec.overlay"
]);
