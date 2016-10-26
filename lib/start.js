var connect = require('connect');
var http = require('http');
var console = require('sfconsole')("START");

var redirect = require('./redirect');
module.exports = {
  run: function (config) {
    var port = config.port || 3037,
      timeout = config.timeout || 5000,
      responseRule = config.list;

    var app = connect();
    if (!responseRule) {
      console.err('should specify a config!');
      return;
    }
    app.use(redirect(responseRule, timeout));
    http.createServer(function (res, req) {
      res.type = "http";
      app(res, req);
    }).listen(port);
    console.log('proxy server listen on port: ' + port);

  }
}