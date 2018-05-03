import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';

const web3 = require('web3');

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Remittance = artifacts.require('./Remittance.sol');


contract('Remittance', accounts => {
    const pass1 = 'pass1';
    const pass2 = 'pass2';
    const passHash = web3.utils.soliditySha3(pass1, pass2);
    const wrongPass1 = 'wrongpass1';
    const wrongPass2 = 'wrongpass2';
    const duration = 2; // blocks
    const overDuration = Remittance.MAXDURATION + 1;
    const amount = ether(11);
    const creatorAcc = accounts[0];
    const recivingAcc = accounts[1];
    const randomAcc = accounts[3];

    beforeEach('beforeEach', async function () {
        this.remittance = await Remittance.new({from: creatorAcc});
    });


    describe('create transfer with correct input data', function () {
        it('successfully create transfer with correct data', async function () {
            await this.remittance.createTransfer.call(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
        });
    });


    describe('can\'t create transfer with wrong input data', function () {
        it('can\'t create transfer with zero value eth', async function () {
            await this.remittance.createTransfer.call(recivingAcc, passHash, duration, {value: 0}).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with recipient same as creator of the transfer', async function () {
            await this.remittance.createTransfer(creatorAcc, passHash, duration, {value: amount}).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with invalid recipient address', async function () {
            await this.remittance.createTransfer('', passHash, duration, {value: amount}).should.be.rejectedWith('revert');
        });


        it('can\'t create transfer with duration > maxduration', async function () {
            await this.remittance.createTransfer.call(recivingAcc, passHash, overDuration, {value: amount}).should.be.rejectedWith('revert');
        });


        it('can\'t create same transfer twice', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.rejectedWith('revert');
        });
    });


    describe('withdraw funds', function () {
        it('can withdraw funds with correct passwords from the correct address', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount, from: creatorAcc}).should.be.fulfilled;
            await this.remittance.withdrawFunds.call(creatorAcc, pass1, pass2, {from: recivingAcc}).should.be.fulfilled;
        });


        it('can\'t withdraw funds with wrong passwords from the correct address', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount, from: creatorAcc}).should.be.fulfilled;
            await this.remittance.withdrawFunds.call(creatorAcc, wrongPass1, wrongPass2, {from: recivingAcc}).should.be.rejectedWith('revert');
        });


        it('can\'t withdraw funds with correct passwords from random address', async function ()  {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount, from: creatorAcc}).should.be.fulfilled;
            await this.remittance.withdrawFunds.call(creatorAcc, pass1, pass2, {from: randomAcc}).should.be.rejectedWith('revert');
        });


        it('can revert funds with correct passwords from correct address when deadline is expired', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
            advanceBlock();
            advanceBlock();
            await this.remittance.refundTransfer(recivingAcc, passHash, {from: creatorAcc}).should.be.fulfilled;
        });


        it('can\'t revert funds with correct passwords from correct address when deadline isn\'t expired', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
            advanceBlock();
            await this.remittance.refundTransfer(recivingAcc, passHash, {from: creatorAcc}).should.be.rejectedWith('revert');
        });


        it('other addresses than creator address can\'t refund transfer with correct passwords when deadline is expired', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
            advanceBlock();
            advanceBlock();
            await this.remittance.refundTransfer(recivingAcc, passHash, {from: randomAcc}).should.be.rejectedWith('revert');
        });


        it('creator address can\'t refund transfer with wrong passwords', async function () {
            await this.remittance.createTransfer(recivingAcc, passHash, duration, {value: amount}).should.be.fulfilled;
            advanceBlock();
            advanceBlock();
            await this.remittance.refundTransfer(recivingAcc, wrongPass1, {from: creatorAcc}).should.be.rejectedWith('revert');
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
