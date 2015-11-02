var app = angular.module("alchemytec.config", []);

// Some environmental specific config options
var envConfig = require("../../../../../config.js");

app.constant("config", {
	remote: {
		config: "app-config.json"
	},

	titles: {
		unauthed: "Front end coding test"
	},

	pages: {
		home: [
			"/report-labour-cost"
		],
		login: "/login"
	},

	api: {
		timeout: 1000 * 60,
		cachetimeout: 1000 * 60 * 5,
		delay: 1000 * 10,
		retries: 5,
		root: envConfig.apiroot,
		
		labourstats: {
			root: envConfig.apiroot + envConfig.labourstatsroot,

			costs: "labourstats"
		}
	},
	
	notifications: {
		maximum: 20,
		refresh: 5 * 60 * 1000
	}
});
