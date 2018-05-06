require('babel-register');
require('babel-polyfill');

var RemittanceContract = artifacts.require('Remittance.sol');

module.exports = function(deployer) {
    deployer.deploy(RemittanceContract);
}
