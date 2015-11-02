/******************************************************************************************

Main Javascript functionality on every page

******************************************************************************************/

// Substitute fake console object for IE9 or lower
if (!window.console)
	window.console = {};
if (!window.console.log)
	window.console.log = function () { };

// Strip query params before angular gets bootstrapped if this contains the cache buster
if (window.location.search.match("cache="))
	window.history.pushState(null, "", window.location.pathname + window.location.hash);

// General libraries
window.$ = window.jQuery = require("../libs/jquery/jquery-2.1.4.min.js");
window.jQuery = window.$;
window._ = require("../libs/underscore/underscore-min.js");
// Prefixfree is only required for the unminified version of jquerykeyframes
require("../libs/jquerykeyframes/prefixfree.min.js");
require("../libs/jquerykeyframes/jquery.keyframes.js");
var fastclick = require("../libs/fastclick/fastclick.js");

// Commonly used third party Angular modules
require("../libs-angular/angular/angular.min.js");
//require("../libs-angular/angular/angular-touch.min.js");
require("../libs-angular/angular/angular-route.min.js");
require("../libs-angular/angular/angular-animate.min.js");
require("../libs-angular/angular/angular-sanitize.min.js");

// Commonly used custom Angular modules
require("./angular.directives.js");
require("./angular.services.js");
require("./angular.filters.js");
require("./angular.animations.js");

// These things are done on every page if required, such as error popups
$(document).ready(function() {
	fastclick(document.body);
});
