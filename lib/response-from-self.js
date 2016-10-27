var http = require('http');
var console = require('sfconsole')("RequestSelf");
var util = require('./util');
module.exports = function responseFromSelf(req, res, timeout, cb) {

	var remoteHost = req.headers.host;
	var port = remoteHost.split(':')[1];
	var options = {
		host: remoteHost,
		port: port || 80,
		path: req.url,
		method: req.method,
		headers: req.headers
	};
	util.request(req, res, options, timeout, cb)

}