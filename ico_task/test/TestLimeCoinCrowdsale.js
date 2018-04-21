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

// const LimcCoin = artifacts.require('./LimeCoin.sol');
const LimeCoin = artifacts.require('./LimeCoin.sol');
const LimeCoinCrowdsale = artifacts.require('./LimeCoinCrowdsale.sol');


contract('Test LimeCoinCrowdsale', accounts => {

    const rate = new BigNumber(100);
    const value = ether(11);
    const expectedTokenAmount = rate.mul(value);
    const wallet = accounts[1]; // piggy bank acc ?
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

    // // it('should accept contribution to buyTokens function', async function () {
    // //     let result = await this.limeCoinCrowdsale.buyTokens.call(this.investor, { value: 1000, from: purchaser });
    // //     console.log(result);
    // // });


    // it('should not immediately assign tokens to beneficiary', async function () {
    //     await increaseTimeTo(this.openingTime);
    //     await this.limeCoinCrowdsale.buyTokens(this.investor, { value: value, from: purchaser });
    //     const balance = await this.token.balanceOf(this.investor);
    //     balance.should.be.bignumber.equal(0);
    // });


    it('should not allow beneficiaries to withdraw tokens before crowdsale ends', async function () {
        await increaseTimeTo(this.beforeEndTime);
        await this.limeCoinCrowdsale.buyTokens.call(investor, { value: value, from: purchaser }).should.be.fulfilled;
        await this.limeCoinCrowdsale.withdrawTokens.call({ from: investor }).should.be.rejectedWith(EVMRevert);
    });


    // TODO: fix
    // it('should allow beneficiaries to withdraw tokens after crowdsale ends', async function () {
    //     await increaseTimeTo(this.openingTime);
    //     console.log(latestTime());
    //     let r1 = await this.limeCoinCrowdsale.buyTokens.call(investor, { value: value, from: purchaser });
    //     console.log(r1);
    //     await increaseTimeTo(this.afterClosingTime);
    //     console.log(latestTime());
        // let r2 = await this.limeCoinCrowdsale.withdrawTokens.call({ from: investor });
        // console.log(r2);
    // });


    describe('accepting payments', function () {
        it('should accept payments', async function () {
            // await this.limeCoinCrowdsale.send(value).should.be.fulfilled;
            await increaseTimeTo(this.beforeEndTime);
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
        });
    });


    // TODO: fix
    // it('should assign tokens to beneficiary', async function () {
    //     await increaseTimeTo(this.beforeEndTime);
    //     await this.limeCoinCrowdsale.buyTokens.call(investor, { value: value, from: purchaser });
    //     const balance = await this.limeCoin.balanceOf(investor);
    //     console.log(balance.toString());
        // balance.should.be.bignumber.equal(expectedTokenAmount);
    // });


    // TODO: fix
    // it('should forward funds to wallet', async function () {
    //   const pre = web3.eth.getBalance(wallet);
    //   await this.limeCoinCrowdsale.buyTokens(investor, { value, from: purchaser });
    //   const post = web3.eth.getBalance(wallet);
    //   post.minus(pre).should.be.bignumber.equal(value);
    // });


    describe('rate tests', function () {
        it('rate test 1st week', async function () {
            await increaseTimeTo(this.openingTime + duration.days(1));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate, 500, 'rate should be 500');
        });

        it('rate test 1st week with contributed more than 10Eth', async function () {
            await increaseTimeTo(this.openingTime + duration.days(1));
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate, 300, 'rate should be 300');
        });

        it('rate test 2nd week', async function () {
            await increaseTimeTo(this.openingTime + duration.weeks(2));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate, 200, 'rate should be 200');
        });

        it('rate test 2nd week with contributed more than 30Eth', async function () {
            await increaseTimeTo(this.openingTime + duration.weeks(2));
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            await this.limeCoinCrowdsale.buyTokens(investor, { value: value, from: purchaser });
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate, 150, 'rate should be 150');
        });

        it('rate test 3rd week', async function () {
            await increaseTimeTo(this.openingTime + duration.weeks(3));
            let rate = await this.limeCoinCrowdsale.getCurrentRate.call();
            assert.equal(rate, 100, 'rate should be 100');
        });
    });


    describe('mint tokens', function () {
        it('Can mint tokens', async function () {
            await increaseTimeTo(this.openingTime + duration.weeks(1));
            let r1 = await this.limeCoinCrowdsale.mintTokensFor.call(investor, 100, { from: accounts[0] });
            console.log(r1);
        })
    })





    // TODO:
    //     - mint tokens test
    //     - cant buy tokens after end time
    //     - has closed is true after endtime
    //     - check correctnes of weiRaised

})
