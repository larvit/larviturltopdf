'use strict';

var isReady = function () {
	return true;
};

function run() {
	var	system	= require('system'),
		timer	= 0,
		page	= require('webpage').create(),
		dpi	= 72.0,
		dpcm	= dpi / 2.54,
		widthCm	= 21.0,
		heightCm	= 29.7,
		outfile,
		sizeArg,
		size,
		url;

	if (system.args.length < 3 || system.args.length > 5) {
		system.stderr.write('Invalid numer of arguments.\n');
		system.stderr.write('Usage: rasterize.js URL outfile [paperwidth*paperheight|paperformat] [true (wait for class "html-ready" to exist on the body tag)]\n');
		system.stderr.write('  examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"\n');
		phantom.exit(1);
		return;
	}

	url     = system.args[1];
	outfile = system.args[2];

	// Define pageSize only if it was passed as an argument
	// (undefined is being passed as a string 'undefined')
	// otherwise do nothing and let it be flexible
	if (system.args[3] && system.args[3] !== 'undefined') {
		sizeArg = system.args[3];
		size    = sizeArg.split('*');

		if (size.length === 2) {
			page.paperSize = {
				'margin':	{ 'top': 0, 'right': 0, 'bottom': 0, 'left': 0 },
				'width':	size[0],
				'height':	size[1]
			};
		} else {
			page.paperSize = {
				'margin':	{ 'top': 0, 'right': 0, 'bottom': 0, 'left': 0 },
				'format':	sizeArg,
				'orientation':	'portrait'
			};
		}

	// Default to A4 full width
	} else {
		page.viewportSize	= { 'width': Math.round(widthCm * dpcm), 'height': Math.round(heightCm * dpcm) };
		page.paperSize	= { 'width': page.viewportSize.width + 'px', 'height': page.viewportSize.height + 'px', 'orientation': 'portrait', 'margin': '0' };
		page.settings.dpi	= dpi;
		page.zoomFactor	= 1.0;
	}

	if (system.args[4] !== undefined) {
		isReady = function () {
			return document.getElementsByTagName('body')[0].classList.contains('html-ready');
		};
	}

	// Make sure to catch all potential js errors
	page.onError = function (msg, trace) {
		system.stderr.write('Page error: ' + msg + '\n');

		if (trace && trace.length) {
			system.stderr.write('Trace:\n');

			trace.forEach(function (t) {
				system.stderr.write(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '') + '\n');
			});
		}
	};

	page.onResourceError = function (err) {
		system.stderr.write('Unable to load resource (#' + err.id + ' URL: ' + err.url + ')\n');
		system.stderr.write('Error code: ' + err.errorCode + '. Description: ' + err.errorString + '\n');
	};

	phantom.onError = function (msg, trace) {
		system.stderr.write('Phantom error: ' + msg + '\n');

		if (trace && trace.length) {
			system.stderr.write('Trace:\n');

			trace.forEach(function (t) {
				system.stderr.write(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '') + '\n');
			});
		}
		phantom.exit(1);
	};

	page.open(url, function (status) {
		if (status !== 'success') {
			system.stderr.write('Unable to load the url: "' + url + '"\n');
			phantom.exit(1);
			return;
		}

		// Give phantom a few ms to fix all the little things
		timer += 100;
		window.setTimeout(function () {
			function renderPage() {
				if (page.evaluate(isReady)) {
					page.render(outfile, {'format': 'pdf'});
					system.stdout.write(page.content);
					phantom.exit();
				} else if (timer >= 10000) {
					system.stderr.write('Timed out (' + timer + 'ms) waiting for html ready\n');
					phantom.exit(1);
				} else {
					timer += 100;
					window.setTimeout(renderPage, 100);
				}
			}
			renderPage();
		}, 100);
	});
};
run();
