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
const terser = require("gulp-terser");
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

// Env
const isProduction = isArgumentPassed("production", "prod");
console.log(isProduction ? "PRODUCTION" : "DEVELOPMENT");

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

const jsOptions = {
	compress: {
		unsafe: true,
		unsafe_comps: true,
		unsafe_arrows: true,
		unsafe_proto: true,
		unsafe_methods: true,
		hoist_funs: true,
		dead_code: true,
		module: true,
		global_defs: {
			DEBUG: !isProduction,
		},
	},
	mangle: {
		module: true,
		toplevel: true
	}
};

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

function handleJs() {
	return browserify(browserifyOptions)
		.transform(babelify, babelOptions)
		.bundle()
		.pipe(source("script.min.js"))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(gulpIf(isProduction, terser(jsOptions)))
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
	return watch("./src/assets/**/**.*", handleAssets);
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

function clean() {
	return del("dist");
}

function initialize() {
	return browserSync.init(browserSyncOptions);
}

// Export tasks
module.exports.assets = handleAssets;
module.exports.html = handleHtml;
module.exports.js = handleJs;
module.exports.scss = handleSCSS;
module.exports.clean = clean;
module.exports.build = series(clean, parallel(handleAssets, handleSCSS, handleHtml, handleJs));
module.exports.dev = series(module.exports.build, parallel(watchAssets, watchSCSS, watchHtml, watchJs, initialize));
module.exports.default = module.exports.build;