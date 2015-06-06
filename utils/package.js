'use strict';

var Package = function() {
  this._package = require('../package.json')
}

var p = new Package()

Object.defineProperties(p, {
  'version' : {
    get: function() {
      return 'v' + this._package.version
    }
  }
})

module.exports = p;