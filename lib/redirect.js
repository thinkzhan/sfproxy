var _ = require('lodash');
var http = require('http');
var url = require('url');
var path = require('path');
var console = require('sfconsole')("Redirect");
var responseFromWeb = require('./response-from-web');

// 解析responseRule 
// 文件？ json =》to json 
// 请求匹配？遍历json匹配
// 匹配到res重写
// 没有匹配到 原请求

module.exports = function (responseRule, timeout) {

	return function redirect(req, res, next) {

		var rules = parseRules(responseRule);
		var matched = mapRules(rules, req, res, next);


	}

	function processUrl(req) {
		var hostArr = req.headers.host.split(':');
		var hostname = hostArr[0];
		var port = hostArr[1];

		var parsedUrl = url.parse(req.url, true);

		parsedUrl.protocol = parsedUrl.protocol || req.type + ":";
		parsedUrl.hostname = parsedUrl.hostname || hostname;

		if (!parsedUrl.port && port) {
			parsedUrl.port = port;
		}

		return url.format(parsedUrl);
	}

	function parseRules(responseRule) {
		var rules = [{
			url: "/user",
			res: {
				"errorMessage": "success",
				"data": {
					"uid": 143330697,
					"userName": "战绪森",
					"nickName": "测试",
					"avatar": "http://img.uc.focus.cn/c_zoom,w_300,h_300/143330696_1473733757351.jpg",
					"birthDay": "1903-12-28",
					"gender": 1,
					"mobile": "13141287154",
					"changeStatus": 1
				},
				"errorCode": 0
			}
		}];

		return rules;

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
					//console.err(path.resolve(process.cwd(), resTmp));
					if (httpRxg.test(resTmp)) {

						responseFromWeb(resTmp, req, res, next);
					} else {
						console.err(resTmp);
						res.write(resTmp);
						res.end();
					}
				} else if (typeof resTmp === "object") {

				}
				break;

			}
		};

		if (!matched) { // 未匹配到
			requestReal(req, res, function (err, data, proxyRes) {
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

	function requestReal(req, res, cb) {
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

}