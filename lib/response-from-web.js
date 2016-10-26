var http = require('http');
var url = require('url');
var console = require('sfconsole')("FromWeb");
var proxyRequest;

module.exports = function responseFromWeb(path, req, res, next) {
	console.warn('repalceby: web url ' + path);

	var remoteHost = url.parse(path).host;
	// req.headers && (req.headers.host = remoteHost);
	var port = remoteHost.split(':')[1];

	var options = {
		host: remoteHost,
		port: port || 80,
		path: path,
		method: req.method,
		headers: req.headers
	};

	function success(proxyResponse) {
		var buffers = [];
		proxyResponse.on('data', function (chunk) {
			buffers.push(chunk);
		});

		proxyResponse.on('end', function () {
			console.warn('Get response of ' + req.method + ' ' + path);
			res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
			res.write(Buffer.concat(buffers));
			res.end();
		});

	};

	if (req.method == 'POST') {
		var body = '';
		req.on('data', function (data) {
			body += data;
		});
		req.on('end', function () {
			options['data'] = body;
			proxyRequest = http.request(options, success);
		});
	} else {
		proxyRequest = http.request(options, success);
	}

	proxyRequest.on('error', function (err) {
		console.err('url: ' + req.url);
		console.err('msg: ' + err.message);
		if (err) {
			res.writeHead(404);
			res.end();
			return;
		}
	});

	proxyRequest.end();
}