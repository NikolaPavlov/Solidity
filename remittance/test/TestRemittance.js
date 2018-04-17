var Remittance = artifacts.require("./Remittance.sol");
var assert = require('chai').assert;


contract('Remittance', accounts => {
    let remittance;
    let duration = 10; // blocks
    let pass1 = 'pass1';
    let pass2 = 'pass2';
    let wrongPass1 = 'wrongpass1';
    let wrongPass2 = 'wrongpass2';
    let amount = 1000; // wei
    let creatorAcc = accounts[0];
    let notCreatorAcc = accounts[3];
    let recivingAcc = accounts[1];


    // const increaseTime = addSeconds => {
    //     web3.currentProvider.send({
    //         jsonrpc: "2.0",
    //         method: "evm_increaseTime",
    //         params: [addSeconds], id: 0
    //     })
    // }

    const mineOneBlock = async () => {
        await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: 0,
        })
    }

    beforeEach('should deploy a new Splitter contract', async () => {
        remittance = await Remittance.new(duration, { from: accounts[0] });
    });


    it('starting balance of the contract should be 0', async () => {
        let balance = await remittance.checkContractBalance.call();
        assert.equal(balance.toNumber(), 0, 'starting balance is not 0');
    });


    it('successfully log correct transfer', async () => {
        let result = await remittance.createTransfer(accounts[1], pass1, pass2, { value: amount });
        assert.equal(result.logs[0].event, 'LogCreateTransfer');
    });


    it('successfully create transfer', async () => {
        let result = await remittance.createTransfer.call(accounts[1], pass1, pass2, { value: amount });
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


    it('can withdraw funds with correct passwords from the correct address', async () => {
        // 1. Create the transfer
        await  remittance.createTransfer(recivingAcc, pass1, pass2, { from: creatorAcc, value: amount });
        // 2. The recipient withdraw the transfer
        result = await remittance.withdrawFunds.call(pass1, pass2, { from: recivingAcc });
        assert.isTrue(result, 'the transfer withdraw fail with correct inputs');
    });


    it('can\'t withdraw funds with empty passwords from the correct address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: amount });
            let result = await remittance.withdrawFunds.call('', '', { from: accounts[1] });
            assert.fail(result, true, 'can\'t withdraw successfully with empty passwords');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t withdraw funds with wrong passwords from the correct address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: amount });
            let result = await remittance.withdrawFunds.call(wrongPass1, wrongPass2, { from: accounts[1] });
            assert.fail(result, true, 'can\'t withdraw successfully with wrong passwords');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('can\'t withdraw funds with correct passwords from another address', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { value: amount });
            let result = await remittance.withdrawFunds.call(pass1, pass2, { from: accounts[3] });
            assert.fail(result, true, 'can withdraw successfully from wrong address');
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    // TODO: need fixes
    it('can revert funds with correct passwords from correct address when deadline is expired', async () => {
        // create the transfer
        result1 = await remittance.createTransfer.call(recivingAcc, pass1, pass2, { from: creatorAcc, value: amount });
        assert.isTrue(result1, 'create transfer with correct input fail');

        console.log('start mining on:' + web3.eth.blockNumber);
        // mine [DURATION] numbers of blocks
        for (var i = 0, len = duration+1; i < len; i++) {
            mineOneBlock();
        }
        console.log('end mining on:' + web3.eth.blockNumber);

        result = await remittance.refundTransfer.call(pass1, pass2, { from: creatorAcc });
        assert.isTrue(result, 'can\'t revert with correct input');
    });


    it('can\'t revert funds with correct passwords from correct address when deadline isn\'t expired', async () => {
        await remittance.createTransfer(accounts[1], pass1, pass2, { from: creatorAcc, value: amount });
        try {
            result = await remittance.refundTransfer.call(pass1, pass2, { from: creatorAcc } );
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('other addresses than creator address can\'t refund transfer with correct passwords', async () => {

        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { from: creatorAcc, value: amount });
            result = await remittance.refundTransfer.call(pass1, pass2, { from: notCreatorAcc } );
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


    it('creator address can\'t refund transfer with wrong passwords', async () => {
        try {
            await remittance.createTransfer(accounts[1], pass1, pass2, { from: creatorAcc, value: amount });
            result = await remittance.refundTransfer.call(wrongPass1, pass2, { from: creatorAcc } );
        }
        catch(err) {
            assert.include(err.message, 'revert');
        }
    });


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
