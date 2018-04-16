// Allows us to use ES6 in our migrations and tests.
require('babel-register')
require('babel-polyfill')

const LimeCoinCrowdsale = artifacts.require('./LimeCoinCrowdsale.sol');
const LimeCoin = artifacts.require('./LimeCoin.sol');

module.exports = function(deployer, network, accounts) {
    const openingTime = 1523923200; // Tuesday, April 17, 2018 12:00:00 AM
    const closingTime = openingTime + 86400 * 30; // 30days
    const rate = new web3.BigNumber(100);
    const wallet = '0x8Cf8902cdf7E45B8857522718Ff7F8034dcD7dD0'; // piggy bank acc

    return deployer
        .then(() => {
            return deployer.deploy(LimeCoin);
        })
        .then(() => {
            return deployer.deploy(
                LimeCoinCrowdsale,
                openingTime,
                closingTime,
                rate,
                wallet,
                LimeCoin.address
            );
        })
        .then(() => {
            return LimeCoin.deployed();
        })
        .then(token => {
            return token.transferOwnership(LimeCoinCrowdsale.address);
        })
};
