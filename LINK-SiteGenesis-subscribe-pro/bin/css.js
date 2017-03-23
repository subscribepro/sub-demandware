#!/usr/bin/env node

var sass = require('node-sass');
var async = require('async');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var Gaze = require('gaze');
var grapher = require('sass-graph');
var pkg = require('../package.json');
var argv = require('minimist')(process.argv.slice(2));

var verbose = Boolean(argv.v || argv.verbose);
var watching = Boolean(argv.w || argv.watching);

function renderFile (file, dest, cb) {
	var outFile = path.join(dest +
		[path.basename(file, path.extname(file)), '.css'].join(''));
	async.waterfall([
		function (callback) {
			mkdirp(dest, callback);
		},
		function (res, callback) {
			sass.render({
				file: file,
				outFile: outFile
			}, callback);
		},
		function (result, callback) {
			fs.writeFile(outFile, result.css, callback);
		}
	], (err, res) => {
		if (err) {
			console.error(err);
			cb(err);
			return;
		}
		if (verbose) {
			console.log('Written CSS to ' + outFile);
		}
		cb(null, res);
	});
}

function renderDir (sassPath, cb) {
	glob(sassPath.src + '/*.{sass,scss}', {ignore: '**/_*'}, (err, files) => {
		async.parallel(files.map((file) => {
			return function (callback) {
				renderFile(file, sassPath.dest, callback);
			}
		}), (err, results) => {
			if (err) {
				cb(err);
				return;
			}
			cb(null, results);
		});
	});
}

function watch (paths) {
	var buildGraph = function (dir) {
		var graphOptions = {
			loadPaths: argv.includePath,
			extensions: ['scss', 'sass', 'css']
		};

		return grapher.parseDir(dir, graphOptions);
	}

	var sassFiles = {};
	paths.forEach((sassPath) => {
		var graph = buildGraph(sassPath.src);
		Object.keys(graph.index).forEach((file) => {
			if (!sassFiles[file]) {
				sassFiles[file] = [];
			}
			sassFiles[file].push({
				graph: graph,
				dest: sassPath.dest
			});
		});
	});
	var gaze = new Gaze();
	gaze.add(Object.keys(sassFiles));
	gaze.on('error', console.error.bind(console));

	gaze.on('changed', (file) => {
		if (verbose) {
			console.log('File changed: ' + file + '. Recompiling...');
		}
		var files = {};
		sassFiles[file].forEach((config) => {
			files[file] = config.dest;
			config.graph.visitAncestors(file, (parent) => {
				// if already encountered the a file, just ignore it
				// this is to avoid writing the same file to different dest
				if (!files[parent]) {
					files[parent] = config.dest;
				}
			});
		});

		Object.keys(files).forEach((file) => {
			if (path.basename(file)[0] !== '_') {
				renderFile(file, files[file], function (err) {
					if (err) {
						console.error(err);
						return;
					}
				});
			}
		});
	});

	gaze.on('added', () => {
		graph = buildGraph();
	});
	gaze.on('deleted', () => {
		graph = buildGraph();
	});
}

if (!watching) {
	async.parallel(pkg.paths.css.map((sassPath) => {
		return function (callback) {
			renderDir(sassPath, callback);
		}
	}), (err, results) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		process.exit();
	});
} else {
	watch(pkg.paths.css);
}

