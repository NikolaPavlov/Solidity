// var assert = require('mocha');
var chai = require('chai');
var assert = chai.assert;

var foo = 1;

// describe is used for grouping individual tests
describe('Splitter Test', function () {
    it('test foo = 1', function() {
        assert.equal(foo, 1);
    });
})
