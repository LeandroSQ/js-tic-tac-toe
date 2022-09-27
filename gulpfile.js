/* eslint-env node */
const { src, dest, series, parallel, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");
const htmlMinify = require("gulp-htmlmin");
const sourcemaps = require("gulp-sourcemaps");
const browserify = require("browserify");
const babelify = require("babelify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const sass = require("gulp-sass")(require("sass"));
const cssAutoPrefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");

// Utilities
function isArgumentPassed(...args) {
	for (let i = 0; i < args.length; i++) {
		if (!args[i].startsWith("--")) {
			if (args[i].length > 1) {
				args.unshift(`--${args[i]}`);
			} else {
				args.unshift(`-${args[i]}`);
			}

			i++;
		}
	}

	for (const key of args) {
		if (process.argv.includes(key)) return true;
		if (!key.startsWith("-") && key.toUpperCase() in process.env) return true;
	}

	return false;
}

// Options
const browserSyncOptions = {
	open: false,
	browser: false,
	ui: false,
	host: "0.0.0.0",
	server: {
		baseDir: "./dist",
		port: 3000,
	},
};

const htmlOptions = {
	collapseWhitespace: true,
	removeComments: true,
	removeRedundantAttributes: true
};

const browserifyOptions = {
	entries: ["./src/scripts/main.js"],
	debug: true,
	transform: "babelify"
};

const babelOptions = {
	babelrc: true
};

const cssOptions = {
	outputStyle: "compressed",
	sourceComments: false,
	sourceMap: false,
};

const isProduction = isArgumentPassed("production", "prod");
console.log(isProduction ? "PRODUCTION" : "DEVELOPMENT");

// Tasks
function reload() {
	return browserSync.reload({ stream: true });
}

function handleHtml() {
	return src("src/**/*.html")
		.pipe(htmlMinify(htmlOptions))
		.pipe(dest("./dist"))
		.pipe(reload());
}

function watchHtml() {
	return watch("src/**/*.html", handleHtml);
}

function debounce(func, wait, immediate) {
	let timeout;

	return function() {
		// eslint-disable-next-line no-invalid-this
		const context = this;
		// eslint-disable-next-line prefer-rest-params
		const args = arguments;

		const later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function handleJs() {
	return browserify(browserifyOptions)
		.transform(babelify, babelOptions)
		.bundle()
		.pipe(source("script.min.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(gulpIf(isProduction, uglify()))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist/scripts"))
		.pipe(reload());
}

function watchJs() {
	return watch("src/**/*.js", handleJs);
}

function handleAssets() {
	return src("./src/assets/**/**.*")
		.pipe(dest("./dist/assets"))
		.pipe(reload());
}

function watchAssets() {
	return watch(
		[
			"src/image/**.*",
			"src/audio/**.*",
			"src/font/**.*",
			"src/lang/**.*",
			"src/assets/**.*",
		],
		handleAssets
	);
}

function handleSCSS() {
	return src("./src/styles/**.scss")
		.pipe(sourcemaps.init())
		.pipe(sass(cssOptions).on("error", sass.logError))
		.pipe(cssAutoPrefixer())
		.pipe(concat("style.min.css"))
		.pipe(sourcemaps.write("./"))
		.pipe(dest("./dist/styles"))
		.pipe(reload());
}

function watchSCSS() {
	return watch("./src/styles/**.scss", handleSCSS);
}

function buildDictionaries(done) {
	const exec = require("child_process").execSync;
	const fs = require("fs");
	const path = require("path");
	const root = path.join(__dirname, "data", "scripts");
	const files = fs.readdirSync(root)
		.filter((x) => x.endsWith("-lexicon.js"));

	for (const script of files) {
		console.log(`Executing ${script}...`);
		const stdout = exec(`node ${path.join(root, script)}`);
		console.log(stdout.toString("utf-8"));
	}

	done();
}


function handleDictionaries() {
	return src("./data/cache/**.*")
		.pipe(dest("./dist/lang"))
		.pipe(reload());
}

function watchDictionaries() {
	return watch("./data/cache/**.*", handleDictionaries);
}

function clean() {
	return del("dist");
}

function initialize() {
	return browserSync.init(browserSyncOptions);
}

// Export tasks
module.exports.assets = handleAssets;
module.exports.dict = series(buildDictionaries, handleDictionaries);
module.exports.html = handleHtml;
module.exports.js = handleJs;
module.exports.scss = handleSCSS;
module.exports.clean = clean;
module.exports.build = function (done) {
	const tasks = [handleDictionaries, handleAssets, handleSCSS, handleHtml, handleJs];

	// If in production, build the dictionaries...
	if (isProduction) tasks.unshift(buildDictionaries);

	return series(clean, parallel(...tasks))(done);
};
module.exports.dev = series(
	module.exports.build,
	parallel(watchAssets, watchSCSS, watchHtml, watchJs, watchDictionaries, initialize)
);
module.exports.default = module.exports.build;