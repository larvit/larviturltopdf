'use strict';

const urltopdf = require(__dirname + '/../index.js'),
      freeport = require('freeport'),
      cheerio  = require('cheerio'),
      assert   = require('assert'),
      http     = require('http'),
      log      = require('winston');

let httpPort;

// Set up winston
log.remove(log.transports.Console);
log.add(log.transports.Console, {
	'level':     'warn',
	'colorize':  true,
	'timestamp': true,
	'json':      false
});

process.cwd('..');

before(function(done) {
	// Starting up a http server with some basic stuff in it
	freeport(function(err, port) {
		if (err) {
			throw err;
		}

		httpPort = port;

		done();
	});
});

describe('Basics', function() {
	this.slow(1500);
	this.timeout(5000);

	it('Should obtain a PDF buffer', function(done) {
		const server = http.createServer(function(req, res) {
			res.end(`<!DOCTYPE html>
<html><head><title>Blubb</title></head><body><h1>Testing</h1></body></html>`);
		}).listen(httpPort, function(err) {
			if (err) {
				throw err;
			}

			urltopdf('http://localhost:' + httpPort, function(err, pdfBuffer) {
				if (err) {
					throw err;
				}

				assert(pdfBuffer instanceof Buffer, 'pdfBuffer is not an instance of the Buffer object');

				server.close(done);
			});
		});
	});

	it('Should obtain a PDF buffer once html is done loading', function(done) {
		const server = http.createServer(function(req, res) {
			res.end(`<!DOCTYPE html>
<html><head><script type="text/javascript">
window.setTimeout(function() {
	document.body.innerHTML = '<h1>Ready I am</h1>';
	document.body.setAttribute('class', 'html-ready');
}, 500);
</script><title>Blubb</title></head><body><h1>Testing</h1></body></html>`);
		}).listen(httpPort, function(err) {
			if (err) {
				throw err;
			}

			urltopdf({'url': 'http://localhost:' + httpPort, 'waitForHtmlReadyClass': true}, function(err, pdfBuffer, html) {
				const $ = cheerio.load(html);

				if (err) {
					throw err;
				}

				assert(pdfBuffer instanceof Buffer, 'pdfBuffer is not an instance of the Buffer object');
				assert($('h1').text() === 'Ready I am', 'The h1 should be "Ready I am", but is "' + $('h1').text() + '"');

				server.close(done);
			});
		});
	});

	it('Should obtain a PDF buffer when passed custom execFile options', function(done) {
		const server = http.createServer(function(req, res) {
			res.end(`<!DOCTYPE html>
				<html><head><title>Blubb</title></head><body><h1>${Array(500 * 1024).fill(0)}</h1></body></html>`);
		}).listen(httpPort, function(err) {
			if (err) {
				throw err;
			}

			urltopdf({'url': 'http://localhost:' + httpPort, execOptions: {maxBuffer: 1024 * 1024}}, function(err, pdfBuffer) {

				if (err) {
					throw err;
				}

				assert(pdfBuffer instanceof Buffer, 'pdfBuffer is not an instance of the Buffer object');

				server.close(done);
			});
		});
	});
});