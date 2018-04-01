var assert = require('chai').assert;
var Splitter = artifacts.require('./contracts/Splitter.sol');


// describe('Testing Outter desc', function() {
//     it('testing forTesting', function() {
//         assert.equal(Splitter.forTesting(), 'gogo');
//     })
// })


contract('Splitter', function (accounts) {

    // starting balance of the contract should be 0
    it('test1-starting balance of the contract 0', function() {
        Splitter.deployed().then(function(instance){
            return instance.checkContractBalance.call();
        }).then(function(balance){
            assert.equal(balance.toNumber(), 1, 'Starting balance should be 0');
        });
    });

    // successfully split transaction with even amount
    // successfully split transaction with odd amount, 1 return to sender
    // can't perform split with 0 value transaction
    // can't perform split with one missing address
    // can't perform split with two missing address
    // can't perform split if one of the output accounts is the sender account
    // only owner can kill the contract
    // other users can't kill the contract
// })
