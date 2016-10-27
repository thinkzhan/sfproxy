var http = require('http');
var url = require('url');
var console = require('sfconsole')("FromWeb");
var util = require('./util');

// 对于不匹配的放行，代理原请求
module.exports = function responseFromWeb(path, timeout, req, res, next) {
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
	
	util.request(req, res, options, timeout, function (err, data, proxyRes) {
		if (err) {
			res.writeHead(404);
			res.end();
			return;
		}
		res.writeHead(proxyRes.statusCode, proxyRes.headers);
		res.write(data);
		res.end();
	})
}