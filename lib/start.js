var connect = require('connect');
var http = require('http');
var console = require('sfconsole')("START");

var redirect = require('./redirect');
module.exports = {
  run: function (config) {
    var port = config.port || 3037,
      timeout = config.timeout || 5000,
      responseRule = config.rule;

    var app = connect();
    if (responseRule) {
      app.use(redirect(responseRule, timeout));
    }
    // http.createServer(function (request, response) {
    //   var proxyRequest = http.request({
    //     host: request.headers['host'],
    //     port: 80,
    //     path: request.url,
    //     method: request.method,
    //     headers: request.headers
    //   }, function (proxyResponse) {
    //     console.log(request.url);
    //     response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    //     proxyResponse.pipe(response);
    //   });
    //   request.pipe(proxyRequest);
    // }).listen(port);
    http.createServer(function (res, req) {
      res.type = "http";
      app(res, req);
    }).listen(port);
    console.log('proxy server listen on port: ' + port);
  }
}