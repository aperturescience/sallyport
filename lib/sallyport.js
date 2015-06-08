'use strict';

var http       = require('http')
var url        = require('url')
var util       = require('util')
var _          = require('lodash')

var pkg        = require('../utils/package')
var connect    = require('connect')
var httpProxy  = require('http-proxy')

function SallyPort(options) {

  this.options = _.defaults(options || {}, {
    verbose : false
  })

  this._proxyServer = this.createProxyServer(options)
  this._httpServer  = this.createHTTPServer(options)

  this._httpServer.options = this.options

  return this._httpServer
}

SallyPort.prototype.createProxyServer = function(options) {

  if (!options.target)
    throw new Error('Must provide a proper URL as target')

  var proxy = httpProxy.createProxyServer({
    target : options.target,
    headers : {
      // Mandatory since HTTP/1.1
      // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.23
      host : url.parse(options.target).hostname
    }
  })

  return proxy
}

SallyPort.prototype.createHTTPServer = function(options) {
  var self = this
  var app  = connect()

  self.beforeProxyMiddleware(app)

  // Web Proxy
  app.use(function(req, res, next) {

    self._proxyServer.on('error', function(err) {
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
    })

    self._proxyServer.on('proxyRes', function(proxyRes, req, res) {
      next()
    })

    self._proxyServer.web(req, res)
  })

  // Web Proxy Response middleware
  self.afterProxyMiddleware(app)

  return http.createServer(app)
}

SallyPort.prototype.afterProxyMiddleware = function(app) {
  var self = this

  if (!self.options.middleware) return

  self.options.middleware.forEach(function(layer) {

    var layerName = typeof layer === 'string' ? layer : Object.keys(layer)[0]
    layer = typeof layer === 'string' ? layer : layer[layerName]

    switch(layerName) {

      case 'powered-by':
        app.use(self.poweredBy)
        break

      case 'metrics':
        app.use(require('sallyport-metrics')({
          metricsUrl  : layer.url,
          host        : self.options.target,
          debug       : layer.debug
        }))
        break

    }

  })
}

SallyPort.prototype.beforeProxyMiddleware = function(app) {
  var self = this

  if (!self.options.middleware) return
}

/**
 * Powered-By middleware
 *
 * Adds additional information and debug headers to the HTTP response
 */
SallyPort.prototype.poweredBy = function(req, res, next) {
  res.setHeader('x-powered-by', 'astromo.io')
  res.setHeader('x-sally-port-version', pkg.version)

  next()
}

module.exports = SallyPort