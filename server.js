'use strict';

var http      = require('http'),
    connect   = require('connect'),
    httpProxy = require('http-proxy');

var TARGET = 'http://google.be'; // set customer's target

// Basic HTTP Proxy Server
var app   = connect();
var proxy = httpProxy.createServer({ target: TARGET });

/**
 * Astromo Metrics middleware layer
 */
app.use(require('astromo-metrics')({
  host  : TARGET,
  debug : true
}));

/**
 * Forward proxy to the target
 */
app.use(function (req, res) {
  proxy.web(req, res);
});

http.createServer(app).listen(3000);
