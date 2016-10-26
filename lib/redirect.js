var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var os = require('os');

var console = require('sfconsole')("Redirect");
var responseFromWeb = require('./response-from-web');
var responseFromLocalFile = require('./response-from-localfile');
var responseFromSelf = require('./response-from-self');

// 解析responseRule 
// 文件？ json =》to json 
// 请求匹配？遍历json匹配
// 匹配到res重写
// 没有匹配到 原请求

module.exports = function (responseRule, timeout) {

	return function redirect(req, res, next) {

		var rules = parseRules(responseRule);
		mapRules(rules, req, res, next);

	}


	function parseRules(responseRule) {
		var rules = '';

		if (!fs.existsSync(responseRule)) {
			console.err('config file doesn\'t exist!');
			return;
		}
		if (!isAbsolutePath(responseRule)) {
			responseRule = path.join(process.cwd(), responseRule);
		}

		var module = require(responseRule);
		delete require.cache[require.resolve(responseRule)];

		return module;

	}

	function isAbsolutePath(path) {
		if (typeof path !== 'string') {
			return false;
		}

		if (os.platform && os.platform() === 'win32') {
			return path.indexOf(':') !== -1;
		} else {
			return path.indexOf(path.sep) === 0;
		}
	}


	function mapRules(rules, req, res, next) {
		var httpRxg = /^http/;
		var imgRxg = /(\.(img|png|gif|jpg|jpeg))$/i;

		var matched = false;

		for (var i = 0; i < rules.length; i++) {
			var d = rules[i];

			if (typeof d.url !== 'string' && !(d.url instanceof RegExp)) {
				console.err('pattern must be regexp or string !');
				return;
			}

			if (new RegExp(d.url).test(req.url)) {
				matched = true;
				console.warn(" matched : " + req.url);
				var resTmp = d.res;

				if (typeof resTmp === "string") {

					if (httpRxg.test(resTmp)) {

						responseFromWeb(resTmp, req, res, next);
					} else if (fs.statSync(resTmp).isFile()) {

						responseFromLocalFile(resTmp, req, res, next);
					} else {

						console.warn('can not find file, response with string!');
						res.write(resTmp);
						res.end();
					}
				} else if (typeof resTmp === "object") {
					console.warn('replacedby: json data');
					res.write(JSON.stringify(resTmp));
					res.end();
				}
				break;

			}
		};

		if (!matched) { // 未匹配到
			responseFromSelf(req, res, timeout, function (err, data, proxyRes) {
				if (err) {
					res.writeHead(404);
					res.end();
					return;
				}
				res.writeHead(proxyRes.statusCode, proxyRes.headers);
				res.write(data);
				res.end();
			});
		}


	}



}