/******************************************************************************************

We configure... because we can

******************************************************************************************/

module.exports = {
	// Build target directories, this is where all the static files will end up
	target: "./static",
	htmltarget: "./",

	// The root directory for all api calls
	apiroot: "http://localhost:6502/application",
	
	// The api path for the labourstats service
	labourstatsroot: "/",
};
