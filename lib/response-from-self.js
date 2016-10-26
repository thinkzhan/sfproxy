var http = require('http');
var console = require('sfconsole')("RequestSelf");
module.exports = function responseFromSelf(req, res, timeout, cb) {
	var responseTimeout;
	var requestTimeout;

	requestTimeout = setTimeout(function () {
		console.err('Request timeout for ' + req.method + ' ' + req.url);
		requestTimeout = null;
		proxyRequest.abort();
		cb(new Error('Request timeout'));
	}, timeout);

	var hostArr = req.headers['host'];
	var port = hostArr.split(':')[1];
	//console.info('port: ' + port);
	var proxyRequest = http.request({
		host: hostArr,
		port: port || 80,
		path: req.url,
		method: req.method,
		headers: req.headers
	}, function (proxyResponse) {
		if (requestTimeout) {
			clearTimeout(requestTimeout);
		}

		responseTimeout = setTimeout(function () {
			console.err('Response timeout for ' + req.method + ' ' + req.url);
			responseTimeout = null;
			clearTimeout(responseTimeout);
			proxyRequest.abort();

			cb(new Error('Response timeout'));
		}, timeout);

		// res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
		// proxyResponse.pipe(res);
		var buffers = [];
		proxyResponse.on('data', function (chunk) {
			buffers.push(chunk);
		});

		proxyResponse.on('end', function () {
			console.log('Get response of ' + req.method + ' ' + req.url);
			if (responseTimeout) {
				clearTimeout(responseTimeout);
			}

			cb(null, Buffer.concat(buffers), proxyResponse);
		});
	});
	//req.pipe(proxyRequest);

	proxyRequest.on('error', function (err) {
		console.err('url: ' + req.url);
		console.err('msg: ' + err.message);
		if (requestTimeout) {
			clearTimeout(requestTimeout);
		}

		cb(new Error('Request error'));

	});
	proxyRequest.end();
}