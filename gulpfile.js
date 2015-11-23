/******************************************************************************************

Automated building of JavaScript and LESS files courtesy of Gulp

******************************************************************************************/

var package = require("./package.json");
var config = require("./config.js");
var path = require("path");
var parseargs = require("minimist");
var gulp = require("gulp");
var connect = require('gulp-connect');
var gulpsync = require("gulp-sync")(gulp);
var less = require("gulp-less");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var del = require("del");
var gulpif = require("gulp-if");
var rename = require("gulp-rename");
var filesize = require("gulp-filesize");
var foreach = require("gulp-foreach");
var inject = require("gulp-inject-string");
var consolidate = require("gulp-consolidate");
var ngtemplates = require("gulp-ng-templates");
var minifyhtml = require("gulp-minify-html");
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");
var browserify = require("browserify");
//var exorcist = require("exorcist");
var LessPluginCleanCSS = require("less-plugin-clean-css");
var cleancss = new LessPluginCleanCSS({ advanced: true, verbose: true, debug: true });
var compress = true;
var replace = require("gulp-replace");

var argv = parseargs(process.argv.slice(2));

// Git commit hash for this build
var githash = "";

// Source and destination dirs
var paths = {
	static: {
		source: "./src/",
		target: config.target + "/",
		targethtml: config.htmltarget + "/"
	},
	build: {
		source: "./build/source/",
		target: "./build/dest/"
	},
	copy: [
		"fonts/*.*",
		"img/**/*.*",
	]
};

// Default options
var options = {
	browserify: {
		insertGlobals: false,
		detectGlobals: false,
		debug: true,
		basedir: paths.build.source
	},
	uglify: {
		compress: {
			drop_console: true,
			sequences: true, // join consecutive statemets with the “comma operator”
			properties: true, // optimize property access: a["foo"] ? a.foo
			dead_code: true, // discard unreachable code
			drop_debugger: true, // discard “debugger” statements
			unsafe: false, // some unsafe optimizations (see below)
			conditionals: true, // optimize if-s and conditional expressions
			comparisons: true, // optimize comparisons
			evaluate: true, // evaluate constant expressions
			booleans: true, // optimize boolean expressions
			loops: true, // optimize loops
			unused: false, // drop unused variables/functions
			hoist_funs: true, // hoist function declarations
			hoist_vars: false, // hoist variable declarations
			if_return: true, // optimize if-s followed by return/continue
			join_vars: true, // join var declarations
			cascade: true, // try to cascade `right` into `left` in sequences
			side_effects: true, // drop side-effect-free statements
			warnings: true
		},
		mangle: {
		},
		beautify: {
			"ascii_only": true
		}
	},
	minifiy: {
		empty: true,
		spare: true,
		quotes: true
	}
};

// List of JS files used and to be watched in various bundles
var lists = {
	css: {
		build: [
			"less/themes/*.less"
		],
		master: [
			"less/css.less"
		],
		watch: [
			"less/**/*.less"
		]
	},
	html: {
		build: [
			"html/*.html",
			"html/*.json"
		],
		watch: [
			"html/*.html",
			"html/*.json"
		]
	},
	main: {
		build: [
			"./js/common/main.js"
		],
		watch: [
			"js/common/**/*.js",
			"js/libs/**/*.js",
			"js/libs-angular/**/*.js"
		]
	},
	apps: {
		build: [
			"./js/apps/**/*-main.js"
		],
		partials: [
			"./js/apps/**/partials"
		],
		watch: [
			"./js/apps/**/*.js",
			"./js/apps/**/*.html",
			"js/common/**/*.js",
			"js/libs/**/*.js",
			"js/libs-angular/**/*.js"
		]
	}
};

// Only build specific themes if the command line --themes is provided
if (argv.themes) {
	var themelist = argv.themes.split(",");
	
	lists.css.build = [];
	for (var u = 0; u < themelist.length; u++)
		lists.css.build.push("less/themes/" + themelist[u] + "*.less");
}

