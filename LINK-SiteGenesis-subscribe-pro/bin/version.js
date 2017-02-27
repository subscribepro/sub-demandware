#!/usr/bin/env node

'use strict';

/**
 * Bump SG version
 * Accept 2 parameters
 * - new version (no flag)
 * - old version - defined with the `from` flag
 * Example:
 *   ./version.js 1.2.3 --from 1.2.2
 */

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));

var files = [
	'app_storefront_controllers/cartridge/templates/resources/revisioninfo.properties',
	'app_storefront_core/cartridge/templates/resources/revisioninfo.properties',
	'app_storefront_core/cartridge/templates/resources/revisioninfo_fr_FR.properties',
	'app_storefront_core/cartridge/templates/resources/revisioninfo_it_IT.properties',
	'app_storefront_core/cartridge/templates/resources/revisioninfo_ja_JP.properties',
	'app_storefront_core/cartridge/templates/resources/revisioninfo_zh_CN.properties',
	'demo_data_no_hires_images/libraries/SiteGenesisSharedLibrary/library.xml',
	'demo_data_no_hires_images/version.txt',
	'pom.xml'
];

var newVersion = require('@tridnguyen/version').version('./');
var currentVersion = fs.readFileSync('./old_version', 'utf8').replace(/\n$/, '');

// use this for testing
if (argv.from) {
	currentVersion = argv.from;
}

if (!currentVersion || !newVersion) {
	console.error('Error: Both old and new versions are needed.');
	process.exit(0);
}

files.forEach(function (filepath) {
	fs.readFile(path.join(__dirname, '../', filepath), function (err, data) {
		if (err) {throw err;}
		var content = data.toString().replace(new RegExp(currentVersion, 'g'), newVersion);
		fs.writeFile(path.join(__dirname, '../', filepath), content, function (err) {
			if (err) {throw err;}
			console.log('Updated version in file ' + filepath);
		});
	});
});
