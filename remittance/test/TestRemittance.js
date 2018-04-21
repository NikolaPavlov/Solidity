import testHelper from './helpers';
import EVMRevert from './EVMRevert';

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
    const duration = 2;
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
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: amount});
    });

    it('starting balance of the contract should be 0', async function () {
        let balance = await this.remittance.checkContractBalance();
        assert.equal(balance.toNumber(), 0, 'starting balance is not 0');
    });

    it('successfully create transfer with correct data', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
    });

    // TODO: quickfix
    it('can\'t create transfer with zero value eth', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: 1}).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create transfer with empty value eth', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create transfer with transferRecipient == msg.sender', async function () {
        await this.remittance.createTransfer.call(creatorAcc, pass1, pass2, duration, { value: amount }).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create transfer with duration > MAXDURATION', async function () {
        await this.remittance.createTransfer.call(creatorAcc, pass1, pass2, 99999999, { value: amount }).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t create same transfer twice', async function () {
        await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, { value: amount }).should.be.fulfilled;
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, { value: amount }).should.be.rejectedWith(EVMRevert);
    });


    it('can withdraw funds with correct passwords from the correct address', async function () {
        await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, { value: amount }).should.be.fulfilled;
        await this.remittance.withdrawFunds.call(pass1, pass2, { from: recivingAcc }).should.be.fulfilled;
    });


    it('can\'t withdraw funds with empty passwords from the correct address', async function () {
        await this.remittance.withdrawFunds.call('', '', { from: recivingAcc }).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t withdraw funds with wrong passwords from the correct address', async function () {
        await this.remittance.withdrawFunds.call(wrongPass1, wrongPass2, { from: recivingAcc }).should.be.rejectedWith(EVMRevert);
    });


    it('can\'t withdraw funds with correct passwords from another address', async function ()  {
        await this.remittance.withdrawFunds.call(pass1, pass2, { from: otherAcc }).should.be.rejectedWith(EVMRevert);
    });


    // TODO: need fixes
    it('can revert funds with correct passwords from correct address when deadline is expired', async function () {
        await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
        mineOneBlock();
        mineOneBlock();
        await this.remittance.refundTransfer.call(pass1, pass2, { from: creatorAcc }).should.be.fulfilled;
    });


    it('can\'t revert funds with correct passwords from correct address when deadline isn\'t expired', async function () {
        await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
        mineOneBlock();
        await this.remittance.refundTransfer(pass1, pass2, { from: creatorAcc }).should.be.rejectedWith(EVMRevert);
    });


    it('other addresses than creator address can\'t refund transfer with correct passwords when deadline is expired', async function () {
        await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, { from:creatorAcc, value: amount }).should.be.fulfilled;
        await this.remittance.refundTransfer.call(pass1, pass2, { from: otherAcc } ).should.be.rejectedWith(EVMRevert);
    });


    it('creator address can\'t refund transfer with wrong passwords', async function () {
        await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, { from: creatorAcc, value: amount }).should.be.fulfilled;
        mineOneBlock();
        mineOneBlock();
        await this.remittance.refundTransfer.call(wrongPass1, wrongPass2, { from: creatorAcc } ).should.be.rejectedWith(EVMRevert);
    });


    it('owner can kill the contract', async function () {
        let result = await this.remittance.killTheContract();
        // check if LogSelfDestruct event is fire before selfdestruct()
        assert.equal(result.logs[0].event, 'LogSelfDestruct');
    });


    it('not owner can\'t kill the contract', async function () {
        await this.remittance.killTheContract({ from: otherAcc }).should.be.rejectedWith(EVMRevert);
    });

})
