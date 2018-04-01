// var assert = require('mocha');
var assert = require('chai').assert;
var Splitter = artifacts.require('./contracts/Splitter.sol');


describe('Testing Outter desc', function() {
    it('testing forTesting', function() {
        assert.equal(Splitter.forTesting(), 'gogo');
    })
})
