'use strict';

var http       = require('http')
var url        = require('url')
var util       = require('util')

var pkg        = require('../utils/package')
var connect    = require('connect')
var httpProxy  = require('http-proxy')
var EE         = require('events').EventEmitter

function SallyPort(options) {
  EE.call(this)

  options       = options || {}
  options.debug = process.env.NODE_ENV = 'development' || options.verbose || false
  this.options  = options

  this._proxyServer = this.createProxyServer(options)
  this._httpServer  = this.createHTTPServer(options)

  this._httpServer._proxyServer = this._proxyServer

  return this._httpServer
}
require('util').inherits(SallyPort, EE)

SallyPort.prototype.createProxyServer = function(options) {

  if (!options.target)
    return this.emit('error', new Error('Must provide a proper URL as target'))

  var proxy = httpProxy.createProxyServer({
      target : options.target,
      headers : {
        // Mandatory since HTTP/1.1
        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.23
        host : url.parse(options.target).hostname
      }
    })

  proxy.on('error', function(err, req, res) {

    res.writeHead(500, {
      'Content-Type' : 'application/json'
    })

    res.end(JSON.stringify({
      error : {
        status  : 500,
        code    : err.code,
        message : util.format('Unable to reach target server: `%s`', options.target)
      }
    }))

    // TODO: log error via Bunyan

  })

  return proxy
}

SallyPort.prototype.createHTTPServer = function(options) {
  var self = this
  var middleware = connect()

  self._proxyServer.on('proxyRes', function(proxyRes, req, res) {

    self.poweredBy.call(this, req, res)

    var metrics = require('sallyport-metrics')({
      metricsUrl  : 'http://127.0.0.1:8086',
      host        : options.target,
      debug       : options.debug
    })

    // metrics.call(this, req, res, function() {})
  })

  // /!\ always call the web proxy last!
  middleware.use(function(req, res, next) {
    self._proxyServer.web(req, res)
  })

  return http.createServer(middleware)
}

SallyPort.prototype.listen = function() {
  this._httpServer.listen(this.options.port)

  return this
}

SallyPort.prototype.poweredBy = function(req, res) {
  res.setHeader('x-powered-by', 'astromo.io')
  res.setHeader('x-sally-port-version', pkg.version)
}

module.exports = SallyPort