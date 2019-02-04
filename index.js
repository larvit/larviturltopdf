'use strict';

const	topLogPrefix	= 'larviturltopdf: index.js: ',
	childProcess	= require('child_process'),
	phantomjs	= require('phantomjs-prebuilt'),
	phBinPath	= phantomjs.path,
	path	= require('path'),
	tmp	= require('tmp'),
	log	= require('winston'),
	fs	= require('fs');

/**
 * URL to PDF
 *
 * @param obj options {url: str, paperFormat: paperwidth*paperheight|paperformat, waitForHtmlReadyClass: true/false,
 * @param str options ALTERNATIVE to the one above, only supply an url
 * @param func cb(err, pdfBuffer, html) - html is a string of the HTML that was used to render the PDF
 */
exports = module.exports = function (options, cb) {
	if (typeof options === 'string') {
		options = {'url': options};
	}

	if ( ! options.waitForHtmlReadyClass) {
		options.waitForHtmlReadyClass	= false;
	} else {
		options.waitForHtmlReadyClass	= true;
	}

	log.verbose(topLogPrefix + 'Running for url: "' + options.url + '"');

	tmp.file(function (err, tmpFile) {
		const	execOptions	= options.execOptions || {},
			execArgs	= options.execArgs || [];

		execArgs.push(path.join(__dirname, 'rasterize.js'));
		execArgs.push(options.url);
		execArgs.push(tmpFile);
		execArgs.push(options.paperFormat);

		if (options.waitForHtmlReadyClass === true) {
			execArgs.push('true');
		}

		log.verbose(topLogPrefix + 'Generating PDF with execArgs: ' + JSON.stringify(execArgs));

		if (err) {
			log.error(topLogPrefix + 'Could not create tmpFile: ' + err.messge);
			return cb(err);
		}

		childProcess.execFile(phBinPath, execArgs, execOptions, function (err, stdout, stderr) {
			if (stderr) {
				const	stderrErr	= new Error('stderr is not empty: ' + stderr);
				log.error(topLogPrefix + stderrErr.message);
				return cb(stderrErr);
			}

			if (err) {
				log.error(topLogPrefix + 'childProcess.execFile() returned err: ' + err.message);
				return cb(err);
			}

			fs.readFile(tmpFile, function (err, pdfBuffer) {
				if (err) {
					log.error(topLogPrefix + 'Could not read from tmpFile: "' + tmpFile + '" err: ' + err.message);
				}

				cb(err, pdfBuffer, stdout);
			});
		});
	});
};