// Script building utility function
function buildPathArray(prefix, paths) {
	var list = [];
	prefix = prefix || "";
	
	for (var u = 0; u < paths.length; u++)
		list.push(prefix + paths[u]);

	return list;
};

// Return root path for minifify
var compressPath = function (p) {
	return p;
	// Despite the docs saying this works, Chrome seems to show it doesn't
	return path.relative(paths.build.source, p);
};

// Get the latest commit hash
gulp.task("commithash", function(callback) {
	githash = "12345";
	callback();
});
    
// Set the build output to be uncompressed and unminified
gulp.task("uncompressed", function() {
	compress = false;
	options.browserify.debug = false;
});

// Clean copied source directories          
gulp.task("clean-source", function(callback) {
	del([
		paths.build.source
	], callback);
});

// Clean build directories
gulp.task("clean-target", function(callback) {
	del([
		paths.static.target
	], callback);
});

// Clean static directories
gulp.task("clean-static", function(callback) {
	del([
		paths.build.target
	], callback);
});

// Clean all directories
gulp.task("clean", ["clean-source", "clean-target"]);
gulp.task("clean-all", ["clean-source", "clean-target", "clean-static"]);

// Copy from source dir to build directory
gulp.task("copyfrom", ["clean"], function() {
	return gulp.src(paths.static.source + "**")
		.pipe(gulp.dest(paths.build.source));
});

// Copy static files to build dest directory
gulp.task("copystatic", function() {
	return gulp.src(buildPathArray(paths.build.source, paths.copy), { base: paths.build.source })
		.pipe(gulp.dest(paths.build.target));
});

// Copy built files to release directory
gulp.task("copyto", ["copystatic"], function() {
	return gulp.src(paths.build.target + "**/*.*", { base: paths.build.target })
		.pipe(gulp.dest(paths.static.target));
});

// Build icon font
gulp.task("iconfont", function(){
	return gulp.src([paths.build.source + "font-svgs/iconfont/*.svg"])
	.pipe(iconfont({
		fontName: "iconfont",
		appendCodepoints: false
	}))
	.on("glyphs", function(glyphs, options) {
		// Create the CSS template
		return gulp.src(paths.build.source + "less/font.less.template")
			.pipe(consolidate("swig", {
				glyphs: glyphs,
				fontName: "iconfont",
				fontPath: "../fonts/",
				className: "iconfont"
			}))
			.pipe(rename("iconfont.less"))
			.pipe(gulp.dest(paths.build.source + "less/"));
	})
	.pipe(gulp.dest(paths.build.target + "fonts/"));
});

// Compile CSS
gulp.task("css", function() {
	return gulp.src(buildPathArray(paths.build.source, lists.css.build))
		.pipe(foreach(function(stream, file) {
			var basename = path.basename(file.path, ".less");
			
			return gulp.src(buildPathArray(paths.build.source, lists.css.master))
				.pipe(inject.after("//import \"theme.less\";", "\n@import \"themes/" + basename + "\";"))
				.pipe(sourcemaps.init({ loadMaps: true, debug: true }))
				.pipe(less({
					plugins: [
					]
				}))
				.pipe(rename("main.min.css"))
				.pipe(filesize())
				.pipe(sourcemaps.write("../maps"))
				.pipe(gulp.dest(paths.build.target + "css/"));
		}))
});

// Copy static html templates
gulp.task("html", function() {
	return gulp.src(buildPathArray(paths.build.source, lists.html.build))
		.pipe(replace(/{{commithash}}/ig, githash))
		.pipe(replace(/{{fonturl}}/ig, config.fonts))
		.pipe(filesize())
		.pipe(gulp.dest(paths.static.targethtml));
});

// Compile main app partials
gulp.task("apps-partials", function() {
	return gulp.src(buildPathArray(paths.build.source, lists.apps.partials))
		.pipe(foreach(function(stream, file) {
			if (process.platform === "win32")
				var pathArray = file.path.split("\\");
			else
				var pathArray = file.path.split("/");
			
			pathArray.pop();
			var basename = pathArray.pop();
			
			return gulp.src(file.path + "/**/*.html")
				.pipe(minifyhtml(options.minifiy))
				.pipe(ngtemplates({
					module: basename + ".partials",
					path: function (path, base) {
						return path.replace(base, "").replace("partials/", "");
					}
				}))
				.pipe(uglify(options.uglify))
				.pipe(rename("app-partials.js"))
				.pipe(filesize())
				.pipe(gulp.dest(paths.build.source + "js/apps/" + basename));
		}))
});

