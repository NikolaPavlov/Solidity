var Splitter = artifacts.require("./Splitter.sol");
var assert = require('chai').assert;

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('Splitter async', accounts => {
    const creator = accounts[0];
    const evenValue = 10000 // wei
    const oddValue = 10001 // wei
    const outputAcc1 = accounts[1];
    const outputAcc2 = accounts[2];
    const senderAcc = accounts[3];
    const randomAcc = accounts[4];

    beforeEach('should deploy a new Splitter contract', async function () {
        this.splitter = await Splitter.new({ from: creator })
    })


    describe('test split with correct input', function () {
        it('starting balance of the contract should be 0', async function () {
            let balance = await this.splitter.checkContractBalance();
            assert.equal(balance.toNumber(), 0, 'starting balance is not 0');
        });


        it('successfully split transaction with even incoming amount', async function () {
            let acc1BalanceBefore = web3.eth.getBalance(outputAcc1);
            let acc2BalanceBefore = web3.eth.getBalance(outputAcc2);

            await this.splitter.split(outputAcc1, outputAcc2, { from: creator, value: evenValue });

            let acc1BalanceAfter = web3.eth.getBalance(outputAcc1);
            let acc2BalanceAfter = web3.eth.getBalance(outputAcc2);

            let halfValue = new BigNumber(evenValue / 2);
            acc1BalanceAfter.should.be.bignumber.equal(acc1BalanceBefore.plus(halfValue));
        })


        // TODO: fix need to check for 1 wei return to sender
        it('successfully split transaction with odd incoming amount', async function () {
            let acc1BalanceBefore = web3.eth.getBalance(outputAcc1);
            let acc2BalanceBefore = web3.eth.getBalance(outputAcc2);

            await this.splitter.split(outputAcc1, outputAcc2, { from: creator, value: oddValue });

            let acc1BalanceAfter = web3.eth.getBalance(outputAcc1);
            let acc2BalanceAfter = web3.eth.getBalance(outputAcc2);

            let halfValue = new BigNumber(evenValue / 2);
            acc1BalanceAfter.should.be.bignumber.equal(acc1BalanceBefore.plus(halfValue));
        })
    });


    describe('test split with incorect inputs', function () {
        it('should not allow split with 0 value in the transaction', async function () {
            await this.splitter.split(outputAcc1, outputAcc2, { value: 0 }).should.be.rejectedWith('revert');
        })


        it('should not allow split with empty value in the transaction', async function () {
            await this.splitter.split(outputAcc1, outputAcc2).should.be.rejectedWith('revert');
        })


        it('should not allow split with sender account is one of the output accounts', async function () {
            await this.splitter.split(senderAcc, outputAcc2, {value: evenValue, from: senderAcc}).should.be.rejectedWith('revert');
        })


        it('should not allow split to same output addresses', async function () {
            await this.splitter.split(outputAcc1, outputAcc1, {value: evenValue, from: senderAcc}).should.be.rejectedWith('revert');
        })


        it('should not allow split when one of the two ouput addresses is missing', async function () {
            errMsg = 'Invalid number of arguments to Solidity function';
            await this.splitter.split(outputAcc1, {value: evenValue, from: senderAcc}).should.be.rejectedWith(errMsg);
        })
    });


    describe('test kill switch', function () {
        it('owner can kill the contract', async function () {
            let result = await this.splitter.killTheContract({from: creator});
            // check if LogSelfDestruct event is fire before selfdestruct()
            assert.equal(result.logs[0].event, 'LogSelfDestruct');
        });


        it('not owner can\'t kill the contract', async function () {
            await this.splitter.killTheContract({ from: randomAcc }).should.be.rejectedWith('revert');
        });
    });

})
