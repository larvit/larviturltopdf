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