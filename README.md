# larviturltopdf

Render an URL to a PDF using phantomjs.

Example usage:

```javascript
'use strict';

const urltopdf = require('larviturltopdf'),
      fs       = require('fs');

urltopdf('http://www.fsf.org/', function(err, base64str) {
	if (err) throw err;

	// Write to disk
	fs.writeFile('output.pdf', new Buffer(base64str, 'base64'), function(err) {
		if (err) throw err;

		console.log('done');
	});
});
```