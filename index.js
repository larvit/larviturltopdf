'use strict';

const childProcess = require('child_process'),
      phantomjs    = require('phantomjs-prebuilt'),
      phBinPath    = phantomjs.path,
      path         = require('path'),
      tmp          = require('tmp'),
      log          = require('winston'),
      fs           = require('fs');

/**
 * URL to PDF
 *
 * @param obj options {url: str, paperFormat: paperwidth*paperheight|paperformat, waitForHtmlReadyClass: true/false,
 * @param str options ALTERNATIVE to the one above, only supply an url
 * @param func cb(err, pdfBuffer, html) - html is a string of the HTML that was used to render the PDF
 */
exports = module.exports = function(options, cb) {
	if (typeof options === 'string') {
		options = {'url': options};
	}

	if (options.paperFormat === undefined) {
		options.paperFormat = 'A4';
	}

	if ( ! options.waitForHtmlReadyClass) {
		options.waitForHtmlReadyClass = false;
	} else {
		options.waitForHtmlReadyClass = true;
	}

	log.verbose('larviturltopdf: Running for url: "' + options.url + '"');

	tmp.file(function(err, tmpFile) {
		const execArgs = [
			path.join(__dirname, 'rasterize.js'),
			options.url,
			tmpFile,
			options.paperFormat
		];

		if (options.waitForHtmlReadyClass === true) {
			execArgs.push('true');
		}

		log.verbose('larviturltopdf: Generating PDF with execArgs: ' + JSON.stringify(execArgs));

		if (err) {
			log.error('larviturltopdf: Could not create tmpFile: ' + err.messge);
			cb(err);
			return;
		}

		childProcess.execFile(phBinPath, execArgs, function(err, stdout, stderr) {
			if (stderr) {
				const stderrErr = new Error('stderr is not empty: ' + stderr);
				log.error('larviturltopdf: ' + stderrErr.message);
				cb(stderrErr);
				return;
			}

			if (err) {
				log.error('larviturltopdf: childProcess.execFile() returned err: ' + err.message);
				cb(err);
				return;
			}

			fs.readFile(tmpFile, function(err, pdfBuffer) {
				if (err) {
					log.error('larviturltopdf: Could not read from tmpFile: "' + tmpFile + '" err: ' + err.message);
				}

				cb(err, pdfBuffer, stdout);
			});
		});
	});
};