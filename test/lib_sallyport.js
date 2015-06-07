'use strict';

var expect  = require('chai').expect
var request = require('supertest')

describe('lib/sallyport.js', function() {
  var SallyPort = require('../lib/sallyport')

  describe('#new()', function() {

    it('should throw an error when options are not defined', function() {
      expect(function() {
        new SallyPort()
      }).to.throw(Error)
    })

    it('should return an error when a bad target URL is defined', function(done) {
      var sp = new SallyPort({ target : 'does.not.exist' }).listen(3000)
      request(sp).get('/').expect(500, done)
    })

  })

})