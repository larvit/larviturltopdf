'use strict';

const urltopdf = require(__dirname + '/../index.js'),
      freeport = require('freeport'),
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

		http.createServer(function(req, res) {
			res.end(`<!DOCTYPE html>
<html><head><title>Blubb</title></head><body><h1>Testing</h1></body></html>`);
		}).listen(httpPort, function(err) {
			if (err) {
				throw err;
			}

			done();
		});
	});
});

describe('Basics', function() {
	this.slow(500);

	it('Should obtain a PDF buffer', function(done) {
		urltopdf('http://localhost:' + httpPort, function(err, pdfBuffer) {
			if (err) {
				throw err;
			}

			assert(pdfBuffer instanceof Buffer, 'pdfBuffer is not an instance of the Buffer object');

			//assert(typeof base64str === 'string', 'Expected base64str to be a string, but got: "' + (typeof base64str) + '"');
			//assert((base64str.length / 4) === parseInt(base64str.length / 4), 'base64str have an invalid length, should be a multiplier of 4');
			//assert(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(base64str), 'base64str does not validate to the regex');

			done();
		});
	});
});