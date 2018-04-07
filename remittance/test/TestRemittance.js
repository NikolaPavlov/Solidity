var Remittance = artifacts.require("./Remittance.sol");
var assert = require('chai').assert;


contract('Remittance', accounts => {
    let remittance;
    let pass1 = 'pass1';
    let pass2 = 'pass2';
    let wrongPass1 = 'wrongpass1';
    let wrongPass2 = 'wrongpass2';

    beforeEach('should deploy a new Splitter contract', async () => {
        remittance = await Remittance.new({ from: accounts[0] });
    })


    it('starting balance of the contract should be 0', async () => {
        let balance = await remittance.checkContractBalance.call();
        assert.equal(balance.toString(), 0, 'starting balance is not 0');
    });


    it('successfully log correct transfer', async () => {
        let result = await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
        assert.equal(result.logs[0].event, 'LogCreateTransfer');
    });


    it('successfully create transfer', async () => {
        let result = await remittance.createTransfer.call(accounts[1], pass1, pass2, { value: 1000 });
        assert.isTrue(result, 'transfer should return true but instead return false');
    });


    it('can\'t create transfer with zero value eth', async () => {
        try {
            let result = await remittance.createTransfer.call(accounts[1], pass1, pass2, { value: 0 });
            assert.fail(result, true, 'transaction with 0 value passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t create transfer with empty value eth', async () => {
        try {
            let result = await remittance.createTransfer.call(accounts[1], pass1, pass2);
            assert.fail(result, true, 'transaction with empty value passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t create transfer with transferRecipient == msg.sender', async () => {
        try {
            let result = await remittance.createTransfer.call(accounts[0], pass1, pass2);
            assert.fail(result, true, 'transaction with recipient == msg.sender passed');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t create same transfer twice', async () => {
        try {
            let result = await remittance.createTransfer.call(accounts[1], pass1, pass2);
            let result1 = await remittance.createTransfer.call(accounts[1], pass1, pass2);
            assert.fail(result1, true, 'create same transfer twice successfully');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    // can't create transfer with empty address


    it('can withdraw funds with correct passwords from the correct address', async () => {
        await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
        let result = await remittance.withdrawFunds.call(pass1, pass2, { from: accounts[1] });
        assert.isTrue(result, 'can\' withdraw successfully with correct inputs')
    });

    // it('can\'t withdraw funds with only one password from correct address', async () => {
    //     await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
    //     let result = await remittance.withdrawFunds.call(pass1, { from: accounts[1] });
    //     assert.isTrue(result, 'can\' withdraw successfully with correct inputs')
    // });

    it('can\'t withdraw funds with empty passwords from the correct address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
            let result = await remittance.withdrawFunds.call('', '', { from: accounts[1] });
            assert.fail(result, true, 'can\'t withdraw successfully with empty passwords');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t withdraw funds with wrong passwords from the correct address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
            let result = await remittance.withdrawFunds.call(wrongPass1, wrongPass2, { from: accounts[1] });
            assert.fail(result, true, 'can\'t withdraw successfully with wrong passwords');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t withdraw funds with correct passwords from another address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: 1000 });
            let result = await remittance.withdrawFunds.call(pass1, pass2, { from: accounts[3] });
            assert.fail(result, true, 'can\'t withdraw successfully from wrong address');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    // TODO: rever tests








    it('owner can kill the contract', async () => {
        let result = await remittance.killTheContract();
        // check if LogSelfDestruct event is fire before selfdestruct()
        assert.equal(result.logs[0].event, 'LogSelfDestruct');
    });


    it('not owner can\'t kill the contract', async () => {
        try {
            res = await remittance.killTheContract({ from: accounts[3] });
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });

})
