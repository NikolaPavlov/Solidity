import testHelper from './helpers';
import EVMRevert from './EVMRevert';
// let assert = require('chai').assert;
// let expect = require('chai').assert;

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Remittance = artifacts.require('./Remittance.sol');


contract('Remittance', accounts => {
    let remittance = null;
    const pass1 = 'pass1';
    const pass2 = 'pass2';
    const wrongPass1 = 'wrongpass1';
    const wrongPass2 = 'wrongpass2';
    const duration = 10;
    const amount = 1000; // wei
    const creatorAcc = accounts[0];
    const recivingAcc = accounts[1];
    const otherAcc = accounts[3];


    const mineOneBlock = async () => {
        await web3.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: 0,
        })
    }


    beforeEach('beforeEach', async function () {
        this.remittance = await Remittance.new({ from: creatorAcc });
        this.correctTransfer = await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: amount});
    });

    it('starting balance of the contract should be 0', async function () {
        let balance = await this.remittance.checkContractBalance();
        assert.equal(balance.toNumber(), 0, 'starting balance is not 0');
    });

    it('successfully create transfer', async function () {
        assert.isTrue(this.correctTransfer, 'transfer should return true but instead return false');
    });

    // TODO: quickfix
    it('can\'t create transfer with zero value eth', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: 10}).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create transfer with empty value eth', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create transfer with transferRecipient == msg.sender', async function () {
        await this.remittance.createTransfer.call(creatorAcc, pass1, pass2, duration, { value: amount }).should.be.rejectedWith(EVMRevert);
    });


    // it('can\'t create same transfer twice', async () => {
    //     try {
    //         let result = await remittance.createTransfer.call(recivingAcc, pass1, pass2, duration);
    //         let result1 = await remittance.createTransfer.call(recivingAcc, pass1, pass2, duration);
    //         assert.fail(result1, true, 'create same transfer twice successfully');
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('can withdraw funds with correct passwords from the correct address', async () => {
    //     // 1. Create the transfer
    //     await  remittance.createTransfer(recivingAcc, pass1, pass2, duration, { from: creatorAcc, value: amount });
    //     // 2. The recipient withdraw the transfer
    //     result = await remittance.withdrawFunds.call(pass1, pass2, { from: recivingAcc });
    //     assert.isTrue(result, 'the transfer withdraw fail with correct inputs');
    // });
    //
    //
    // it('can\'t withdraw funds with empty passwords from the correct address', async () => {
    //     try {
    //         await remittance.createTransfer(recivingAcc, pass1, pass2, duration, { value: amount });
    //         let result = await remittance.withdrawFunds.call('', '', { from: recivingAcc });
    //         assert.fail(result, true, 'can\'t withdraw successfully with empty passwords');
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('can\'t withdraw funds with wrong passwords from the correct address', async () => {
    //     try {
    //         await remittance.createTransfer(recivingAcc, pass1, pass2, duration, { value: amount });
    //         let result = await remittance.withdrawFunds.call(wrongPass1, wrongPass2, { from: recivingAcc });
    //         assert.fail(result, true, 'can\'t withdraw successfully with wrong passwords');
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('can\'t withdraw funds with correct passwords from another address', async () => {
    //     try {
    //         await remittance.createTransfer(recivingAcc, pass1, pass2, duration, { value: amount });
    //         let result = await remittance.withdrawFunds.call(pass1, pass2, { from: otherAcc });
    //         assert.fail(result, true, 'can withdraw successfully from wrong address');
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });


    // // TODO: need fixes
    // // it('can revert funds with correct passwords from correct address when deadline is expired', async () => {
    // // });
    //
    //
    // it('can\'t revert funds with correct passwords from correct address when deadline isn\'t expired', async () => {
    //     await remittance.createTransfer(recivingAcc, pass1, pass2, { from: creatorAcc, value: amount });
    //     try {
    //         result = await remittance.refundTransfer.call(pass1, pass2, { from: creatorAcc } );
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('other addresses than creator address can\'t refund transfer with correct passwords', async () => {
    //
    //     try {
    //         await remittance.createTransfer(recivingAcc, pass1, pass2, { from: creatorAcc, value: amount });
    //         result = await remittance.refundTransfer.call(pass1, pass2, { from: notCreatorAcc } );
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('creator address can\'t refund transfer with wrong passwords', async () => {
    //     try {
    //         await remittance.createTransfer(recivingAcc, pass1, pass2, { from: creatorAcc, value: amount });
    //         result = await remittance.refundTransfer.call(wrongPass1, pass2, { from: creatorAcc } );
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });
    //
    //
    // it('owner can kill the contract', async () => {
    //     let result = await remittance.killTheContract();
    //     // check if LogSelfDestruct event is fire before selfdestruct()
    //     assert.equal(result.logs[0].event, 'LogSelfDestruct');
    // });
    //
    //
    // it('not owner can\'t kill the contract', async () => {
    //     try {
    //         res = await remittance.killTheContract({ from: otherAcc });
    //     }
    //     catch(err) {
    //         assert.include(err.message, 'revert');
    //     }
    // });

})
