'use strict';

var expect = require('chai').expect

describe('utils/package.js', function() {
  var pkg = require('../utils/package')

  describe('#version', function() {
    it('should return the version in package.json', function() {
      expect(pkg.version).to.equal('v' + require('../package.json').version)
    })
  })

})