'use strict';

const childProcess = require('child_process'),
      phantomjs    = require('phantomjs-prebuilt'),
      phBinPath    = phantomjs.path,
      path         = require('path'),
      log          = require('winston');

/**
 * URL to PDF
 *
 * @param str url
 * @param func cb(err, pdfBuffer)
 */
exports = module.exports = function(url, cb) {
	log.verbose('larviturltopdf: Running for url: "' + url + '"');

	childProcess.execFile(phBinPath, [path.join(__dirname, 'rasterize.js'), url], function(err, stdout, stderr) {
		if (stderr) {
			const stderrErr = new Error('stderr is not empty: ' + stderr);
			log.error('larviturltopdf: ' + stderrErr.message);
			cb(stderrErr);
			return;
		}

		cb(err, stdout);
	});


//	let phInstance,
//	    page;
//
//	log.verbose('larviturltopdf: Running for url: "' + url + '"');
//
//	phantom.create()
//	.then(function(instance) {
//		phInstance = instance;
//		return instance.createPage();
//	})
//	.then(function(pageInstance) {
//		page = pageInstance;
//
//		return page.property('paperSize', {
//			'format':      'A4',
//			'orientation': 'portrait',
//			'margin':      '0'
//		});
//	})
////	.then(function() {
////		return page.property('viewportSize', {
////			'width': 2480,
////			'height': 3508
////		});
////	});
////	.then(function() {
////		return page.property('paperSize', {
////			'format':      'A4',
////			'orientation': 'portrait',
////			'margin':      '0'
////		});
////	})
//	.then(function() {
//		return page.open(url);
//	})
//	.then(function(status) {
//		if (status === 'success') {
//			log.debug('larviturltopdf: Succeeded with opening url: "' + url + '"');
//			return page.render('/tmp/ffs.pdf', {'format': 'pdf'});
//			//return page.renderBase64();
//		}
//
//		throw new Error('Could not fetch page from url: "' + url + '"');
//	})
//	.then(function(base64str) {
//		cb(null, base64str);
//		return;
//	})
//	.then(function() {
//		page.close();
//		phInstance.exit();
//	})
//	.catch(function(err) {
//		log.error('larviturltopdf: ' + err.message);
//		cb(err);
//		phInstance.exit();
//	});
};
