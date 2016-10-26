var http = require('http');
var fs = require('fs');
var mime = require('mime');
var os = require('os');
var path = require('path');

var console = require('sfconsole')("FromLocal");

module.exports = function responseFromLocalFile(filepath, req, res, next) {
	if (!isAbsolutefilepath(filepath)) {
		filepath = path.join(process.cwd(), filepath);
	}
	var stat = fs.statSync(filepath);
	res.statusCode = 200;
	res.setHeader('Content-Length', stat.size);
	res.setHeader('Content-Type', mime.lookup(filepath));
	res.setHeader('Server', 'nproxy');
	fs.createReadStream(filepath).pipe(res);
	console.warn('replacedby: local file ' + filepath);
}

function isAbsolutefilepath(filepath) {
	if (typeof filepath !== 'string') {
		return false;
	}

	if (os.platform && os.platform() === 'win32') {
		return filepath.indexOf(':') !== -1;
	} else {
		return filepath.indexOf(filepath.sep) === 0;
	}
}