// Compile app scripts
gulp.task("apps-scripts", ["apps-partials"], function() {
	return gulp.src(buildPathArray(paths.build.source, lists.apps.build))
		.pipe(foreach(function(stream, file) {
			if (process.platform === "win32")
				var pathArray = file.path.split("\\");
			else
				var pathArray = file.path.split("/");

			pathArray.pop();
			var basename = pathArray.pop();
			
			var bundler = new browserify(options.browserify);
			bundler.add(file.path);
			bundler.external("moment");

			return bundler
				.bundle()
				.pipe(source(basename + ".min.js"))
				.pipe(buffer())
				.pipe(inject.after("gulpBuildVersion = {", "version: '" + package.version + "', commithash: '" + githash + "', release: '" + package.release + "', builddate: new Date(" + JSON.stringify(new Date()) + ")"))
				.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(gulpif(compress, uglify(options.uglify)))
				.pipe(sourcemaps.write("../maps"))
				//.pipe(exorcist("../maps/test.min.js"))
				.pipe(gulp.dest(paths.build.target + "js/"));
		}))
});

// Compile main scripts
gulp.task("main-scripts", function() {
	var bundler = new browserify(options.browserify);

	bundler.add(lists.main.build[0]);

	return bundler
		.bundle()
		.pipe(source("main.min.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(gulpif(compress, uglify(options.uglify)))
		.pipe(sourcemaps.write("../maps"))
		.pipe(gulp.dest(paths.build.target + "js/"));
});


// Main release build chain
gulp.task("build", gulpsync.sync(["commithash", "copyfrom", "css", "html", ["main-scripts", "apps-scripts"], "copyto"], "sync release"));
// Uncompressed release build chain
gulp.task("dev", gulpsync.sync(["uncompressed", "build"], "sync dev"));
// Default release build chain with clean
gulp.task("clean-build", gulpsync.sync(["clean-all", "build"], "sync default"));
// Font creation build chain
gulp.task("icons", gulpsync.sync(["clean-all", "copyfrom", "iconfont"], "sync icons"));
// Aliases
gulp.task("build-dev", ["dev"]);
gulp.task("debug", ["dev"]);

// Main only build chain
gulp.task("main", gulpsync.sync(["commithash", "uncompressed", "copyfrom", "html", "main-scripts", "copyto"], "sync main"));
// Less only build chain
gulp.task("less", gulpsync.sync(["commithash", "uncompressed", "copyfrom", "html", "css", "copyto"], "sync css"));
// App scripts only build chain
gulp.task("apps", gulpsync.sync(["commithash", "uncompressed", "copyfrom", "html", "apps-scripts", "copyto"], "sync apps"));

gulp.task('webserver', function() {
  connect.server({
  	livereload: true
  });
});

// Watch files and trigger minimal builds
gulp.task("watch", function() {
	gulp.watch(buildPathArray(paths.static.source, lists.css.watch), ["less"]);
	gulp.watch(buildPathArray(paths.static.source, lists.main.watch), ["main"]);
	gulp.watch(buildPathArray(paths.static.source, lists.apps.watch), ["apps"]);
});

// Present help info
gulp.task("help", function() {
	console.log("options:\nbuild\n  : standard build\ndev\n  : unminified build\nless\n  : only build CSS files\nless --themes prs,ssr\n  : only build themes beginning with prs and ssr\nmain\n  : only build main bundle\napps\n  : only build app bundles\nicons\n  : build the icon font and less file\nclean\n  : clean build directories\nclean-all\n  : clean build and target static directories\nwatch\n  : build on changes");
});

// Default build task
gulp.task("default", ["clean-build"]);

 
gulp.task('default', ['webserver', 'less', 'watch']);
