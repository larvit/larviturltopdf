# larviturltopdf

Render an URL to a PDF using phantomjs.

Example usage:

```javascript
'use strict';

const urltopdf = require('larviturltopdf'),
      fs       = require('fs');

urltopdf('http://www.fsf.org/', function(err, pdfBuffer) {
	if (err) throw err;

	// Write to disk
	fs.writeFile('output.pdf', pdfBuffer, function(err) {
		if (err) throw err;

		console.log('done');
	});
});
```

## Wait for dynamic content

In case javascript is used to alter the DOM, you can tell the renderer to wait until the class "html-ready" exists in the body tag.

```javascript
'use strict';

const urltopdf = require('larviturltopdf'),
      fs       = require('fs');

urltopdf({'url': 'http://www.fsf.org/', 'waitForHtmlReadyClass': true}, function(err, pdfBuffer) {
	if (err) throw err;

	// Do something with pdfBuffer
});
```