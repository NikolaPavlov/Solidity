const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Remittance = artifacts.require('./Remittance.sol');

const mineOneBlock = async () => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: 0,
    })
}


contract('Remittance', accounts => {
    const pass1 = 'pass1';
    const pass2 = 'pass2';
    const wrongPass1 = 'wrongpass1';
    const wrongPass2 = 'wrongpass2';
    const duration = 2; // blocks
    const overDuration = 3;
    const amount = 1000; // wei
    const creatorAcc = accounts[0];
    const recivingAcc = accounts[1];
    const randomAcc = accounts[3];

    beforeEach('beforeEach', async function () {
        this.remittance = await Remittance.new({from: creatorAcc});
    });


    describe('create transfer with correct input data', function () {
        it('starting balance of the contract should be 0', async function () {
            let balance = await this.remittance.checkContractBalance();
            assert.equal(balance.toNumber(), 0, 'starting balance is not 0');
        });


        it('successfully create transfer with correct data', async function () {
            await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
        });
    });


    describe('can\'t create transfer with wrong input data', function () {
        it('can\'t create transfer with zero value eth', async function () {
            await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {value: 0}).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with empty value eth', async function () {
            await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with recipient same as creator of the transfer', async function () {
            await this.remittance.createTransfer.call(creatorAcc, pass1, pass2, duration, {value: amount}).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with duration > maxduration', async function () {
            await this.remittance.createTransfer.call(creatorAcc, pass1, pass2, overDuration, {value: amount}).should.be.rejectedWith('revert');
        });


        it('can\'t create same transfer twice', async function () {
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.rejectedWith('revert');
        });
    });


    describe('withdraw funds', function () {
        it('can withdraw funds with correct passwords from the correct address', async function () {
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
            await this.remittance.withdrawFunds.call(pass1, pass2, {from: recivingAcc}).should.be.fulfilled;
        });


        it('can\'t withdraw funds with empty passwords from the correct address', async function () {
            await this.remittance.withdrawFunds.call('', '', {from: recivingAcc}).should.be.rejectedWith('revert');
        });


        it('can\'t withdraw funds with wrong passwords from the correct address', async function () {
            await this.remittance.withdrawFunds.call(wrongPass1, wrongPass2, {from: recivingAcc}).should.be.rejectedWith('revert');
        });


        it('can\'t withdraw funds with correct passwords from random address', async function ()  {
            await this.remittance.withdrawFunds.call(pass1, pass2, {from: randomAcc}).should.be.rejectedWith('revert');
        });


        it('can revert funds with correct passwords from correct address when deadline is expired', async function () {
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
            mineOneBlock();
            mineOneBlock();
            await this.remittance.refundTransfer.call(pass1, pass2, recivingAcc, {from: creatorAcc}).should.be.fulfilled;
        });


        it('can\'t revert funds with correct passwords from correct address when deadline isn\'t expired', async function () {
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {value: amount}).should.be.fulfilled;
            mineOneBlock();
            await this.remittance.refundTransfer(pass1, pass2, recivingAcc, {from: creatorAcc}).should.be.rejectedWith('revert');
        });


        it('other addresses than creator address can\'t refund transfer with correct passwords when deadline is expired', async function () {
            await this.remittance.createTransfer.call(recivingAcc, pass1, pass2, duration, {from:creatorAcc, value: amount}).should.be.fulfilled;
            mineOneBlock();
            mineOneBlock();
            await this.remittance.refundTransfer.call(pass1, pass2, recivingAcc, {from: randomAcc}).should.be.rejectedWith('revert');
        });


        it('creator address can\'t refund transfer with wrong passwords', async function () {
            await this.remittance.createTransfer(recivingAcc, pass1, pass2, duration, {from: creatorAcc, value: amount}).should.be.fulfilled;
            mineOneBlock();
            mineOneBlock();
            await this.remittance.refundTransfer.call(wrongPass1, wrongPass2, recivingAcc, {from: creatorAcc} ).should.be.rejectedWith('revert');
        });
    });


    describe('kill the contract', function () {
        it('owner can kill the contract', async function () {
            let result = await this.remittance.killTheContract();
            // check if LogSelfDestruct event is fire before selfdestruct()
            assert.equal(result.logs[0].event, 'LogSelfDestruct');
        });


        it('not owner can\'t kill the contract', async function () {
            await this.remittance.killTheContract({from: randomAcc}).should.be.rejectedWith('revert');
        });
    });
})
