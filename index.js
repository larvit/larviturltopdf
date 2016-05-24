'use strict';

const phantom = require('phantom'),
      log     = require('winston');

/**
 * URL to PDF
 *
 * @param str url
 * @param func cb(err, pdfBuffer)
 */
exports = module.exports = function(url, cb) {
	let phInstance,
	    page;

	log.verbose('larviturltopdf: Running for url: "' + url + '"');

	phantom.create()
	.then(function(instance) {
		phInstance = instance;
		return instance.createPage();
	})
	.then(function(pageInstance) {
		page = pageInstance;
		return page.open(url);
	})
	.then(function(status) {
		if (status === 'success') {
			log.debug('larviturltopdf: Succeeded with opening url: "' + url + '"');
			return page.renderBase64();
		}

		throw new Error('Could not fetch page from url: "' + url + '"');
	})
	.then(function(base64str) {
		cb(null, base64str);
		return;
	})
	.then(function() {
		page.close();
		phInstance.exit();
	})
	.catch(function(err) {
		log.error('larviturltopdf: ' + err.message);
		cb(err);
		phInstance.exit();
	});
};
