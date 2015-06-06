'use strict';

var http      = require('http')
var url       = require('url')
var config    = require('season').readFileSync('./config.cson')
var pkg       = require('./utils/package')
var connect   = require('connect')
var httpProxy = require('http-proxy')

var PORT    = config.port || process.env.PORT || 3000
var TARGET  = config.target
var DEBUG   = process.env.NODE_ENV ='development' || config.verbose

/**
 * HTTP Proxy Server
 */
var app   = connect()
var proxy = httpProxy.createProxyServer({
    target : TARGET,
    headers : {
      // Mandatory since HTTP/1.1
      // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.23
      host : url.parse(TARGET).hostname
    }
  })

/**
 * Forward proxy to the target
 */
app.use(function(req, res, next) {
  proxy.web(req, res)

  res.setHeader('x-powered-by', 'astromo.io')
  res.setHeader('x-sally-port-version', pkg.version)
})

/**
 * Astromo Metrics middleware layer
 */
proxy.on('proxyRes', function (proxyRes, req, res) {

  app.use(require('sallyport-metrics')({
    metricsUrl  : 'http://127.0.0.1:8086',
    host        : TARGET,
    debug       : DEBUG
  }))

})

/**
 * Error handling for proxy
 */
proxy.on('error', function(err, req, res) {

  res.writeHead(500, {
    'Content-Type' : 'application/json'
  })

  res.end(JSON.stringify({
    error : {
      code    : 500,
      message : err.message
    }
  }))

})

http.createServer(app).listen(PORT)
