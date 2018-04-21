import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import ether from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const LimeCoin = artifacts.require('./LimeCoin.sol');
const LimeCoinCrowdsale = artifacts.require('./LimeCoinCrowdsale.sol');


contract('Test LimeCoinCrowdsale', accounts => {

    const rate = new BigNumber(100);
    const value = ether(11);
    const expectedTokenAmount = rate.mul(value);
    const wallet = accounts[1]; // piggy bank acc
    const purchaser = accounts[2];
    const investor = accounts[3];


    before(async function() {
        await advanceBlock();
    });


    beforeEach('beforeEach', async function () {
        this.openingTime = latestTime() + duration.weeks(1);
        this.closingTime = this.openingTime + 86400 * 30; // 30days
        this.beforeEndTime = this.closingTime - duration.hours(1);
        this.afterClosingTime = this.closingTime + duration.seconds(1);

        this.limeCoin = await LimeCoin.new();
        this.limeCoinCrowdsale = await LimeCoinCrowdsale.new(this.openingTime, this.closingTime, rate, wallet, this.limeCoin.address);
        await this.limeCoin.transferOwnership(this.limeCoinCrowdsale.address);
    });


    describe('accepting payments', function () {
        it('can buy tokens when crowdsale is open', async function () {
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
        });


        it('can\'t buy tokens when crowdsale is closed', async function () {
            await increaseTimeTo(this.afterClosingTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
        });


        it('should forward funds to piggy bank wallet', async function () {
            const pre = web3.eth.getBalance(wallet);
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            const post = web3.eth.getBalance(wallet);
            post.minus(pre).should.be.bignumber.equal(value);
        });


        it('correctly assign weiRaised amount', async function () {
            await increaseTimeTo(this.openingTime + duration.days(15));
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let weiRaised = await this.limeCoinCrowdsale.weiRaised.call();
            weiRaised.should.be.bignumber.equal(value);
        });
    });


    describe('tokens operations', function () {
        it('should allow beneficiaries to withdraw tokens after crowdsale ends', async function () {
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await increaseTimeTo(this.afterClosingTime);
            await this.limeCoinCrowdsale.withdrawTokens.call({ from: investor }).should.be.fulfilled;
        });


        it('shouldn\'t allow beneficiaries to withdraw tokens before crowdsale ends', async function () {
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await this.limeCoinCrowdsale.withdrawTokens.call({ from: investor }).should.be.rejectedWith(EVMRevert);
        });
    });


    describe('rate tests', function () {
        it('rate test 1st week', async function () {
            await increaseTimeTo(this.openingTime + duration.days(1));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate.toNumber(), 500, 'rate should be 500');
        });


        it('rate test 1st week with contributed more than 10Eth', async function () {
            await increaseTimeTo(this.openingTime + duration.days(1));
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate.toNumber(), 300, 'rate should be 300');
        });


        it('rate test 2nd week', async function () {
            await increaseTimeTo(this.openingTime + duration.days(8));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate.toNumber(), 200, 'rate should be 200');
        });


        it('rate test 2nd week with contributed more than 30Eth', async function () {
            await increaseTimeTo(this.openingTime + duration.days(8));
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate.toNumber(), 150, 'rate should be 150');
        });


        it('rate test 3rd week', async function () {
            await increaseTimeTo(this.openingTime + duration.days(15));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate.toNumber(), 100, 'rate should be 100');
        });
    });


    describe('mint tokens', function () {
        it('can mint tokens before crowdsale opening', async function () {
            await increaseTimeTo(this.openingTime - duration.days(1));
            await this.limeCoinCrowdsale.mintTokensFor.call(investor, 100, { from: purchaser }).should.be.fulfilled;
        });


        it('can mint tokens when crowdsale is open', async function () {
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.mintTokensFor.call(investor, 100, { from: purchaser }).should.be.fulfilled;
        });


        it('can mint tokens after the crowdsale is over', async function () {
            await increaseTimeTo(this.afterClosingTime);
            await this.limeCoinCrowdsale.mintTokensFor.call(investor, 100, { from: purchaser }).should.be.fulfilled;
        });
    });

})
