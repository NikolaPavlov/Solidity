require('babel-register');
require('babel-polyfill');

var RemittanceContract = artifacts.require('Remittance.sol');
var ExchangeContract = artifacts.require('Exchange.sol');

module.exports = function(deployer) {
    deployer.deploy(RemittanceContract);
    deployer.deploy(ExchangeContract);
}
