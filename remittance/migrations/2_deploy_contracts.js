require('babel-register');
require('babel-polyfill');

var RemittanceContract = artifacts.require('Remittance.sol');

module.exports = function(deployer) {
    var duration = 1000;
    deployer.deploy(RemittanceContract, duration);
}
