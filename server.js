'use strict';

var SallyPort = require('./lib/sallyport')
var config    = require('season').readFileSync('./config.cson')
var port      = config.port || process.env.PORT || 3000

try {

  var sallyPort = new SallyPort(config)
  sallyPort.listen(port)

} catch(ex) {
  console.trace(ex)
}
