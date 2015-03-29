'use strict';

var http      = require('http'),
    connect   = require('connect'),
    httpProxy = require('http-proxy');

var port   = process.env.PORT || 3000;
var TARGET = 'http://google.be'; // set customer's target

// Basic HTTP Proxy Server
var app   = connect();
var proxy = httpProxy.createServer({ target: TARGET });

/**
 * Astromo Metrics middleware layer
 */
app.use(require('astromo-metrics')({
  metricsUrl  : 'http://127.0.0.1:8086',
  host        : TARGET,
  debug       : true
}));

/**
 * Forward proxy to the target
 */
app.use(function (req, res) {
  proxy.web(req, res);
});

http.createServer(app).listen(port);
