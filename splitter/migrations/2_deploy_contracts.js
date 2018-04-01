var SplitterContract = artifacts.require("Splitter.sol");

module.exports = function(deployer) {
  deployer.deploy(SplitterContract);
};
