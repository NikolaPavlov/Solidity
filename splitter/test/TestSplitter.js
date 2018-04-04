var assert = require('chai').assert;
var Splitter = artifacts.require('./contracts/Splitter.sol');


// describe('Testing Outter desc', function() {
//     it('testing forTesting', function() {
//         assert.equal(Splitter.forTesting(), 'gogo');
//     })
// })


contract('Splitter', function(accounts) {

    ownerAcc = accounts[0];
    acc1 = accounts[1];
    acc2 = accounts[2];
    // result = web3.eth.getBalance(acc1);
    // console.log(result.plus(9).toString());
    // console.log()

    // beforeEach('setup contract for each test', async function() {
        //pass
    // });

    // starting balance of the contract should be 0
    // it('test1-starting balance of the contract should be 0', function() {
    //     Splitter.deployed().then(function(instance) {
    //         return instance.checkContractBalance.call();
    //     }).then(function(balance){
    //         assert.equal(balance.valueOf(), 0, 'Starting balance should be 0');
    //     });
    // });

    // successfully split transaction with even amount
    it('test2-split deposit with even amount', function() {
        var acc1StartBalance = accounts[1];
        var acc2StartBalance = accounts[2];
        var acc1EndBalance = accounts[1];
        var acc2EndBalance = accounts[2];
        amount = 10000000000;

        return Splitter.deployed().then(function(instance) {
            meta = instance;
            return meta.checkBalanceOf.call(accounts[1]);
        }).then(function(balance) {
            // console.log(balance.toNumber());
            acc1StartBalance = balance.toNumber();
            return meta.split(acc1, acc2, {from: ownerAcc, value: amount})
        }).then(function(result) {
            // expect(result).to.be.true;
            return meta.checkBalanceOf.call(accounts[1]);
        }).then(function(balance) {
            acc1EndBalance = balance.toNumber();
            // console.log('final balance:' + balance.toString())
            assert.equal(acc1StartBalance + (amount / 2), acc1EndBalance, 'nop');
            console.log('1:' + acc1StartBalance + (amount / 2));
            console.log('2:' + acc1EndBalance);
        })
    });


    // successfully split transaction with odd amount, 1 return to sender
    // can't perform split with 0 value transaction
    // can't perform split with one missing address
    // can't perform split with two missing address
    // can't perform split if one of the output accounts is the sender account
    // only owner can kill the contract
    // other users can't kill the contract
})
