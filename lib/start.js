var connect = require('connect');
var http = require('http');
var https = require('https');
var net = require('net');
var path = require('path');
var fs = require('fs');

var console = require('sfconsole')("START");
var redirect = require('./redirect');
var privateKeyFile = path.join(__dirname, '..', 'key', 'privatekey.pem');
var certificateFile = path.join(__dirname, '..', 'key', 'certificate.pem');
var HTTPS_PORT = 0;
var httpServer, httpsServer;
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
            httpServer = http.createServer(function (res, req) {
                res.type = "http";
                app(res, req);
            }).listen(port);
            httpsServer = https.createServer({
                key: fs.readFileSync(privateKeyFile),
                cert: fs.readFileSync(certificateFile)
            }, function (req, res) {
                req.type = 'https';
                app(req, res);
            });
            httpsServer.on('listening', function () {
                HTTPS_PORT = httpsServer.address().port;
            });
            httpsServer = httpsServer.listen(HTTPS_PORT);
            proxyHttps()
            console.info('proxy server listen on port: ' + port);
        }
    }

function proxyHttps() {
    httpServer.on('connect', function (req, socket, upgradeHead) {
        var netClient = net.createConnection(HTTPS_PORT);
        netClient.on('connect', function () {
            console.info('connect to https server successfully!');
            socket.write(
                "HTTP/1.1 200 Connection established\r\nProxy-agent: Netscape-Proxy/1.1\r\n\r\n"
            );
        });
        socket.on('data', function (chunk) {
            netClient.write(chunk);
        });
        socket.on('end', function () {
            netClient.end();
        });
        socket.on('close', function () {
            netClient.end();
        });
        socket.on('error', function (err) {
            console.err('socket error ' + err.message);
            netClient.end();
        });
        netClient.on('data', function (chunk) {
            socket.write(chunk);
        });
        netClient.on('end', function () {
            socket.end();
        });
        netClient.on('close', function () {
            socket.end();
        });
        netClient.on('error', function (err) {
            console.err('netClient error ' + err.message);
            socket.end();
        });
    });
};

process.on('uncaughtException', function(err){
  console.err('uncaughtException: ' + err.message);
});
