var path = require('path');
var http = require('http');
var os = require('os');
var console = require('sfconsole')("util");

module.exports = {
	isAbsolutePath: function (path) {
		if (typeof path !== 'string') {
			return false;
		}

		if (os.platform && os.platform() === 'win32') {
			return path.indexOf(':') !== -1;
		} else {
			return path.indexOf(path.sep) === 0;
		}
	},

	request: function (req, res, options, timeout, cb) {
		var that = this;
		if (req.method == 'POST') {
			var body = '';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function () {
				options['data'] = body;
				that._request(req, res, options, timeout, cb)
			});
		} else {
			that._request(req, res, options, timeout, cb)
		}
	},
	// 内部
	_request: function (req, res, options, timeout, cb) {
		var responseTimeout;
		var requestTimeout;

		requestTimeout = setTimeout(function () {
			console.err('Request timeout for ' + req.method + ' ' + req.url);
			requestTimeout = null;
			proxyRequest.abort();
			cb(new Error('Request timeout'));
		}, timeout);

		var proxyRequest = http.request(options, success);
		//req.pipe(proxyRequest);
		if (req.method == 'POST') {
			console.log(options.data);
			proxyRequest.write(options.data)
		}


		proxyRequest.on('error', function (err) {
			console.err('url: ' + req.url);
			console.err('msg: ' + err.message);
			if (requestTimeout) {
				clearTimeout(requestTimeout);
			}

			cb(new Error('Request error'));

		});
		proxyRequest.end();

		function success(proxyResponse) {
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
		};
	}


}