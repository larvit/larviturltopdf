'use strict';

function run() {
	var system = require('system'),
	    page   = require('webpage').create(),
	    sizeArg,
	    size,
	    url;

	if (system.args.length < 2 || system.args.length > 4) {
		system.stderr.write('Invalid numer of arguments.\n');
		system.stderr.write('Usage: rasterize.js URL [paperwidth*paperheight|paperformat] [zoom]\n');
		system.stderr.write('  examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"\n');
		phantom.exit(1);
		return;
	}

	if (system.args[2] === undefined) {
		sizeArg = 'A4';
	} else {
		sizeArg = system.args[2];
	}

	url               = system.args[1];
	size              = sizeArg.split('*');
	page.viewportSize = {'width': 1920, 'height': 1080};

	if (size.length === 2) {
		page.paperSize = {
			'width':  size[0],
			'height': size[1],
			'margin': '0px'
		};
	} else {
		page.paperSize = {
			//'format':      sizeArg,
			'format':      'A4',
			'orientation': 'portrait',
			'margin':      '0cm'
		};
	}

	if (system.args.length > 2) {
		page.zoomFactor = system.args[3];
	}

	// Make sure to catch all potential js errors
	page.onError = function(msg, trace) {
		system.stderr.write('Page error: ' + msg + '\n');

		if (trace && trace.length) {
			system.stderr.write('Trace:\n');

			trace.forEach(function(t) {
				system.stderr.write(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '') + '\n');
			});
		}
	};

	page.onResourceError = function(err) {
		system.stderr.write('Unable to load resource (#' + err.id + ' URL: ' + err.url + ')\n');
		system.stderr.write('Error code: ' + err.errorCode + '. Description: ' + err.errorString + '\n');
	};

	phantom.onError = function(msg, trace) {
		system.stderr.write('Phantom error: ' + msg + '\n');

		if (trace && trace.length) {
			system.stderr.write('Trace:\n');

			trace.forEach(function(t) {
				system.stderr.write(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '') + '\n');
			});
		}
		phantom.exit(1);
	};

	page.open(url, function(status) {
		if (status !== 'success') {
			system.stderr.write('Unable to load the url: "' + url + '"\n');
			phantom.exit(1);
			return;
		}

		window.setTimeout(function() {
			page.render('/dev/stdout', {'format': 'pdf'});
			phantom.exit();
		}, 200);
	});
};
run();