var Splitter = artifacts.require("./Splitter.sol");
var assert = require('chai').assert;


contract('Splitter async', accounts => {
    let splitter;

    beforeEach('should deploy a new Splitter contract', async () => {
        splitter = await Splitter.new({ from: accounts[0] })
    })


    it('starting balance of the contract should be 0', async () => {
        let balance = await splitter.checkContractBalance();
        assert.equal(balance.toString(), 0, 'starting balance is not 0');
    });


    it('successfully split transaction with even incoming amount', async () => {
        let value = 10000 // 10000 wei
        let expected1Value = 100000000000000005000 // 100 Eth + 5000 wei
        let expected2Value = 100000000000000005000 // 100 Eth + 5000 wei

        let tx = await splitter.split(accounts[1], accounts[2], { from: accounts[0], value: value })
        let account1Funds = await splitter.checkBalanceOf(accounts[1])
        let account2Funds = await splitter.checkBalanceOf(accounts[2])

        assert.equal(account1Funds.toNumber(), expected1Value);
        assert.equal(account2Funds.toNumber(), expected2Value);
    })


    // need to check for 1 wei return to sender
    // or change the split function to give one of the two addresses 1wei more on split
    it('successfully split transaction with odd incoming amount', async () => {
        let value = 10001 // 10000 wei
        let expected1Value = 100000000000000010000
        let expected2Value = 100000000000000010000 // 100 Eth + 5000 wei + 5000 wei

        let tx = await splitter.split(accounts[1], accounts[2], { from: accounts[0], value: value })
        let account1Funds = await splitter.checkBalanceOf(accounts[1])
        let account2Funds = await splitter.checkBalanceOf(accounts[2])

        assert.equal(account1Funds.toNumber(), expected1Value);
        assert.equal(account2Funds.toNumber(), expected2Value);
    })


    it('should not allow split with 0 value in the transaction', async () => {
        try {
            let res = await splitter.split(accounts[1], accounts[2], { value: 0 });
            assert.fail(res, true, 'transaction with 0 value passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    })


    it('should not allow split with empty value in the transaction', async () => {
        try {
            let res = await splitter.split(accounts[1], accounts[2]);
            assert.fail(res, true, 'transaction with empty value passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    })


    it('should not allow split with sender account is one of the output accounts', async () => {
        try {
            let res = await splitter.split(accounts[0], accounts[1], {value: 10});
            assert.fail(res, true, 'transaction with sender is one of the ouput accounts passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    })


    it('owner can kill the contract', async () => {
        let result = await splitter.killTheContract();
        // check if LogSelfDestruct event is fire before selfdestruct()
        assert.equal(result.logs[0].event, 'LogSelfDestruct');
    });


    it('not owner can\'t kill the contract', async () => {
        try {
            await splitter.killTheContract({ from: accounts[3] });
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    // TODO:
        // successfully split transaction with odd amount, 1 return to sender
        // can't perform split with 0 value transaction
        // can't perform split with empty value in transaction
    // can't perform split with one missing address
    // can't perform split with two missing address
        // can't perform split if one of the output accounts is the sender account
        // only owner can kill the contract
        // other users can't kill the contract

})
